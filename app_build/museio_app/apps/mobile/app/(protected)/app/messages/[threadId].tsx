import { useCallback } from "react";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { fetchThreadDetail } from "../../../../src/lib/api";
import { useProtectedData } from "../../../../src/lib/use-protected-data";
import {
  MobileScreen,
  SectionHeading,
  StateCard,
  StatusBadge,
  SurfaceCard,
  formatDateTimeLabel
} from "../../../../src/ui/mobile-shell";

export default function MessageThreadDetailScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const loader = useCallback(
    (accessToken: string) => fetchThreadDetail(accessToken, threadId),
    [threadId]
  );
  const { state, isLoading, errorMessage } = useProtectedData(
    loader,
    "Could not load message thread."
  );

  if (isLoading) {
    return (
      <MobileScreen
        backHref="/app/messages"
        eyebrow="Thread detail"
        title="Loading thread"
        subtitle="Fetching the message timeline."
        showSecondaryNav={false}
      >
        <StateCard
          eyebrow="Messages"
          title="Loading thread detail"
          body="Pulling participants, messages, and read state."
        />
      </MobileScreen>
    );
  }

  if (!state) {
    return (
      <MobileScreen
        backHref="/app/messages"
        eyebrow="Thread detail"
        title="Thread unavailable"
        subtitle="The mobile thread detail page could not be loaded."
        showSecondaryNav={false}
      >
        <StateCard
          eyebrow="Messages"
          title="Thread unavailable"
          body={errorMessage ?? "Could not load the thread."}
        />
      </MobileScreen>
    );
  }

  const clientParticipant = state.thread.participants.find(
    (participant) => participant.participantType === "client"
  );

  return (
    <MobileScreen
      backHref="/app/messages"
      eyebrow="Thread detail"
      title={state.thread.subject}
      subtitle={clientParticipant?.displayName ?? "Client conversation"}
      showSecondaryNav={false}
    >
      <SurfaceCard tone="dark">
        <Text style={styles.darkTitle}>Thread access is still server-owned.</Text>
        <Text style={styles.darkBody}>
          Creator-only visibility, read state, and linked context remain protected while the mobile
          view makes the conversation easier to follow.
        </Text>
        <StatusBadge label={state.thread.status} />
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          eyebrow="Messages"
          title="Conversation timeline"
          body="The thread detail keeps sender identity and message timing readable on small screens."
        />
        <View style={styles.messageList}>
          {state.messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.senderType === "creator" && styles.messageBubbleCreator
              ]}
            >
              <Text
                style={[
                  styles.messageSender,
                  message.senderType === "creator" && styles.messageSenderCreator
                ]}
              >
                {message.senderType === "creator" ? "You" : clientParticipant?.displayName ?? "Client"}
              </Text>
              <Text
                style={[
                  styles.messageBody,
                  message.senderType === "creator" && styles.messageBodyCreator
                ]}
              >
                {message.body}
              </Text>
              <Text
                style={[
                  styles.messageMeta,
                  message.senderType === "creator" && styles.messageMetaCreator
                ]}
              >
                {formatDateTimeLabel(message.createdAt)}
              </Text>
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
    fontSize: 26,
    lineHeight: 29,
    fontWeight: "900"
  },
  darkBody: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 15,
    lineHeight: 22
  },
  messageList: {
    gap: 12
  },
  messageBubble: {
    alignSelf: "flex-start",
    maxWidth: "86%",
    backgroundColor: "#F2F4F8",
    borderRadius: 22,
    padding: 14,
    gap: 5
  },
  messageBubbleCreator: {
    alignSelf: "flex-end",
    backgroundColor: "#7A42E8"
  },
  messageSender: {
    color: "#4F5868",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    fontWeight: "800"
  },
  messageSenderCreator: {
    color: "rgba(255,255,255,0.72)"
  },
  messageBody: {
    color: "#1F2430",
    fontSize: 15,
    lineHeight: 21
  },
  messageBodyCreator: {
    color: "#FFFFFF"
  },
  messageMeta: {
    color: "#7A7F8C",
    fontSize: 11
  },
  messageMetaCreator: {
    color: "rgba(255,255,255,0.68)"
  }
});
