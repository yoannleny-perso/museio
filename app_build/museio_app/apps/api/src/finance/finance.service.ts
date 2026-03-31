import {
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common";
import {
  addToAgingBuckets,
  addToForecastBuckets,
  allocateTaxFromPayment,
  buildForecastBuckets,
  computeOverdueDays,
  createEmptyAgingBuckets,
  dateInWindow,
  formatFinanceWindowLabel,
  getExportMimeType,
  getFinanceDefaults,
  getReserveTargetMinor,
  getTaxPayableMinor,
  resolveReportWindow,
  resolveTaxWindow
} from "@museio/domain";
import type {
  AtoReadyChecklist,
  FinanceExportInput,
  FinanceExportPayload,
  FinanceInvoiceLedgerEntry,
  FinancePaymentLedgerEntry,
  FinanceTaxProfile,
  FinanceWorkspaceFilters,
  FinanceWorkspaceState,
  InvoiceCollectionMode,
  InvoiceStatus,
  StripeConnectedAccountState,
  TaxReportingMethod,
  UpdateFinanceTaxProfileInput
} from "@museio/types";
import {
  financeExportInputSchema,
  financeWorkspaceFiltersSchema,
  updateFinanceTaxProfileInputSchema
} from "@museio/validation";
import { SupabaseService } from "../supabase/supabase.service";

interface JobRow {
  id: string;
  creator_user_id: string;
  client_id: string;
  requester_name_snapshot: string;
}

interface ClientRow {
  id: string;
  creator_user_id: string;
  display_name: string;
}

interface QuoteRow {
  id: string;
  creator_user_id: string;
  job_id: string;
  status: string;
  total_minor: number;
}

interface InvoiceRow {
  id: string;
  creator_user_id: string;
  job_id: string;
  invoice_number: string;
  title: string;
  status: InvoiceStatus;
  collection_mode: InvoiceCollectionMode;
  currency_code: string;
  total_minor: number;
  tax_minor: number;
  amount_paid_minor: number;
  amount_due_minor: number;
  deposit_amount_minor: number;
  balance_amount_minor: number;
  issue_at: string | null;
  sent_at: string | null;
  due_date: string | null;
}

interface PaymentRow {
  id: string;
  creator_user_id: string;
  invoice_id: string;
  job_id: string;
  phase: "full" | "deposit" | "balance";
  amount_minor: number;
  currency_code: string;
  status: FinancePaymentLedgerEntry["status"];
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

interface StripeAccountRow {
  creator_user_id: string;
  stripe_account_id: string | null;
  status: StripeConnectedAccountState["status"];
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  dashboard_url: string | null;
  updated_at: string;
}

interface TaxProfileRow {
  creator_user_id: string;
  country_code: "AU";
  currency_code: string;
  gst_registered: boolean;
  gst_number: string | null;
  gst_rate_basis_points: number;
  reporting_method: TaxReportingMethod;
  reserve_rate_basis_points: number;
  ato_ready_checklist: AtoReadyChecklist;
  updated_at: string;
}

@Injectable()
export class FinanceService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getWorkspace(
    query: FinanceWorkspaceFilters,
    accessToken?: string | null
  ) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const filters = {
      ...getFinanceDefaults(),
      ...financeWorkspaceFiltersSchema.parse(query)
    } satisfies FinanceWorkspaceState["filters"];
    const reportWindow = resolveReportWindow(filters);
    const taxWindow = resolveTaxWindow(filters);

    const [jobs, clients, quotes, invoices, payments, stripe, taxProfile] = await Promise.all([
      this.fetchJobs(user.id),
      this.fetchClients(user.id),
      this.fetchQuotes(user.id),
      this.fetchInvoices(user.id),
      this.fetchPayments(user.id),
      this.fetchStripeState(user.id),
      this.fetchOrCreateTaxProfile(user.id)
    ]);

    const clientNameByJobId = this.buildClientNameMap(jobs, clients);
    const invoiceById = new Map(invoices.map((invoice) => [invoice.id, invoice]));
    const invoiceByJobId = new Map(invoices.map((invoice) => [invoice.job_id, invoice]));
    const paymentLedger = this.mapPaymentLedger(payments, invoiceById, clientNameByJobId);
    const invoiceLedger = this.mapInvoiceLedger(invoices, paymentLedger, clientNameByJobId);

    const collectedPayments = paymentLedger.filter(
      (payment) => payment.status === "succeeded" && dateInWindow(payment.paidAt, reportWindow)
    );
    const invoicesInWindow = invoices.filter((invoice) =>
      dateInWindow(invoice.issue_at ?? invoice.sent_at ?? undefined, reportWindow)
    );
    const openInvoiceLedger = invoiceLedger.filter(
      (invoice) => invoice.amountDueMinor > 0 && !["void", "declined"].includes(invoice.status)
    );
    const overdueInvoiceLedger = invoiceLedger.filter((invoice) => invoice.isOverdue);
    const acceptedQuotePipelineMinor = quotes
      .filter((quote) => quote.status === "accepted" && !invoiceByJobId.has(quote.job_id))
      .reduce((sum, quote) => sum + quote.total_minor, 0);

    const overview = {
      currencyCode: taxProfile.currencyCode,
      totalCollectedMinor: collectedPayments.reduce((sum, payment) => sum + payment.amountMinor, 0),
      totalInvoicedMinor: invoicesInWindow.reduce((sum, invoice) => sum + invoice.total_minor, 0),
      receivablesMinor: openInvoiceLedger.reduce((sum, invoice) => sum + invoice.amountDueMinor, 0),
      overdueMinor: overdueInvoiceLedger.reduce((sum, invoice) => sum + invoice.amountDueMinor, 0),
      depositsCollectedMinor: collectedPayments
        .filter((payment) => payment.phase === "deposit")
        .reduce((sum, payment) => sum + payment.amountMinor, 0),
      balancesOutstandingMinor: openInvoiceLedger
        .filter((invoice) => invoice.collectionMode === "deposit-and-balance")
        .reduce((sum, invoice) => sum + invoice.balanceAmountMinor, 0),
      acceptedQuotePipelineMinor,
      invoiceCount: invoices.length,
      paymentCount: payments.length
    };

    const receivables = {
      currencyCode: taxProfile.currencyCode,
      openInvoiceCount: openInvoiceLedger.length,
      draftInvoiceCount: invoiceLedger.filter((invoice) => invoice.status === "draft").length,
      dueSoonInvoiceCount: invoiceLedger.filter((invoice) => {
        if (!invoice.dueDate || invoice.amountDueMinor <= 0) {
          return false;
        }

        const dueTime = new Date(invoice.dueDate).getTime();
        const nowTime = Date.now();
        return dueTime >= nowTime && dueTime <= nowTime + 14 * 86400000;
      }).length,
      receivablesMinor: openInvoiceLedger.reduce((sum, invoice) => sum + invoice.amountDueMinor, 0),
      depositsOutstandingMinor: openInvoiceLedger
        .filter(
          (invoice) =>
            invoice.collectionMode === "deposit-and-balance" &&
            ["deposit-requested"].includes(invoice.status)
        )
        .reduce((sum, invoice) => sum + invoice.depositAmountMinor, 0),
      balancesOutstandingMinor: openInvoiceLedger
        .filter((invoice) => invoice.collectionMode === "deposit-and-balance")
        .reduce((sum, invoice) => sum + invoice.balanceAmountMinor, 0)
    };

    const agingBuckets = createEmptyAgingBuckets();
    for (const invoice of invoiceLedger) {
      addToAgingBuckets(agingBuckets, invoice.overdueDays, invoice.amountDueMinor);
    }

    const forecastBuckets = buildForecastBuckets({
      mode: filters.forecastMode,
      from: new Date()
    });

    for (const invoice of openInvoiceLedger) {
      addToForecastBuckets(
        forecastBuckets,
        invoice.dueDate ?? invoice.sentAt ?? invoice.issueAt,
        "committedMinor",
        invoice.amountDueMinor
      );
    }

    for (const quote of quotes) {
      if (quote.status !== "accepted" || invoiceByJobId.has(quote.job_id)) {
        continue;
      }

      const relatedJob = jobs.find((job) => job.id === quote.job_id);
      addToForecastBuckets(
        forecastBuckets,
        relatedJob ? new Date().toISOString() : new Date().toISOString(),
        "pipelineMinor",
        quote.total_minor
      );
    }

    const taxSummary = this.buildTaxSummary({
      taxProfile,
      taxWindow,
      invoices,
      payments
    });

    return {
      filters,
      reportWindow,
      taxWindow,
      overview,
      receivables,
      overdue: {
        currencyCode: taxProfile.currencyCode,
        overdueInvoiceCount: overdueInvoiceLedger.length,
        overdueMinor: overdueInvoiceLedger.reduce((sum, invoice) => sum + invoice.amountDueMinor, 0),
        buckets: agingBuckets
      },
      forecast: {
        currencyCode: taxProfile.currencyCode,
        mode: filters.forecastMode,
        inclusionRule:
          "Committed forecast uses open invoice due dates. Pipeline forecast uses accepted quotes that do not yet have invoices.",
        committedMinor: forecastBuckets.reduce((sum, bucket) => sum + bucket.committedMinor, 0),
        pipelineMinor: forecastBuckets.reduce((sum, bucket) => sum + bucket.pipelineMinor, 0),
        totalMinor: forecastBuckets.reduce((sum, bucket) => sum + bucket.totalMinor, 0),
        buckets: forecastBuckets
      },
      taxProfile,
      taxSummary,
      stripe,
      invoiceLedger,
      paymentLedger,
      emptyStateReason:
        invoices.length === 0 && quotes.length === 0
          ? "No invoices, payments, or accepted quote pipeline exist yet."
          : undefined
    } satisfies FinanceWorkspaceState;
  }

  async updateTaxProfile(
    payload: UpdateFinanceTaxProfileInput,
    accessToken?: string | null
  ) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const parsed = updateFinanceTaxProfileInputSchema.parse(payload);

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("finance_tax_profiles")
      .upsert({
        creator_user_id: user.id,
        country_code: "AU",
        currency_code: "AUD",
        gst_registered: parsed.gstRegistered,
        gst_number: parsed.gstNumber?.trim() || null,
        gst_rate_basis_points: parsed.gstRateBasisPoints,
        reporting_method: parsed.reportingMethod,
        reserve_rate_basis_points: parsed.reserveRateBasisPoints,
        ato_ready_checklist: parsed.atoReadyChecklist
      });

    if (error) {
      throw new InternalServerErrorException(
        `Could not save the finance tax profile: ${error.message}`
      );
    }

    return this.getWorkspace({}, accessToken);
  }

  async exportWorkspace(
    query: FinanceExportInput,
    accessToken?: string | null
  ) {
    const parsed = financeExportInputSchema.parse(query);
    const state = await this.getWorkspace(parsed, accessToken);
    const generatedAt = new Date().toISOString();
    const fileDate = generatedAt.slice(0, 10);

    if (parsed.format === "json") {
      return {
        format: "json",
        filename: `finance-report-${fileDate}.json`,
        mimeType: getExportMimeType("json"),
        content: JSON.stringify(state, null, 2),
        generatedAt
      } satisfies FinanceExportPayload;
    }

    const rows = [
      ["section", "id", "client", "status", "issue_at", "due_date", "total_minor", "amount_paid_minor", "amount_due_minor", "tax_minor"],
      ...state.invoiceLedger.map((invoice) => [
        "invoice",
        invoice.invoiceNumber,
        invoice.clientName,
        invoice.status,
        invoice.issueAt ?? "",
        invoice.dueDate ?? "",
        String(invoice.totalMinor),
        String(invoice.amountPaidMinor),
        String(invoice.amountDueMinor),
        String(invoice.taxMinor)
      ]),
      ...state.paymentLedger.map((payment) => [
        "payment",
        payment.id,
        payment.clientName,
        payment.status,
        payment.paidAt ?? payment.createdAt,
        "",
        String(payment.amountMinor),
        String(payment.amountMinor),
        "0",
        "0"
      ])
    ];

    return {
      format: "csv",
      filename: `finance-report-${fileDate}.csv`,
      mimeType: getExportMimeType("csv"),
      content: rows
        .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
        .join("\n"),
      generatedAt
    } satisfies FinanceExportPayload;
  }

  private async fetchJobs(creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("jobs")
      .select("id, creator_user_id, client_id, requester_name_snapshot")
      .eq("creator_user_id", creatorUserId);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as JobRow[];
  }

  private async fetchClients(creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("clients")
      .select("id, creator_user_id, display_name")
      .eq("creator_user_id", creatorUserId);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as ClientRow[];
  }

  private async fetchQuotes(creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("quote_drafts")
      .select("id, creator_user_id, job_id, status, total_minor")
      .eq("creator_user_id", creatorUserId);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as QuoteRow[];
  }

  private async fetchInvoices(creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("invoices")
      .select("*")
      .eq("creator_user_id", creatorUserId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as InvoiceRow[];
  }

  private async fetchPayments(creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("payment_records")
      .select("*")
      .eq("creator_user_id", creatorUserId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as PaymentRow[];
  }

  private async fetchStripeState(creatorUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("stripe_connected_accounts")
      .select("*")
      .eq("creator_user_id", creatorUserId)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (!data) {
      return {
        creatorUserId,
        status: "not-connected",
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false
      } satisfies StripeConnectedAccountState;
    }

    const row = data as StripeAccountRow;
    return {
      creatorUserId: row.creator_user_id,
      accountId: row.stripe_account_id ?? undefined,
      status: row.status,
      chargesEnabled: row.charges_enabled,
      payoutsEnabled: row.payouts_enabled,
      detailsSubmitted: row.details_submitted,
      dashboardUrl: row.dashboard_url ?? undefined,
      updatedAt: row.updated_at
    } satisfies StripeConnectedAccountState;
  }

  private async fetchOrCreateTaxProfile(creatorUserId: string): Promise<FinanceTaxProfile> {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("finance_tax_profiles")
      .select("*")
      .eq("creator_user_id", creatorUserId)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (!data) {
      const { error: insertError } = await this.supabaseService
        .getAdminClient()
        .from("finance_tax_profiles")
        .insert({
          creator_user_id: creatorUserId
        });

      if (insertError) {
        throw new InternalServerErrorException(insertError.message);
      }

      return this.fetchOrCreateTaxProfile(creatorUserId);
    }

    const row = data as TaxProfileRow;

    return {
      creatorUserId: row.creator_user_id,
      countryCode: row.country_code,
      currencyCode: row.currency_code,
      gstRegistered: row.gst_registered,
      gstNumber: row.gst_number ?? undefined,
      gstRateBasisPoints: row.gst_rate_basis_points,
      reportingMethod: row.reporting_method,
      reserveRateBasisPoints: row.reserve_rate_basis_points,
      atoReadyChecklist: row.ato_ready_checklist,
      updatedAt: row.updated_at
    } satisfies FinanceTaxProfile;
  }

  private buildClientNameMap(jobs: JobRow[], clients: ClientRow[]) {
    const clientsById = new Map(clients.map((client) => [client.id, client.display_name]));
    const map = new Map<string, string>();

    for (const job of jobs) {
      map.set(job.id, clientsById.get(job.client_id) ?? job.requester_name_snapshot);
    }

    return map;
  }

  private mapInvoiceLedger(
    invoices: InvoiceRow[],
    payments: FinancePaymentLedgerEntry[],
    clientNameByJobId: Map<string, string>
  ) {
    const lastPaymentByInvoiceId = new Map<string, string>();

    for (const payment of payments) {
      if (!payment.paidAt) {
        continue;
      }

      const current = lastPaymentByInvoiceId.get(payment.invoiceId);

      if (!current || new Date(payment.paidAt) > new Date(current)) {
        lastPaymentByInvoiceId.set(payment.invoiceId, payment.paidAt);
      }
    }

    return invoices.map((invoice) => {
      const dueDate = invoice.due_date ?? undefined;
      const overdueDays =
        invoice.amount_due_minor > 0 ? computeOverdueDays(dueDate, new Date()) : 0;

      return {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoice_number,
        jobId: invoice.job_id,
        clientName: clientNameByJobId.get(invoice.job_id) ?? "Unknown Client",
        title: invoice.title,
        status: invoice.status,
        collectionMode: invoice.collection_mode,
        issueAt: invoice.issue_at ?? undefined,
        sentAt: invoice.sent_at ?? undefined,
        dueDate,
        totalMinor: invoice.total_minor,
        amountPaidMinor: invoice.amount_paid_minor,
        amountDueMinor: invoice.amount_due_minor,
        depositAmountMinor: invoice.deposit_amount_minor,
        balanceAmountMinor: invoice.balance_amount_minor,
        taxMinor: invoice.tax_minor,
        lastPaymentAt: lastPaymentByInvoiceId.get(invoice.id),
        overdueDays,
        isOverdue:
          invoice.amount_due_minor > 0 &&
          overdueDays > 0 &&
          !["draft", "void", "declined", "paid"].includes(invoice.status)
      } satisfies FinanceInvoiceLedgerEntry;
    });
  }

  private mapPaymentLedger(
    payments: PaymentRow[],
    invoiceById: Map<string, InvoiceRow>,
    clientNameByJobId: Map<string, string>
  ) {
    return payments.map((payment) => {
      const invoice = invoiceById.get(payment.invoice_id);

      if (!invoice) {
        throw new NotFoundException(`Invoice ${payment.invoice_id} not found for payment ledger.`);
      }

      return {
        id: payment.id,
        creatorUserId: payment.creator_user_id,
        invoiceId: payment.invoice_id,
        jobId: payment.job_id,
        stripeCheckoutSessionId: payment.stripe_checkout_session_id ?? undefined,
        stripePaymentIntentId: payment.stripe_payment_intent_id ?? undefined,
        phase: payment.phase,
        amountMinor: payment.amount_minor,
        currencyCode: payment.currency_code,
        status: payment.status,
        paidAt: payment.paid_at ?? undefined,
        createdAt: payment.created_at,
        updatedAt: payment.updated_at,
        clientName: clientNameByJobId.get(payment.job_id) ?? "Unknown Client",
        invoiceNumber: invoice.invoice_number,
        invoiceStatus: invoice.status
      } satisfies FinancePaymentLedgerEntry;
    });
  }

  private buildTaxSummary(params: {
    taxProfile: FinanceTaxProfile;
    taxWindow: ReturnType<typeof resolveTaxWindow>;
    invoices: InvoiceRow[];
    payments: PaymentRow[];
  }) {
    const taxableInvoices = params.invoices.filter((invoice) =>
      dateInWindow(invoice.issue_at ?? invoice.sent_at ?? undefined, params.taxWindow)
    );
    const paidPayments = params.payments.filter(
      (payment) => payment.status === "succeeded" && dateInWindow(payment.paid_at ?? undefined, params.taxWindow)
    );
    const invoiceById = new Map(params.invoices.map((invoice) => [invoice.id, invoice]));

    const taxableSalesMinor =
      params.taxProfile.reportingMethod === "accrual"
        ? taxableInvoices.reduce((sum, invoice) => sum + (invoice.total_minor - invoice.tax_minor), 0)
        : paidPayments.reduce((sum, payment) => {
            const invoice = invoiceById.get(payment.invoice_id);

            if (!invoice) {
              return sum;
            }

            const paymentTax = allocateTaxFromPayment({
              paymentAmountMinor: payment.amount_minor,
              invoiceTaxMinor: invoice.tax_minor,
              invoiceTotalMinor: invoice.total_minor
            });

            return sum + (payment.amount_minor - paymentTax);
          }, 0);

    const gstCollectedMinor =
      params.taxProfile.reportingMethod === "accrual"
        ? taxableInvoices.reduce((sum, invoice) => sum + invoice.tax_minor, 0)
        : paidPayments.reduce((sum, payment) => {
            const invoice = invoiceById.get(payment.invoice_id);

            if (!invoice) {
              return sum;
            }

            return (
              sum +
              allocateTaxFromPayment({
                paymentAmountMinor: payment.amount_minor,
                invoiceTaxMinor: invoice.tax_minor,
                invoiceTotalMinor: invoice.total_minor
              })
            );
          }, 0);

    const gstOutstandingMinor = params.invoices
      .filter((invoice) => invoice.amount_due_minor > 0)
      .reduce((sum, invoice) => {
        if (invoice.total_minor <= 0 || invoice.tax_minor <= 0) {
          return sum;
        }

        return (
          sum +
          allocateTaxFromPayment({
            paymentAmountMinor: invoice.amount_due_minor,
            invoiceTaxMinor: invoice.tax_minor,
            invoiceTotalMinor: invoice.total_minor
          })
        );
      }, 0);

    return {
      currencyCode: params.taxProfile.currencyCode,
      gstRegistered: params.taxProfile.gstRegistered,
      reportingMethod: params.taxProfile.reportingMethod,
      taxableSalesMinor: params.taxProfile.gstRegistered ? taxableSalesMinor : 0,
      gstCollectedMinor: params.taxProfile.gstRegistered ? gstCollectedMinor : 0,
      gstOutstandingMinor: params.taxProfile.gstRegistered ? gstOutstandingMinor : 0,
      gstPayableMinor: getTaxPayableMinor({
        gstRegistered: params.taxProfile.gstRegistered,
        reportingMethod: params.taxProfile.reportingMethod,
        gstCollectedMinor
      }),
      reserveTargetMinor: getReserveTargetMinor({
        taxableSalesMinor,
        reserveRateBasisPoints: params.taxProfile.reserveRateBasisPoints
      }),
      taxWindowLabel: formatFinanceWindowLabel(params.taxWindow)
    };
  }
}
