import { useCallback, useMemo, useState } from "react";
import { router } from "expo-router";
import { MessageSquareMore } from "lucide-react-native";
import { fetchMessagingState } from "../../../src/lib/api";
import { useProtectedData } from "../../../src/lib/use-protected-data";
import {
  AppScaffold,
  EmptyPanel,
  SearchField,
  SectionCard,
  SegmentedTabs,
  StateCard,
  StatusBadge,
  formatDateTimeLabel
} from "../../../src/ui/mobile-shell";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { tokens } from "@museio/ui";

type ThreadTab = "all" | "unread";

export default function MessagesScreen() {
  const loader = useCallback((accessToken: string) => fetchMessagingState(accessToken), []);
  const { state, isLoading, errorMessage } = useProtectedData(
    loader,
    "Could not load messages."
  );
  const [activeTab, setActiveTab] = useState<ThreadTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const threads = useMemo(() => {
    if (!state) {
      return [];
    }

    const visible = activeTab === "unread"
      ? state.threads.filter((thread) => thread.unreadCount > 0)
      : state.threads;

    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return visible;
    }

    return visible.filter((thread) =>
      [thread.subject, thread.lastMessagePreview, thread.participants.find((item) => item.participantType === "client")?.displayName]
        .some((value) => value?.toLowerCase().includes(query))
    );
  }, [activeTab, searchQuery, state]);

  if (isLoading) {
    return (
      <AppScaffold title="Messages" subtitle="Conversations with clients" icon={MessageSquareMore} activeTab="more">
        <StateCard title="Loading messages" body="Pulling thread previews and unread state." />
      </AppScaffold>
    );
  }

  if (!state) {
    return (
      <AppScaffold title="Messages" subtitle="Conversations with clients" icon={MessageSquareMore} activeTab="more">
        <StateCard title="Messages unavailable" body={errorMessage ?? "Could not load messages."} />
      </AppScaffold>
    );
  }

  return (
    <AppScaffold title="Messages" subtitle="Conversations with clients" icon={MessageSquareMore} activeTab="more">
      <SearchField value={searchQuery} onChangeText={setSearchQuery} placeholder="Search threads..." />
      <SegmentedTabs
        active={activeTab}
        onChange={setActiveTab}
        items={[
          { key: "all", label: "All" },
          { key: "unread", label: "Unread", count: state.threads.filter((thread) => thread.unreadCount > 0).length }
        ]}
      />

      <SectionCard>
        <View style={styles.list}>
          {threads.length > 0 ? (
            threads.map((thread) => {
              const client = thread.participants.find((item) => item.participantType === "client");
              return (
                <Pressable
                  key={thread.id}
                  style={styles.threadCard}
                  onPress={() => router.push(`/app/messages/${thread.id}`)}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {(client?.displayName ?? thread.subject).charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.threadText}>
                    <View style={styles.threadHeader}>
                      <Text style={styles.threadTitle}>{client?.displayName ?? thread.subject}</Text>
                      {thread.unreadCount > 0 ? <StatusBadge label={`${thread.unreadCount} unread`} /> : null}
                    </View>
                    <Text style={styles.threadSubject}>{thread.subject}</Text>
                    {thread.lastMessagePreview ? (
                      <Text style={styles.threadPreview}>{thread.lastMessagePreview}</Text>
                    ) : null}
                    {thread.lastMessageAt ? (
                      <Text style={styles.threadMeta}>{formatDateTimeLabel(thread.lastMessageAt)}</Text>
                    ) : null}
                  </View>
                </Pressable>
              );
            })
          ) : (
            <EmptyPanel
              title="No conversations yet"
              body="Threads appear once client messaging is created from booking, job, or invoice context."
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
  threadCard: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: tokens.color.border,
    padding: 16
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: tokens.color.accentSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    color: tokens.color.accent,
    fontWeight: "800"
  },
  threadText: {
    flex: 1,
    gap: 4
  },
  threadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "flex-start"
  },
  threadTitle: {
    flex: 1,
    color: tokens.color.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "800"
  },
  threadSubject: {
    color: tokens.color.textMuted,
    fontSize: 13,
    lineHeight: 18
  },
  threadPreview: {
    color: tokens.color.text,
    fontSize: 14,
    lineHeight: 19
  },
  threadMeta: {
    color: tokens.color.textSubtle,
    fontSize: 12,
    lineHeight: 16
  }
});
