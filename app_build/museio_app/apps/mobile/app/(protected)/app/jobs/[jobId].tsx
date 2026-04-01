import { useCallback } from "react";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { fetchCommercialJobDetail } from "../../../../src/lib/api";
import { useProtectedData } from "../../../../src/lib/use-protected-data";
import {
  DetailRow,
  MobileScreen,
  SectionHeading,
  StateCard,
  StatusBadge,
  SurfaceCard,
  formatDateLabel,
  formatMoney,
  formatRelativeCount,
  formatSlotRange
} from "../../../../src/ui/mobile-shell";

export default function JobDetailScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const loader = useCallback(
    (accessToken: string) => fetchCommercialJobDetail(accessToken, jobId),
    [jobId]
  );
  const { state, isLoading, errorMessage } = useProtectedData(
    loader,
    "Could not load job detail."
  );

  if (isLoading) {
    return (
      <MobileScreen
        backHref="/app/jobs"
        eyebrow="Job detail"
        title="Loading job"
        subtitle="Fetching quote, invoice, and payment state."
        showSecondaryNav={false}
      >
        <StateCard
          eyebrow="Jobs"
          title="Loading job detail"
          body="Pulling operational and commercial state into one mobile view."
        />
      </MobileScreen>
    );
  }

  if (!state) {
    return (
      <MobileScreen
        backHref="/app/jobs"
        eyebrow="Job detail"
        title="Job unavailable"
        subtitle="The mobile job detail page could not be loaded."
        showSecondaryNav={false}
      >
        <StateCard
          eyebrow="Jobs"
          title="Job unavailable"
          body={errorMessage ?? "Could not load job detail."}
        />
      </MobileScreen>
    );
  }

  return (
    <MobileScreen
      backHref="/app/jobs"
      eyebrow="Job detail"
      title={state.job.title}
      subtitle={`${state.job.eventType} · ${formatRelativeCount(state.job.requestedSlots.length, "requested slot")}`}
      showSecondaryNav={false}
    >
      <SurfaceCard tone="dark">
        <Text style={styles.darkTitle}>Commercial state follows the job, not guesswork.</Text>
        <Text style={styles.darkBody}>
          Quote, invoice, and payment truth stay attached here while the booking request remains
          preserved as intake history.
        </Text>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          eyebrow="Operational"
          title="Job basics"
          body="The job carries creator ownership, client linkage, and the original requester snapshot."
        />
        <DetailRow label="Status" value={state.job.status} />
        <DetailRow label="Client" value={state.job.requesterSnapshot.clientName} />
        <DetailRow label="Requester email" value={state.job.requesterSnapshot.clientEmail} />
        <DetailRow
          label="Primary slot"
          value={
            state.job.requestedSlots[0]
              ? formatSlotRange(
                  state.job.requestedSlots[0].startsAt,
                  state.job.requestedSlots[0].endsAt
                )
              : "No slot attached"
          }
        />
        <DetailRow
          label="Context"
          value={state.job.eventNotes || "No additional event notes were preserved."}
        />
      </SurfaceCard>

      <SurfaceCard tone="accent">
        <SectionHeading
          eyebrow="Quote"
          title="Proposal state"
          body="Quotes are job-scoped and acceptance stays tokenized on the public side."
        />
        {state.quote ? (
          <>
            <StatusBadge label={state.quote.status} />
            <DetailRow label="Quote title" value={state.quote.title} />
            <DetailRow
              label="Total"
              value={formatMoney(state.quote.totals.totalMinor, state.quote.currencyCode)}
            />
            <DetailRow
              label="Line items"
              value={formatRelativeCount(state.quote.lineItems.length, "line item")}
            />
          </>
        ) : (
          <Text style={styles.emptyText}>No quote has been drafted for this job yet.</Text>
        )}
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          eyebrow="Invoice"
          title="Collection path"
          body="Deposits, balances, and paid state are all driven from invoice and payment records."
        />
        {state.invoice ? (
          <>
            <StatusBadge label={state.invoice.status} />
            <DetailRow label="Invoice number" value={state.invoice.invoiceNumber} />
            <DetailRow
              label="Issued"
              value={state.invoice.issueAt ? formatDateLabel(state.invoice.issueAt) : "Draft"}
            />
            <DetailRow
              label="Amount due"
              value={formatMoney(state.invoice.totals.amountDueMinor, state.invoice.currencyCode)}
            />
            <DetailRow
              label="Deposit path"
              value={state.invoice.collectionMode.replace(/-/g, " ")}
            />
          </>
        ) : (
          <Text style={styles.emptyText}>No invoice has been created for this job yet.</Text>
        )}
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          eyebrow="Payments"
          title="Recorded money movement"
          body="Final paid-state truth remains webhook-driven."
        />
        <View style={styles.paymentList}>
          {state.payments.length > 0 ? (
            state.payments.map((payment) => (
              <View key={payment.id} style={styles.paymentRow}>
                <View style={styles.paymentText}>
                  <Text style={styles.paymentTitle}>{payment.phase}</Text>
                  <Text style={styles.paymentMeta}>{formatDateLabel(payment.createdAt)}</Text>
                </View>
                <View style={styles.paymentAside}>
                  <StatusBadge label={payment.status} />
                  <Text style={styles.paymentAmount}>
                    {formatMoney(payment.amountMinor, payment.currencyCode)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No payments are attached to this job yet.</Text>
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
  emptyText: {
    color: "#5D6270",
    fontSize: 14,
    lineHeight: 20
  },
  paymentList: {
    gap: 12
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(221,220,231,0.94)"
  },
  paymentText: {
    flex: 1,
    gap: 4
  },
  paymentTitle: {
    color: "#1F2430",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "800",
    textTransform: "capitalize"
  },
  paymentMeta: {
    color: "#7A7F8C",
    fontSize: 12
  },
  paymentAside: {
    alignItems: "flex-end",
    gap: 8
  },
  paymentAmount: {
    color: "#1F2430",
    fontSize: 14,
    fontWeight: "800"
  }
});
