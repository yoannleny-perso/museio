import { useCallback, useMemo, useState } from "react";
import { router } from "expo-router";
import { BarChart3, ChartColumnBig, Landmark, Wallet } from "lucide-react-native";
import { fetchFinanceWorkspace } from "../../../src/lib/api";
import { useProtectedData } from "../../../src/lib/use-protected-data";
import {
  ActionTile,
  AppScaffold,
  MetricGrid,
  SectionCard,
  SectionHeader,
  SegmentedTabs,
  StateCard,
  StatusBadge,
  formatMoney
} from "../../../src/ui/mobile-shell";

type FinanceTab = "overview" | "deposits" | "reports";

export default function FinanceScreen() {
  const loader = useCallback(
    (accessToken: string) =>
      fetchFinanceWorkspace(accessToken, {
        reportPreset: "last-30-days",
        taxPreset: "current-quarter",
        forecastMode: "monthly"
      }),
    []
  );
  const { state, isLoading, errorMessage } = useProtectedData(
    loader,
    "Could not load Finance."
  );
  const [activeTab, setActiveTab] = useState<FinanceTab>("overview");

  const currencyCode = state?.overview.currencyCode ?? "AUD";
  const depositSummary = useMemo(() => {
    if (!state) {
      return null;
    }

    const depositPayments = state.paymentLedger.filter((entry) => entry.phase === "deposit");
    const totalDeposits = depositPayments.reduce((sum, entry) => sum + entry.amountMinor, 0);
    const pendingBalances = state.invoiceLedger
      .filter((entry) => entry.balanceAmountMinor > 0)
      .reduce((sum, entry) => sum + entry.balanceAmountMinor, 0);

    return {
      totalDeposits,
      pendingBalances
    };
  }, [state]);

  if (isLoading) {
    return (
      <AppScaffold title="Finance" icon={ChartColumnBig} activeTab="finance">
        <StateCard title="Loading finance" body="Reconciling invoices, payments, and GST." />
      </AppScaffold>
    );
  }

  if (!state || !depositSummary) {
    return (
      <AppScaffold title="Finance" icon={ChartColumnBig} activeTab="finance">
        <StateCard
          title="We couldn't load Finance"
          body={errorMessage ?? "Please try again in a moment."}
        />
      </AppScaffold>
    );
  }

  return (
    <AppScaffold title="Finance" icon={ChartColumnBig} activeTab="finance">
      <SectionCard>
        <SectionHeader
          title="Track earnings, deposits, GST, and payouts"
          subtitle={`Period: ${state.reportWindow.label}`}
        />
        <SegmentedTabs
          active={activeTab}
          onChange={setActiveTab}
          items={[
            { key: "overview", label: "Overview" },
            { key: "deposits", label: "Deposits & Payouts" },
            { key: "reports", label: "Reports", icon: BarChart3 }
          ]}
        />
      </SectionCard>

      {activeTab === "overview" ? (
        <>
          <MetricGrid
            items={[
              {
                label: "Total Earned",
                value: formatMoney(state.overview.totalCollectedMinor, currencyCode),
                subtitle: `${state.overview.paymentCount} payments`,
                tone: "accent"
              },
              {
                label: "Forecast",
                value: formatMoney(state.forecast.totalMinor, currencyCode),
                subtitle: `${state.forecast.buckets.length} ${state.forecast.mode} buckets`
              },
              {
                label: "Outstanding",
                value: formatMoney(state.overview.receivablesMinor, currencyCode),
                subtitle: `${state.receivables.openInvoiceCount} open invoices`,
                tone: "warning"
              },
              {
                label: "GST Collected",
                value: formatMoney(state.taxSummary.gstCollectedMinor, currencyCode),
                subtitle: state.taxWindow.label,
                tone: "success"
              }
            ]}
          />

          <SectionCard>
            <SectionHeader
              title="Recent earnings"
              subtitle="Money state remains server-owned."
            />
            {state.invoiceLedger.slice(0, 4).map((entry) => (
              <ActionTile
                key={entry.invoiceId}
                title={entry.clientName}
                subtitle={`${entry.invoiceNumber} · ${entry.title}`}
                cta={formatMoney(entry.totalMinor, currencyCode)}
                icon={Wallet}
              />
            ))}
          </SectionCard>

          <SectionCard tone="accent">
            <ActionTile
              title="Tax Centre"
              subtitle="Manage GST, track BAS readiness, and export reporting-ready summaries."
              cta="Open tax reporting"
              icon={Landmark}
              onPress={() => router.push("/app/tax-centre")}
            />
          </SectionCard>
        </>
      ) : null}

      {activeTab === "deposits" ? (
        <>
          <MetricGrid
            items={[
              {
                label: "Deposits Received",
                value: formatMoney(depositSummary.totalDeposits, currencyCode),
                subtitle: "Webhook-confirmed payments",
                tone: "success"
              },
              {
                label: "Balances Outstanding",
                value: formatMoney(depositSummary.pendingBalances, currencyCode),
                subtitle: "Remaining balances due",
                tone: "warning"
              },
              {
                label: "Stripe",
                value: state.stripe.status.replace(/-/g, " "),
                subtitle: "Commercial readiness",
                tone: "accent"
              }
            ]}
          />

          <SectionCard>
            <SectionHeader title="Deposit and balance ledger" subtitle="Invoice-driven collection state." />
            {state.invoiceLedger.slice(0, 5).map((entry) => (
              <ActionTile
                key={entry.invoiceId}
                title={entry.clientName}
                subtitle={`Deposit ${formatMoney(entry.depositAmountMinor, currencyCode)} · Balance ${formatMoney(entry.balanceAmountMinor, currencyCode)}`}
                cta={entry.status}
                icon={Wallet}
              />
            ))}
          </SectionCard>
        </>
      ) : null}

      {activeTab === "reports" ? (
        <>
          <MetricGrid
            items={[
              {
                label: "Taxable Revenue",
                value: formatMoney(state.taxSummary.taxableSalesMinor, currencyCode),
                subtitle: state.taxProfile.reportingMethod,
                tone: "accent"
              },
              {
                label: "GST Payable",
                value: formatMoney(state.taxSummary.gstPayableMinor, currencyCode),
                subtitle: state.taxWindow.label,
                tone: "warning"
              },
              {
                label: "Reserve Target",
                value: formatMoney(state.taxSummary.reserveTargetMinor, currencyCode),
                subtitle: "Suggested set-aside",
                tone: "success"
              }
            ]}
          />

          <SectionCard>
            <SectionHeader title="Forecast buckets" subtitle="Monthly committed and pipeline totals." />
            {state.forecast.buckets.slice(0, 4).map((bucket) => (
              <ActionTile
                key={bucket.label}
                title={bucket.label}
                subtitle={`Committed ${formatMoney(bucket.committedMinor, currencyCode)} · Pipeline ${formatMoney(bucket.pipelineMinor, currencyCode)}`}
                cta={formatMoney(bucket.totalMinor, currencyCode)}
                icon={BarChart3}
              />
            ))}
          </SectionCard>

          <SectionCard tone="accent">
            <SectionHeader title="Stripe readiness" subtitle="Hosted final payment truth still comes from Stripe + webhooks." />
            <StatusBadge label={state.stripe.status} />
          </SectionCard>
        </>
      ) : null}
    </AppScaffold>
  );
}
