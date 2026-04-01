import { useCallback } from "react";
import { Landmark } from "lucide-react-native";
import { fetchFinanceWorkspace } from "../../../src/lib/api";
import { useProtectedData } from "../../../src/lib/use-protected-data";
import {
  AppScaffold,
  MetricGrid,
  SectionCard,
  SectionHeader,
  StateCard,
  StatusBadge,
  formatMoney
} from "../../../src/ui/mobile-shell";

export default function TaxCentreScreen() {
  const loader = useCallback(
    (accessToken: string) =>
      fetchFinanceWorkspace(accessToken, {
        reportPreset: "last-90-days",
        taxPreset: "current-quarter",
        forecastMode: "monthly"
      }),
    []
  );
  const { state, isLoading, errorMessage } = useProtectedData(
    loader,
    "Could not load tax centre."
  );

  if (isLoading) {
    return (
      <AppScaffold title="Tax Centre" subtitle="GST, BAS and ATO reporting" icon={Landmark} activeTab="finance">
        <StateCard title="Loading tax centre" body="Pulling GST profile, BAS footing, and reporting windows." />
      </AppScaffold>
    );
  }

  if (!state) {
    return (
      <AppScaffold title="Tax Centre" subtitle="GST, BAS and ATO reporting" icon={Landmark} activeTab="finance">
        <StateCard title="Tax centre unavailable" body={errorMessage ?? "Could not load tax centre."} />
      </AppScaffold>
    );
  }

  const currencyCode = state.taxSummary.currencyCode;
  const checklist = state.taxProfile.atoReadyChecklist;
  const readinessScore = Math.round(
    ([checklist.businessProfile, checklist.gstRegistration, checklist.banking, checklist.recordKeeping].filter(Boolean).length /
      4) *
      100
  );

  return (
    <AppScaffold title="Tax Centre" subtitle="GST, BAS and ATO reporting" icon={Landmark} activeTab="finance">
      <MetricGrid
        items={[
          {
            label: "BAS readiness",
            value: `${readinessScore}%`,
            subtitle: state.taxProfile.gstRegistered ? "GST registered" : "GST not registered",
            tone: "accent"
          },
          {
            label: "GST collected",
            value: formatMoney(state.taxSummary.gstCollectedMinor, currencyCode),
            subtitle: state.taxWindow.label,
            tone: "success"
          },
          {
            label: "GST payable",
            value: formatMoney(state.taxSummary.gstPayableMinor, currencyCode),
            subtitle: state.taxProfile.reportingMethod,
            tone: "warning"
          }
        ]}
      />

      <SectionCard>
        <SectionHeader
          title="GST footing"
          subtitle={`${state.taxProfile.gstNumber ? `ABN/GST ${state.taxProfile.gstNumber}` : "ABN pending"} · reserve ${state.taxProfile.reserveRateBasisPoints / 100}%`}
          action={
            <StatusBadge label={state.taxProfile.gstRegistered ? "registered" : "not-registered"} />
          }
        />
      </SectionCard>

      <SectionCard>
        <SectionHeader title="Current period" subtitle="Quarterly reporting summary." />
        <MetricGrid
          items={[
            {
              label: "Taxable Revenue",
              value: formatMoney(state.taxSummary.taxableSalesMinor, currencyCode)
            },
            {
              label: "GST Outstanding",
              value: formatMoney(state.taxSummary.gstOutstandingMinor, currencyCode)
            },
            {
              label: "Reserve Target",
              value: formatMoney(state.taxSummary.reserveTargetMinor, currencyCode)
            }
          ]}
        />
      </SectionCard>
    </AppScaffold>
  );
}
