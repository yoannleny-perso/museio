import { useCallback } from "react";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { tokens } from "@museio/ui";
import { fetchCreatorBookingRequestDetail } from "../../../../src/lib/api";
import { useProtectedData } from "../../../../src/lib/use-protected-data";
import {
  DetailRow,
  MobileScreen,
  SectionHeading,
  StateCard,
  StatusBadge,
  SurfaceCard,
  formatDateTimeLabel,
  formatSlotRange
} from "../../../../src/ui/mobile-shell";

export default function BookingRequestDetailScreen() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const loader = useCallback(
    (accessToken: string) => fetchCreatorBookingRequestDetail(accessToken, requestId),
    [requestId]
  );
  const { state, isLoading, errorMessage } = useProtectedData(
    loader,
    "Could not load booking request detail."
  );

  if (isLoading) {
    return (
      <MobileScreen
        backHref="/app/bookings"
        eyebrow="Request detail"
        title="Loading request"
        subtitle="Fetching the creator-side booking detail."
        showSecondaryNav={false}
      >
        <StateCard
          eyebrow="Bookings"
          title="Loading booking detail"
          body="Pulling timeline, notes, client linkage, and job conversion state."
        />
      </MobileScreen>
    );
  }

  if (!state) {
    return (
      <MobileScreen
        backHref="/app/bookings"
        eyebrow="Request detail"
        title="Request unavailable"
        subtitle="The booking detail screen could not be loaded."
        showSecondaryNav={false}
      >
        <StateCard
          eyebrow="Bookings"
          title="Booking detail unavailable"
          body={errorMessage ?? "Could not load booking detail."}
        />
      </MobileScreen>
    );
  }

  return (
    <MobileScreen
      backHref="/app/bookings"
      eyebrow="Booking request"
      title={state.request.requester.clientName}
      subtitle={`${state.request.eventType} · submitted ${formatDateTimeLabel(state.request.submittedAt)}`}
      showSecondaryNav={false}
    >
      <SurfaceCard tone="dark">
        <Text style={styles.darkTitle}>Review decisions stay server-owned.</Text>
        <Text style={styles.darkBody}>
          The creator can mark under review, decline, archive, or accept into a job draft
          without mutating the original booking history.
        </Text>
        <StatusBadge label={state.request.status} />
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          eyebrow="Request"
          title="Client and event snapshot"
          body="The original requester data is preserved even after conversion."
        />
        <DetailRow label="Client" value={state.request.requester.clientName} />
        <DetailRow label="Email" value={state.request.requester.clientEmail} />
        <DetailRow label="Event type" value={state.request.eventType} />
        <DetailRow
          label="Requested slot"
          value={
            state.request.requestedSlots[0]
              ? formatSlotRange(
                  state.request.requestedSlots[0].startsAt,
                  state.request.requestedSlots[0].endsAt
                )
              : "No slot requested"
          }
        />
        <DetailRow
          label="Notes"
          value={state.request.eventNotes || "No event notes were provided."}
        />
        <DetailRow
          label="Package"
          value={
            state.request.servicePackageNotes || "No service or package notes were provided."
          }
        />
      </SurfaceCard>

      <SurfaceCard tone="accent">
        <SectionHeading
          eyebrow="Conversion"
          title="Client and job linkage"
          body="This is the bridge from intake to operations."
        />
        <DetailRow
          label="Client link"
          value={state.client ? state.client.displayName : "No client linked yet"}
        />
        <DetailRow
          label="Job draft"
          value={state.jobDraft ? state.jobDraft.title : "No job draft created yet"}
        />
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          eyebrow="Timeline"
          title="Creator-visible activity"
          body="The timeline keeps the operational history readable on mobile."
        />
        <View style={styles.timelineList}>
          {state.timeline.map((item) => (
            <View key={item.id} style={styles.timelineRow}>
              <Text style={styles.timelineTitle}>{item.summary}</Text>
              <Text style={styles.timelineMeta}>{formatDateTimeLabel(item.createdAt)}</Text>
            </View>
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          eyebrow="Internal notes"
          title="Review notes"
          body="Notes stay creator-only and should never bleed into the public request flow."
        />
        <View style={styles.notesList}>
          {state.internalNotes.length > 0 ? (
            state.internalNotes.map((note) => (
              <View key={note.id} style={styles.noteCard}>
                <Text style={styles.noteBody}>{note.body}</Text>
                <Text style={styles.noteMeta}>{formatDateTimeLabel(note.createdAt)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No internal notes have been added yet.</Text>
          )}
        </View>
      </SurfaceCard>
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  darkTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    lineHeight: 29,
    fontWeight: "900"
  },
  darkBody: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 15,
    lineHeight: 22
  },
  timelineList: {
    gap: 12
  },
  timelineRow: {
    gap: 4,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.border
  },
  timelineTitle: {
    color: tokens.color.text,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700"
  },
  timelineMeta: {
    color: tokens.color.textSubtle,
    fontSize: 12
  },
  notesList: {
    gap: 10
  },
  noteCard: {
    backgroundColor: tokens.color.surfaceMuted,
    borderRadius: 20,
    padding: 14,
    gap: 6
  },
  noteBody: {
    color: tokens.color.text,
    fontSize: 15,
    lineHeight: 21
  },
  noteMeta: {
    color: tokens.color.textSubtle,
    fontSize: 12
  },
  emptyText: {
    color: tokens.color.textMuted,
    fontSize: 14,
    lineHeight: 20
  }
});
