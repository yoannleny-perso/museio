import { useCallback, useState } from "react";
import { CalendarDays } from "lucide-react-native";
import { fetchCalendarWorkspace, fetchCreatorBookingInbox } from "../../../src/lib/api";
import { useProtectedData } from "../../../src/lib/use-protected-data";
import {
  AppScaffold,
  MetricGrid,
  SectionCard,
  SectionHeader,
  SegmentedTabs,
  StateCard,
  formatDateLabel
} from "../../../src/ui/mobile-shell";

type AvailabilityTab = "preview" | "manage" | "layers" | "blocks";

const weekdayLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AvailabilityScreen() {
  const loader = useCallback(
    async (accessToken: string) => {
      const [bookingInbox, calendarWorkspace] = await Promise.all([
        fetchCreatorBookingInbox(accessToken),
        fetchCalendarWorkspace(accessToken)
      ]);

      return { bookingInbox, calendarWorkspace };
    },
    []
  );
  const { state, isLoading, errorMessage } = useProtectedData(
    loader,
    "Could not load availability."
  );
  const [activeTab, setActiveTab] = useState<AvailabilityTab>("preview");

  if (isLoading) {
    return (
      <AppScaffold title="My Availability" subtitle="Set your working hours" icon={CalendarDays} activeTab="more">
        <StateCard title="Loading availability" body="Pulling weekly rules and external conflict overlays." />
      </AppScaffold>
    );
  }

  if (!state) {
    return (
      <AppScaffold title="My Availability" subtitle="Set your working hours" icon={CalendarDays} activeTab="more">
        <StateCard
          title="Availability unavailable"
          body={errorMessage ?? "Could not load availability."}
        />
      </AppScaffold>
    );
  }

  const availability = state.bookingInbox.availability;

  return (
    <AppScaffold title="My Availability" subtitle="Set your working hours" icon={CalendarDays} activeTab="more">
      <SectionCard>
        <SectionHeader
          title="Manage your working hours, blocks, and external calendars"
          subtitle="Public booking exposure stays server-owned."
        />
        <SegmentedTabs
          active={activeTab}
          onChange={setActiveTab}
          items={[
            { key: "preview", label: "Preview" },
            { key: "manage", label: "Manage" },
            { key: "layers", label: "Availability Layers" },
            { key: "blocks", label: "Vacations & Blocks" }
          ]}
        />
      </SectionCard>

      {activeTab === "preview" ? (
        <>
          <MetricGrid
            items={[
              {
                label: "External events",
                value: String(state.calendarWorkspace.externalBusyBlocks.length),
                subtitle: "Currently blocking public slots",
                tone: "warning"
              },
              {
                label: "Public days",
                value: String(availability.publicAvailability.length),
                subtitle: "Days with visible windows",
                tone: "accent"
              }
            ]}
          />
          <SectionCard>
            <SectionHeader title="Public availability preview" subtitle="First visible windows by day." />
            {availability.publicAvailability.slice(0, 5).map((day) => (
              <SectionCard key={day.date} tone="accent">
                <SectionHeader
                  title={formatDateLabel(day.date)}
                  subtitle={day.windows[0]?.label ?? "No visible windows"}
                />
              </SectionCard>
            ))}
          </SectionCard>
        </>
      ) : null}

      {activeTab === "manage" ? (
        <SectionCard>
          <SectionHeader title="Weekly working hours" subtitle="Base availability before overlays." />
          {availability.rules.map((rule) => (
            <SectionCard key={rule.id} tone="accent">
              <SectionHeader
                title={weekdayLabels[rule.weekday]}
                subtitle={`${Math.floor(rule.startsAtMinute / 60)
                  .toString()
                  .padStart(2, "0")}:${(rule.startsAtMinute % 60)
                  .toString()
                  .padStart(2, "0")} - ${Math.floor(rule.endsAtMinute / 60)
                  .toString()
                  .padStart(2, "0")}:${(rule.endsAtMinute % 60)
                  .toString()
                  .padStart(2, "0")}`}
              />
            </SectionCard>
          ))}
        </SectionCard>
      ) : null}

      {activeTab === "layers" ? (
        <MetricGrid
          items={[
            {
              label: "Manual blocks",
              value: String(availability.unavailableBlocks.length),
              subtitle: "Creator-defined blocks"
            },
            {
              label: "Calendar overlays",
              value: String(availability.externalBlocks.length),
              subtitle: "Imported busy events",
              tone: "warning"
            },
            {
              label: "Conflict center",
              value: String(state.calendarWorkspace.conflicts.length),
              subtitle: "Potential clashes",
              tone: "accent"
            }
          ]}
        />
      ) : null}

      {activeTab === "blocks" ? (
        <SectionCard>
          <SectionHeader title="Vacations & blocks" subtitle="Internal blocks stay private." />
          {availability.unavailableBlocks.length > 0 ? (
            availability.unavailableBlocks.map((block) => (
              <SectionCard key={block.id} tone="warning">
                <SectionHeader title={block.title} subtitle={`${formatDateLabel(block.startsAt)} to ${formatDateLabel(block.endsAt)}`} />
              </SectionCard>
            ))
          ) : (
            <StateCard title="No manual blocks" body="All current blocking state comes from connected calendars." />
          )}
        </SectionCard>
      ) : null}
    </AppScaffold>
  );
}
