import { useCallback, useMemo, useState } from "react";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronLeft, ChevronRight, CirclePlus } from "lucide-react-native";
import { tokens } from "@museio/ui";
import { fetchCommercialJobs } from "../../../src/lib/api";
import { useProtectedData } from "../../../src/lib/use-protected-data";
import {
  AppScaffold,
  EmptyPanel,
  SectionCard,
  SectionHeader,
  StateCard,
  StatusBadge,
  formatDateLabel
} from "../../../src/ui/mobile-shell";

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function startOfWeek(date: Date) {
  return addDays(date, -date.getDay());
}

function endOfWeek(date: Date) {
  return addDays(date, 6 - date.getDay());
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function isSameMonth(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
}

export default function HomeScreen() {
  const loader = useCallback((accessToken: string) => fetchCommercialJobs(accessToken), []);
  const { state, isLoading, errorMessage } = useProtectedData(loader, "Could not load home.");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const first = startOfWeek(monthStart);
    const last = endOfWeek(monthEnd);
    const days: Date[] = [];
    let cursor = first;
    while (cursor <= last) {
      days.push(cursor);
      cursor = addDays(cursor, 1);
    }
    return days;
  }, [currentMonth]);

  const jobs = state?.jobs ?? [];

  const jobsForSelectedDate = useMemo(() => {
    return jobs.filter((entry) =>
      entry.job.requestedSlots.some((slot) => isSameDay(new Date(slot.startsAt), selectedDate))
    );
  }, [jobs, selectedDate]);

  function getJobCountForDate(date: Date) {
    return jobs.filter((entry) =>
      entry.job.requestedSlots.some((slot) => isSameDay(new Date(slot.startsAt), date))
    ).length;
  }

  if (isLoading) {
    return (
      <AppScaffold
        brand
        activeTab="home"
        showProfileButton
      >
        <StateCard title="Loading home" body="Pulling your calendar and jobs." />
      </AppScaffold>
    );
  }

  if (!state) {
    return (
      <AppScaffold
        brand
        activeTab="home"
        showProfileButton
      >
        <StateCard title="We couldn't load Home" body={errorMessage ?? "Please try again in a moment."} />
      </AppScaffold>
    );
  }

  return (
    <AppScaffold
      brand
      activeTab="home"
      showProfileButton
    >
      <SectionCard>
        <View style={styles.calendarHeader}>
          <Text style={styles.calendarMonth}>
            {currentMonth.toLocaleDateString("en-AU", {
              month: "long",
              year: "numeric"
            })}
          </Text>
          <View style={styles.calendarNav}>
            <Pressable
              style={styles.calendarNavButton}
              onPress={() =>
                setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                )
              }
            >
              <ChevronLeft color={tokens.color.textMuted} size={18} strokeWidth={2.3} />
            </Pressable>
            <Pressable
              style={styles.calendarNavButton}
              onPress={() =>
                setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                )
              }
            >
              <ChevronRight color={tokens.color.textMuted} size={18} strokeWidth={2.3} />
            </Pressable>
          </View>
        </View>

        <View style={styles.weekdays}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <Text key={day} style={styles.weekdayLabel}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {calendarDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const inMonth = isSameMonth(day, currentMonth);
            const jobCount = getJobCountForDate(day);

            return (
              <Pressable
                key={day.toISOString()}
                style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                onPress={() => setSelectedDate(day)}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    !inMonth && styles.dayLabelMuted,
                    isSelected && styles.dayLabelSelected
                  ]}
                >
                  {day.getDate()}
                </Text>
                {jobCount > 0 ? (
                  <View style={styles.dayDots}>
                    {Array.from({ length: Math.min(jobCount, 3) }).map((_, index) => (
                      <View
                        key={`${day.toISOString()}-${index}`}
                        style={[styles.dayDot, isSelected && styles.dayDotSelected]}
                      />
                    ))}
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </SectionCard>

      <SectionCard>
        <SectionHeader
          title={selectedDate.toLocaleDateString("en-AU", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
          })}
          subtitle={`${jobsForSelectedDate.length} ${jobsForSelectedDate.length === 1 ? "job" : "jobs"}`}
        />

        {jobsForSelectedDate.length > 0 ? (
          <View style={styles.jobList}>
            {jobsForSelectedDate.map((entry) => {
              const primarySlot = entry.job.requestedSlots[0];
              return (
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
                  <Text style={styles.jobMeta}>{primarySlot ? formatDateLabel(primarySlot.startsAt) : "Date pending"}</Text>
                  <Text style={styles.jobMeta}>
                    {entry.job.servicePackageNotes || entry.job.eventNotes || entry.job.eventType}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <EmptyPanel
            title="No jobs scheduled"
            body="You don't have any jobs on this date."
            action={
              <Pressable style={styles.addButton} onPress={() => router.push("/app/jobs/new")}>
                <CirclePlus color={tokens.color.accent} size={16} strokeWidth={2.3} />
                <Text style={styles.addButtonText}>Add a Job</Text>
              </Pressable>
            }
          />
        )}
      </SectionCard>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  calendarMonth: {
    color: tokens.color.text,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "800"
  },
  calendarNav: {
    flexDirection: "row",
    gap: 6
  },
  calendarNavButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.82)",
    alignItems: "center",
    justifyContent: "center"
  },
  weekdays: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  weekdayLabel: {
    width: `${100 / 7}%`,
    color: tokens.color.textSubtle,
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
    fontWeight: "600"
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: 18
  },
  dayCellSelected: {
    backgroundColor: tokens.color.accent,
    shadowColor: tokens.color.accent,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7
  },
  dayLabel: {
    color: tokens.color.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700"
  },
  dayLabelMuted: {
    color: "#C4C8D1"
  },
  dayLabelSelected: {
    color: "#FFFFFF"
  },
  dayDots: {
    flexDirection: "row",
    gap: 3
  },
  dayDot: {
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: tokens.color.accent
  },
  dayDotSelected: {
    backgroundColor: "#FFFFFF"
  },
  jobList: {
    gap: 12
  },
  jobCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.82)",
    backgroundColor: "rgba(255,255,255,0.68)",
    padding: 16,
    gap: 8
  },
  jobCardHeader: {
    gap: 8
  },
  jobTitle: {
    color: tokens.color.text,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "800"
  },
  jobMeta: {
    color: tokens.color.textMuted,
    fontSize: 14,
    lineHeight: 19
  },
  addButton: {
    alignSelf: "flex-start",
    minHeight: 40,
    borderRadius: 999,
    backgroundColor: "rgba(244,238,253,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  addButtonText: {
    color: tokens.color.accent,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700"
  }
});
