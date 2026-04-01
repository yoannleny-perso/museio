import { useCallback, useMemo } from "react";
import { Settings as SettingsIcon } from "lucide-react-native";
import { fetchCalendarWorkspace, fetchFinanceWorkspace } from "../../../src/lib/api";
import { useProtectedData } from "../../../src/lib/use-protected-data";
import { useAuth } from "../../../src/auth/auth-context";
import {
  AppScaffold,
  MetricGrid,
  SectionCard,
  SectionHeader,
  StateCard,
  StatusBadge
} from "../../../src/ui/mobile-shell";

export default function SettingsScreen() {
  const { user } = useAuth();
  const loader = useCallback(
    async (accessToken: string) => {
      const [financeWorkspace, calendarWorkspace] = await Promise.all([
        fetchFinanceWorkspace(accessToken, {
          reportPreset: "last-30-days",
          taxPreset: "current-quarter",
          forecastMode: "monthly"
        }),
        fetchCalendarWorkspace(accessToken)
      ]);

      return { financeWorkspace, calendarWorkspace };
    },
    []
  );
  const { state, isLoading, errorMessage } = useProtectedData(
    loader,
    "Could not load settings."
  );

  const setupProgress = useMemo(() => {
    const checks = [
      Boolean(user?.profile.displayName),
      Boolean(user?.email),
      Boolean(state?.financeWorkspace.stripe.accountId),
      Boolean(state?.calendarWorkspace.accounts.length),
      Boolean(state?.financeWorkspace.taxProfile.gstRegistered)
    ];

    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [state, user]);

  if (isLoading) {
    return (
      <AppScaffold title="Settings" subtitle="Account and preferences" icon={SettingsIcon} activeTab="more" showProfileButton>
        <StateCard title="Loading settings" body="Pulling profile, tax, Stripe, and calendar readiness." />
      </AppScaffold>
    );
  }

  if (!state) {
    return (
      <AppScaffold title="Settings" subtitle="Account and preferences" icon={SettingsIcon} activeTab="more" showProfileButton>
        <StateCard title="Settings unavailable" body={errorMessage ?? "Could not load settings."} />
      </AppScaffold>
    );
  }

  return (
    <AppScaffold title="Settings" subtitle="Account and preferences" icon={SettingsIcon} activeTab="more" showProfileButton>
      <MetricGrid
        items={[
          {
            label: "Setup Progress",
            value: `${setupProgress}%`,
            subtitle: user?.profile.displayName ?? "Creator profile",
            tone: "accent"
          },
          {
            label: "Calendars",
            value: String(state.calendarWorkspace.accounts.length),
            subtitle: "Connected accounts"
          },
          {
            label: "Stripe",
            value: state.financeWorkspace.stripe.status.replace(/-/g, " "),
            subtitle: "Commercial readiness",
            tone: "warning"
          }
        ]}
      />

      <SectionCard>
        <SectionHeader title="Profile" subtitle={user?.email ?? "No email"} action={<StatusBadge label={user?.profile.onboardingComplete ? "complete" : "incomplete"} />} />
      </SectionCard>

      <SectionCard>
        <SectionHeader title="Invoice" subtitle="Invoice and payout footing." />
        <StatusBadge label={state.financeWorkspace.stripe.status} />
      </SectionCard>

      <SectionCard>
        <SectionHeader title="Banking" subtitle="Stripe Connect remains the payout backbone." />
        <StatusBadge label={state.financeWorkspace.stripe.payoutsEnabled ? "complete" : "incomplete"} />
      </SectionCard>

      <SectionCard>
        <SectionHeader title="Tax & GST" subtitle="AU-first GST reporting baseline." />
        <StatusBadge label={state.financeWorkspace.taxProfile.gstRegistered ? "registered" : "incomplete"} />
      </SectionCard>

      <SectionCard>
        <SectionHeader title="Security" subtitle="Sign out of the current mobile session." />
        <StatusBadge label="protected" />
      </SectionCard>

      <SectionCard tone="accent">
        <SectionHeader title="Session" subtitle="Current mobile auth session." />
        <StatusBadge label="ready" />
      </SectionCard>
    </AppScaffold>
  );
}
