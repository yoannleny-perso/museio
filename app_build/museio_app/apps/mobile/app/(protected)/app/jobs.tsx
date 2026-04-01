import { useCallback, useMemo, useState } from "react";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Briefcase, CirclePlus, FilePlus2, FileText, MessageSquareText } from "lucide-react-native";
import { tokens } from "@museio/ui";
import { fetchCommercialJobs, fetchCreatorBookingInbox } from "../../../src/lib/api";
import { useProtectedData } from "../../../src/lib/use-protected-data";
import {
  AppScaffold,
  EmptyPanel,
  HeaderActionButton,
  SearchField,
  SectionCard,
  SegmentedTabs,
  StateCard,
  StatusBadge,
  formatDateLabel
} from "../../../src/ui/mobile-shell";
import type { CreatorBookingInboxState, CreatorCommercialJobsState } from "@museio/types";

type JobsTab = "requests" | "upcoming" | "invoiced" | "paid" | "drafts";

function matchesSearch(values: Array<string | undefined>, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return values.some((value) => value?.toLowerCase().includes(normalized));
}

function isPaidJob(state: CreatorCommercialJobsState["jobs"][number]) {
  return state.invoice?.status === "paid";
}

function isInvoicedJob(state: CreatorCommercialJobsState["jobs"][number]) {
  return Boolean(
    state.invoice &&
      !["draft", "paid"].includes(state.invoice.status)
  );
}

function isDraftJob(state: CreatorCommercialJobsState["jobs"][number]) {
  return !state.quote && !state.invoice;
}

function isUpcomingJob(state: CreatorCommercialJobsState["jobs"][number]) {
  return !isPaidJob(state) && !isInvoicedJob(state) && !isDraftJob(state);
}

export default function JobsScreen() {
  const loader = useCallback(
    async (accessToken: string) => {
      const [bookingInbox, commercialJobs] = await Promise.all([
        fetchCreatorBookingInbox(accessToken),
        fetchCommercialJobs(accessToken)
      ]);

      return { bookingInbox, commercialJobs };
    },
    []
  );

  const { state, isLoading, errorMessage } = useProtectedData(
    loader,
    "Could not load jobs."
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<JobsTab>("requests");

  const requests = state?.bookingInbox.requests ?? [];
  const jobs = state?.commercialJobs.jobs ?? [];

  const counts = useMemo(
    () => ({
      requests: requests.length,
      upcoming: jobs.filter(isUpcomingJob).length,
      invoiced: jobs.filter(isInvoicedJob).length,
      paid: jobs.filter(isPaidJob).length,
      drafts: jobs.filter(isDraftJob).length
    }),
    [jobs, requests.length]
  );

  const filteredContent = useMemo(() => {
    if (!state) {
      return [];
    }

    if (activeTab === "requests") {
      return requests.filter((request) =>
        matchesSearch([request.clientName, request.eventType], searchQuery)
      );
    }

    const source =
      activeTab === "upcoming"
        ? jobs.filter(isUpcomingJob)
        : activeTab === "invoiced"
          ? jobs.filter(isInvoicedJob)
          : activeTab === "paid"
            ? jobs.filter(isPaidJob)
            : jobs.filter(isDraftJob);

    return source.filter((entry) =>
      matchesSearch(
        [
          entry.job.title,
          entry.job.requesterSnapshot.clientName,
          entry.job.eventType,
          entry.invoice?.invoiceNumber,
          entry.quote?.title
        ],
        searchQuery
      )
    );
  }, [activeTab, jobs, requests, searchQuery, state]);

  if (isLoading) {
    return (
      <AppScaffold
        title="Jobs"
        icon={Briefcase}
        topAction={<HeaderActionButton label="New Job" icon={CirclePlus} onPress={() => router.push("/app/jobs/new")} />}
        activeTab="jobs"
      >
        <StateCard title="Loading jobs" body="Pulling requests, accepted work, and commercial status." />
      </AppScaffold>
    );
  }

  if (!state) {
    return (
      <AppScaffold
        title="Jobs"
        icon={Briefcase}
        topAction={<HeaderActionButton label="New Job" icon={CirclePlus} onPress={() => router.push("/app/jobs/new")} />}
        activeTab="jobs"
      >
        <StateCard title="Jobs unavailable" body={errorMessage ?? "Could not load jobs."} />
      </AppScaffold>
    );
  }

  return (
    <AppScaffold
      title="Jobs"
      icon={Briefcase}
      topAction={<HeaderActionButton label="New Job" icon={CirclePlus} onPress={() => router.push("/app/jobs/new")} />}
      activeTab="jobs"
    >
      <SearchField
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search jobs..."
      />

      <SegmentedTabs
        active={activeTab}
        onChange={setActiveTab}
        items={[
          { key: "requests", label: "Requests", count: counts.requests, icon: MessageSquareText },
          { key: "upcoming", label: "Upcoming", count: counts.upcoming, icon: Briefcase },
          { key: "invoiced", label: "Invoiced", count: counts.invoiced, icon: FileText },
          { key: "paid", label: "Paid", count: counts.paid, icon: FileText },
          { key: "drafts", label: "Drafts", count: counts.drafts, icon: FilePlus2 }
        ]}
      />

      <SectionCard>
        <View style={styles.list}>
          {filteredContent.length > 0 ? (
            activeTab === "requests" ? (
              (filteredContent as CreatorBookingInboxState["requests"]).map((request) => (
                <Pressable
                  key={request.id}
                  style={styles.jobCard}
                  onPress={() => router.push(`/app/bookings/${request.id}`)}
                >
                  <View style={styles.jobCardHeader}>
                    <Text style={styles.jobTitle}>{request.eventType}</Text>
                    <StatusBadge label={request.status} />
                  </View>
                  <Text style={styles.jobMeta}>{request.clientName}</Text>
                  <Text style={styles.jobMeta}>
                    {request.requestedSlots[0]
                      ? formatDateLabel(request.requestedSlots[0].startsAt)
                      : "Date pending"}
                  </Text>
                  <Text style={styles.jobMeta}>
                    {request.client?.companyName ?? "Museio booking request"}
                  </Text>
                </Pressable>
              ))
            ) : (
              (filteredContent as CreatorCommercialJobsState["jobs"]).map((entry) => (
                <Pressable
                  key={entry.job.id}
                  style={styles.jobCard}
                  onPress={() => router.push(`/app/jobs/${entry.job.id}`)}
                >
                  <View style={styles.jobCardHeader}>
                    <Text style={styles.jobTitle}>{entry.job.title}</Text>
                    <StatusBadge label={entry.invoice?.status ?? entry.quote?.status ?? entry.job.status} />
                  </View>
                  <Text style={styles.jobMeta}>{entry.job.requesterSnapshot.clientName}</Text>
                  <Text style={styles.jobMeta}>
                    {entry.job.requestedSlots[0]
                      ? formatDateLabel(entry.job.requestedSlots[0].startsAt)
                      : "Date pending"}
                  </Text>
                  <Text style={styles.jobMeta}>
                    {entry.invoice?.invoiceNumber ??
                      entry.quote?.title ??
                      entry.job.eventType}
                  </Text>
                </Pressable>
              ))
            )
          ) : (
            <EmptyPanel
              title={`No ${activeTab} yet`}
              body="This mobile view now follows the prototype structure while still reading from the current Museio backend."
            />
          )}
        </View>
      </SectionCard>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 14
  },
  jobCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: tokens.color.border,
    padding: 16,
    gap: 8
  },
  jobCardHeader: {
    gap: 8
  },
  jobTitle: {
    color: tokens.color.text,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "800"
  },
  jobMeta: {
    color: tokens.color.textMuted,
    fontSize: 14,
    lineHeight: 19
  }
});
