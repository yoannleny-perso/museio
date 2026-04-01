import { useCallback } from "react";
import { Link as LinkIcon } from "lucide-react-native";
import { fetchCalendarWorkspace } from "../../../src/lib/api";
import { useProtectedData } from "../../../src/lib/use-protected-data";
import {
  AppScaffold,
  MetricGrid,
  SectionCard,
  SectionHeader,
  StateCard,
  StatusBadge,
  formatDateTimeLabel
} from "../../../src/ui/mobile-shell";

export default function ConnectedCalendarsScreen() {
  const loader = useCallback((accessToken: string) => fetchCalendarWorkspace(accessToken), []);
  const { state, isLoading, errorMessage } = useProtectedData(
    loader,
    "Could not load connected calendars."
  );

  if (isLoading) {
    return (
      <AppScaffold title="Connected Calendars" subtitle="Google Calendar & Calendly sync" icon={LinkIcon} activeTab="more">
        <StateCard title="Loading calendars" body="Pulling connected accounts and imported conflict blocks." />
      </AppScaffold>
    );
  }

  if (!state) {
    return (
      <AppScaffold title="Connected Calendars" subtitle="Google Calendar & Calendly sync" icon={LinkIcon} activeTab="more">
        <StateCard
          title="Connected calendars unavailable"
          body={errorMessage ?? "Could not load connected calendars."}
        />
      </AppScaffold>
    );
  }

  return (
    <AppScaffold title="Connected Calendars" subtitle="Google Calendar & Calendly sync" icon={LinkIcon} activeTab="more">
      <MetricGrid
        items={[
          {
            label: "Accounts",
            value: String(state.accounts.length),
            subtitle: "Connected providers",
            tone: "accent"
          },
          {
            label: "Busy blocks",
            value: String(state.externalBusyBlocks.length),
            subtitle: "Imported schedule conflicts",
            tone: "warning"
          },
          {
            label: "Conflicts",
            value: String(state.conflicts.length),
            subtitle: "Needs review"
          }
        ]}
      />

      <SectionCard>
        <SectionHeader title="Connected Accounts" subtitle="Current connection state and sync health." />
        {state.accounts.map((account) => (
          <SectionCard key={account.id} tone="accent">
            <SectionHeader
              title={account.provider.replace(/-/g, " ")}
              subtitle={`${account.accountLabel} · ${account.syncStatus}`}
              action={<StatusBadge label={account.status} />}
            />
          </SectionCard>
        ))}
      </SectionCard>

      <SectionCard>
        <SectionHeader title="Upcoming imported events" subtitle="Calendar overlays that affect availability." />
        {state.externalBusyBlocks.slice(0, 5).map((block) => (
          <SectionCard key={block.id}>
            <SectionHeader
              title={block.title}
              subtitle={`${formatDateTimeLabel(block.startsAt)} - ${formatDateTimeLabel(block.endsAt)}`}
              action={<StatusBadge label={block.provider} />}
            />
          </SectionCard>
        ))}
      </SectionCard>
    </AppScaffold>
  );
}
