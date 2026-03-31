import type {
  CommercialLineItem,
  CommercialTotals,
  DepositConfig,
  InvoiceCollectionMode,
  InvoicePaymentPhase,
  InvoiceStatus,
  PaymentRecordStatus,
  QuoteStatus
} from "@museio/types";

export const quoteStatuses = [
  "draft",
  "ready-to-send",
  "sent",
  "accepted",
  "declined"
] as const;

export const invoiceStatuses = [
  "draft",
  "sent",
  "viewed",
  "deposit-requested",
  "deposit-paid",
  "balance-due",
  "paid",
  "declined",
  "void"
] as const;

export const invoiceCollectionModes = [
  "full-payment",
  "deposit-and-balance"
] as const;

export const paymentRecordStatuses = [
  "pending",
  "processing",
  "succeeded",
  "failed",
  "refunded",
  "partially-refunded"
] as const;

export function computeCommercialLineItemTotals(input: {
  id: string;
  label: string;
  description: string;
  quantity: number;
  unitAmountMinor: number;
  taxRateBasisPoints?: number;
  sortOrder: number;
}): CommercialLineItem {
  const quantity = Math.max(input.quantity, 0);
  const unitAmountMinor = Math.max(input.unitAmountMinor, 0);
  const taxRateBasisPoints = Math.max(input.taxRateBasisPoints ?? 0, 0);
  const lineSubtotalMinor = Math.round(quantity * unitAmountMinor);
  const lineTaxMinor = Math.round((lineSubtotalMinor * taxRateBasisPoints) / 10000);

  return {
    id: input.id,
    label: input.label.trim(),
    description: input.description,
    quantity,
    unitAmountMinor,
    taxRateBasisPoints,
    sortOrder: input.sortOrder,
    lineSubtotalMinor,
    lineTaxMinor,
    lineTotalMinor: lineSubtotalMinor + lineTaxMinor
  };
}

export function computeCommercialTotals(
  currencyCode: string,
  lineItems: CommercialLineItem[]
): CommercialTotals {
  const subtotalMinor = lineItems.reduce(
    (sum, item) => sum + item.lineSubtotalMinor,
    0
  );
  const taxMinor = lineItems.reduce((sum, item) => sum + item.lineTaxMinor, 0);

  return {
    currencyCode: currencyCode.toUpperCase(),
    subtotalMinor,
    taxMinor,
    totalMinor: subtotalMinor + taxMinor
  };
}

export function getAllowedQuoteActions(status: QuoteStatus) {
  switch (status) {
    case "draft":
      return ["save", "ready-to-send"] as const;
    case "ready-to-send":
      return ["save", "send"] as const;
    case "sent":
      return [] as const;
    case "accepted":
      return [] as const;
    case "declined":
      return [] as const;
  }
}

export function computeDepositAmountMinor(params: {
  collectionMode: InvoiceCollectionMode;
  depositConfig?: DepositConfig;
  totalMinor: number;
}) {
  if (params.collectionMode !== "deposit-and-balance" || !params.depositConfig) {
    return 0;
  }

  if (params.depositConfig.type === "fixed") {
    return Math.max(0, Math.min(params.totalMinor, Math.round(params.depositConfig.value)));
  }

  return Math.max(
    0,
    Math.min(params.totalMinor, Math.round((params.totalMinor * params.depositConfig.value) / 100))
  );
}

export function computeInvoiceMoneyState(params: {
  totalMinor: number;
  amountPaidMinor: number;
  collectionMode: InvoiceCollectionMode;
  depositAmountMinor: number;
}) {
  const amountPaidMinor = Math.max(0, params.amountPaidMinor);
  const amountDueMinor = Math.max(0, params.totalMinor - amountPaidMinor);
  const depositAmountMinor = Math.max(0, Math.min(params.totalMinor, params.depositAmountMinor));
  const balanceAmountMinor = Math.max(0, params.totalMinor - depositAmountMinor);

  return {
    amountPaidMinor,
    amountDueMinor,
    depositAmountMinor,
    balanceAmountMinor
  };
}

export function deriveInvoiceStatus(params: {
  currentStatus: InvoiceStatus;
  collectionMode: InvoiceCollectionMode;
  paymentStatus?: PaymentRecordStatus;
  amountPaidMinor: number;
  totalMinor: number;
  depositAmountMinor: number;
}) {
  if (params.currentStatus === "void" || params.currentStatus === "declined") {
    return params.currentStatus;
  }

  if (params.paymentStatus === "failed") {
    return "sent" satisfies InvoiceStatus;
  }

  if (params.amountPaidMinor >= params.totalMinor && params.totalMinor > 0) {
    return "paid" satisfies InvoiceStatus;
  }

  if (params.collectionMode === "deposit-and-balance") {
    if (params.amountPaidMinor >= params.depositAmountMinor && params.amountPaidMinor > 0) {
      return "deposit-paid" satisfies InvoiceStatus;
    }

    return "deposit-requested" satisfies InvoiceStatus;
  }

  return params.currentStatus === "draft" ? "draft" : "sent";
}

export function getInvoicePaymentPhases(params: {
  status: InvoiceStatus;
  collectionMode: InvoiceCollectionMode;
  amountPaidMinor: number;
  totalMinor: number;
  depositAmountMinor: number;
}): InvoicePaymentPhase[] {
  if (params.status === "paid" || params.status === "void" || params.status === "declined") {
    return [];
  }

  if (params.collectionMode === "full-payment") {
    return params.amountPaidMinor >= params.totalMinor ? [] : ["full"];
  }

  if (params.amountPaidMinor === 0) {
    return ["deposit"];
  }

  if (params.amountPaidMinor >= params.totalMinor) {
    return [];
  }

  if (params.amountPaidMinor >= params.depositAmountMinor) {
    return ["balance"];
  }

  return ["deposit"];
}
