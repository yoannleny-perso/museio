import type {
  FinanceAgingBucket,
  FinanceAgingBucketName,
  FinanceDateWindow,
  FinanceExportFormat,
  FinanceForecastBucket,
  FinanceForecastMode,
  ResolvedFinanceWorkspaceFilters,
  TaxReportingMethod
} from "@museio/types";

const DAY_MS = 86400000;

export function resolveReportWindow(
  filters: ResolvedFinanceWorkspaceFilters,
  now = new Date()
): FinanceDateWindow {
  const end = new Date(now);

  switch (filters.reportPreset) {
    case "last-30-days":
      return {
        preset: "last-30-days",
        label: "Last 30 Days",
        from: new Date(end.getTime() - 30 * DAY_MS).toISOString(),
        to: end.toISOString()
      };
    case "last-90-days":
      return {
        preset: "last-90-days",
        label: "Last 90 Days",
        from: new Date(end.getTime() - 90 * DAY_MS).toISOString(),
        to: end.toISOString()
      };
    case "last-6-months": {
      const from = new Date(end);
      from.setUTCMonth(from.getUTCMonth() - 6);

      return {
        preset: "last-6-months",
        label: "Last 6 Months",
        from: from.toISOString(),
        to: end.toISOString()
      };
    }
    case "year-to-date":
      return {
        preset: "year-to-date",
        label: "Year To Date",
        from: new Date(Date.UTC(end.getUTCFullYear(), 0, 1)).toISOString(),
        to: end.toISOString()
      };
    case "all-time":
      return {
        preset: "all-time",
        label: "All Time"
      };
    case "custom":
      return {
        preset: "custom",
        label: "Custom Range",
        from: filters.reportFrom,
        to: filters.reportTo
      };
  }
}

export function resolveTaxWindow(
  filters: ResolvedFinanceWorkspaceFilters,
  now = new Date()
): FinanceDateWindow {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const quarterStartMonth = Math.floor(month / 3) * 3;

  switch (filters.taxPreset) {
    case "current-quarter":
      return {
        preset: "current-quarter",
        label: "Current Quarter",
        from: new Date(Date.UTC(year, quarterStartMonth, 1)).toISOString(),
        to: now.toISOString()
      };
    case "previous-quarter": {
      const currentQuarterStart = new Date(Date.UTC(year, quarterStartMonth, 1));
      const previousQuarterEnd = new Date(currentQuarterStart.getTime() - 1);
      const previousQuarterStart = new Date(
        Date.UTC(previousQuarterEnd.getUTCFullYear(), Math.floor(previousQuarterEnd.getUTCMonth() / 3) * 3, 1)
      );

      return {
        preset: "previous-quarter",
        label: "Previous Quarter",
        from: previousQuarterStart.toISOString(),
        to: previousQuarterEnd.toISOString()
      };
    }
    case "financial-year-to-date": {
      const fyYear = month >= 6 ? year : year - 1;
      return {
        preset: "financial-year-to-date",
        label: "Financial Year To Date",
        from: new Date(Date.UTC(fyYear, 6, 1)).toISOString(),
        to: now.toISOString()
      };
    }
    case "custom":
      return {
        preset: "custom",
        label: "Custom Tax Period",
        from: filters.taxFrom,
        to: filters.taxTo
      };
  }
}

export function dateInWindow(
  dateIso: string | undefined,
  window: FinanceDateWindow
) {
  if (!dateIso) {
    return false;
  }

  const value = new Date(dateIso).getTime();

  if (window.from && value < new Date(window.from).getTime()) {
    return false;
  }

  if (window.to && value > new Date(window.to).getTime()) {
    return false;
  }

  return true;
}

export function computeOverdueDays(dueDateIso: string | undefined, now = new Date()) {
  if (!dueDateIso) {
    return 0;
  }

  const diff = now.getTime() - new Date(dueDateIso).getTime();
  return diff <= 0 ? 0 : Math.floor(diff / DAY_MS);
}

export function getAgingBucketName(overdueDays: number): FinanceAgingBucketName {
  if (overdueDays <= 0) {
    return "current";
  }

  if (overdueDays <= 30) {
    return "1-30-days";
  }

  if (overdueDays <= 60) {
    return "31-60-days";
  }

  if (overdueDays <= 90) {
    return "61-90-days";
  }

  return "90-plus-days";
}

export function createEmptyAgingBuckets(): FinanceAgingBucket[] {
  return [
    { bucket: "current", invoiceCount: 0, amountMinor: 0 },
    { bucket: "1-30-days", invoiceCount: 0, amountMinor: 0 },
    { bucket: "31-60-days", invoiceCount: 0, amountMinor: 0 },
    { bucket: "61-90-days", invoiceCount: 0, amountMinor: 0 },
    { bucket: "90-plus-days", invoiceCount: 0, amountMinor: 0 }
  ];
}

export function addToAgingBuckets(
  buckets: FinanceAgingBucket[],
  overdueDays: number,
  amountMinor: number
) {
  const bucketName = getAgingBucketName(overdueDays);
  const bucket = buckets.find((entry) => entry.bucket === bucketName);

  if (!bucket) {
    return buckets;
  }

  bucket.invoiceCount += 1;
  bucket.amountMinor += amountMinor;
  return buckets;
}

export function allocateTaxFromPayment(params: {
  paymentAmountMinor: number;
  invoiceTaxMinor: number;
  invoiceTotalMinor: number;
}) {
  if (params.invoiceTotalMinor <= 0 || params.invoiceTaxMinor <= 0) {
    return 0;
  }

  return Math.round(
    (params.paymentAmountMinor * params.invoiceTaxMinor) / params.invoiceTotalMinor
  );
}

export function buildForecastBuckets(params: {
  mode: FinanceForecastMode;
  from: Date;
  count?: number;
}) {
  const count = params.count ?? (params.mode === "weekly" ? 6 : 6);
  const buckets: FinanceForecastBucket[] = [];

  for (let index = 0; index < count; index += 1) {
    if (params.mode === "weekly") {
      const startsAt = new Date(params.from.getTime() + index * 7 * DAY_MS);
      const endsAt = new Date(startsAt.getTime() + 7 * DAY_MS - 1);

      buckets.push({
        label: `Week ${index + 1}`,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        committedMinor: 0,
        pipelineMinor: 0,
        totalMinor: 0
      });
    } else {
      const startsAt = new Date(
        Date.UTC(params.from.getUTCFullYear(), params.from.getUTCMonth() + index, 1)
      );
      const endsAt = new Date(
        Date.UTC(params.from.getUTCFullYear(), params.from.getUTCMonth() + index + 1, 1) - 1
      );

      buckets.push({
        label: startsAt.toLocaleString("en-AU", {
          month: "short",
          year: "numeric",
          timeZone: "UTC"
        }),
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        committedMinor: 0,
        pipelineMinor: 0,
        totalMinor: 0
      });
    }
  }

  return buckets;
}

export function addToForecastBuckets(
  buckets: FinanceForecastBucket[],
  dateIso: string | undefined,
  key: "committedMinor" | "pipelineMinor",
  amountMinor: number
) {
  if (!dateIso) {
    return;
  }

  const value = new Date(dateIso).getTime();
  const bucket = buckets.find(
    (entry) =>
      value >= new Date(entry.startsAt).getTime() &&
      value <= new Date(entry.endsAt).getTime()
  );

  if (!bucket) {
    return;
  }

  bucket[key] += amountMinor;
  bucket.totalMinor += amountMinor;
}

export function formatFinanceWindowLabel(window: FinanceDateWindow) {
  return window.label;
}

export function getFinanceDefaults(): Pick<
  ResolvedFinanceWorkspaceFilters,
  "reportPreset" | "taxPreset" | "forecastMode"
> &
  Pick<ResolvedFinanceWorkspaceFilters, "reportFrom" | "reportTo" | "taxFrom" | "taxTo"> {
  return {
    reportPreset: "last-30-days",
    reportFrom: undefined,
    reportTo: undefined,
    taxPreset: "current-quarter",
    taxFrom: undefined,
    taxTo: undefined,
    forecastMode: "monthly"
  };
}

export function getTaxPayableMinor(params: {
  gstRegistered: boolean;
  reportingMethod: TaxReportingMethod;
  gstCollectedMinor: number;
}) {
  if (!params.gstRegistered) {
    return 0;
  }

  return params.gstCollectedMinor;
}

export function getReserveTargetMinor(params: {
  taxableSalesMinor: number;
  reserveRateBasisPoints: number;
}) {
  return Math.round(
    (Math.max(params.taxableSalesMinor, 0) * Math.max(params.reserveRateBasisPoints, 0)) / 10000
  );
}

export function getExportMimeType(format: FinanceExportFormat) {
  return format === "csv" ? "text/csv; charset=utf-8" : "application/json";
}
