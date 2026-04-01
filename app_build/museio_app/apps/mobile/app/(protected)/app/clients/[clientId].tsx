import { useCallback } from "react";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { fetchClientProfile } from "../../../../src/lib/api";
import { useProtectedData } from "../../../../src/lib/use-protected-data";
import {
  DetailRow,
  MobileScreen,
  SectionHeading,
  StateCard,
  StatusBadge,
  SurfaceCard,
  formatDateLabel,
  formatMoney
} from "../../../../src/ui/mobile-shell";

export default function ClientProfileScreen() {
  const { clientId } = useLocalSearchParams<{ clientId: string }>();
  const loader = useCallback(
    (accessToken: string) => fetchClientProfile(accessToken, clientId),
    [clientId]
  );
  const { state, isLoading, errorMessage } = useProtectedData(
    loader,
    "Could not load client profile."
  );

  if (isLoading) {
    return (
      <MobileScreen
        backHref="/app/clients"
        eyebrow="Client detail"
        title="Loading client"
        subtitle="Fetching the relationship view."
        showSecondaryNav={false}
      >
        <StateCard
          eyebrow="Clients"
          title="Loading client profile"
          body="Pulling bookings, jobs, invoices, payments, and the relationship timeline."
        />
      </MobileScreen>
    );
  }

  if (!state) {
    return (
      <MobileScreen
        backHref="/app/clients"
        eyebrow="Client detail"
        title="Client unavailable"
        subtitle="The mobile client profile page could not be loaded."
        showSecondaryNav={false}
      >
        <StateCard
          eyebrow="Clients"
          title="Client unavailable"
          body={errorMessage ?? "Could not load the client profile."}
        />
      </MobileScreen>
    );
  }

  return (
    <MobileScreen
      backHref="/app/clients"
      eyebrow="Client profile"
      title={state.client.displayName}
      subtitle={state.client.primaryEmail}
      showSecondaryNav={false}
    >
      <SurfaceCard tone="dark">
        <Text style={styles.darkTitle}>CRM depth without duplicate truth.</Text>
        <Text style={styles.darkBody}>
          This profile stays tied to bookings, jobs, invoices, payments, and the client timeline.
        </Text>
        <StatusBadge label={state.client.status} />
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          eyebrow="Profile"
          title="Client basics"
          body="A durable client model with creator-scoped ownership and dedup by email."
        />
        <DetailRow label="Email" value={state.client.primaryEmail} />
        <DetailRow label="Phone" value={state.client.phone || "Not provided"} />
        <DetailRow label="Company" value={state.client.companyName || "Not provided"} />
        <DetailRow label="Tags" value={state.client.tags.join(", ") || "No tags yet"} />
        <DetailRow label="Notes" value={state.client.notes || "No notes yet"} />
      </SurfaceCard>

      <SurfaceCard tone="accent">
        <SectionHeading
          eyebrow="Relationship"
          title="Commercial summary"
          body="The relationship summary keeps open money and volume legible on mobile."
        />
        <DetailRow label="Bookings" value={String(state.relationship.bookingRequestCount)} />
        <DetailRow label="Jobs" value={String(state.relationship.jobCount)} />
        <DetailRow label="Invoices" value={String(state.relationship.invoiceCount)} />
        <DetailRow label="Payments" value={String(state.relationship.paymentCount)} />
        <DetailRow label="Collected" value={formatMoney(state.relationship.collectedMinor)} />
        <DetailRow label="Outstanding" value={formatMoney(state.relationship.outstandingMinor)} />
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          eyebrow="Timeline"
          title="Relationship history"
          body="A compact chronology of the booking-to-payment journey."
        />
        <View style={styles.timelineList}>
          {state.timeline.slice(0, 6).map((event) => (
            <View key={event.id} style={styles.timelineRow}>
              <Text style={styles.timelineTitle}>{event.summary}</Text>
              <Text style={styles.timelineMeta}>{formatDateLabel(event.createdAt)}</Text>
            </View>
          ))}
        </View>
      </SurfaceCard>
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  darkTitle: {
    color: "#FFFFFF",
    fontSize: 27,
    lineHeight: 30,
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
    borderBottomColor: "#DDDCE7"
  },
  timelineTitle: {
    color: "#1F2430",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700"
  },
  timelineMeta: {
    color: "#7A7F8C",
    fontSize: 12
  }
});
