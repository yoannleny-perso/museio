import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { tokens } from "@museio/ui";
import type { PortfolioEditorState } from "@museio/types";
import { fetchPortfolioEditorSnapshot } from "../../../src/lib/api";
import { useAuth } from "../../../src/auth/auth-context";

export default function PortfolioWorkspaceScreen() {
  const { getAccessToken } = useAuth();
  const [state, setState] = useState<PortfolioEditorState | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    getAccessToken()
      .then((accessToken) => {
        if (!accessToken) {
          throw new Error("Sign in to load the portfolio workspace.");
        }

        return fetchPortfolioEditorSnapshot(accessToken);
      })
      .then((editorState) => {
        setState(editorState);
      })
      .catch((error) => {
        setErrorMessage(
          error instanceof Error ? error.message : "Could not load portfolio data."
        );
      });
  }, [getAccessToken]);

  if (errorMessage) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.card}>
          <Text style={styles.badge}>Portfolio</Text>
          <Text style={styles.title}>Portfolio workspace unavailable</Text>
          <Text style={styles.body}>{errorMessage}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!state) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.card}>
          <Text style={styles.badge}>Portfolio</Text>
          <Text style={styles.title}>Loading portfolio workspace…</Text>
          <Text style={styles.body}>
            Fetching the shared portfolio editor state from the API.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.badge}>Portfolio slice</Text>
          <Text style={styles.title}>{state.settings.artistName || "Untitled"}</Text>
          <Text style={styles.body}>
            {state.settings.visibility === "public" ? "Public" : "Private"} · /
            {state.settings.handle || "handle-needed"}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Theme</Text>
          <Text style={styles.body}>
            {
              state.availableThemes.find((theme) => theme.id === state.settings.themeId)
                ?.label
            }
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Live sections</Text>
          <View style={styles.list}>
            {state.settings.sectionOrder.map((sectionId) => {
              const section = state.settings.sections.find(
                (candidate) => candidate.id === sectionId
              );

              if (!section) {
                return null;
              }

              return (
                <Text key={section.id} style={styles.listItem}>
                  {section.title}
                </Text>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Collection counts</Text>
          <Text style={styles.body}>Photos: {state.content.photos.length}</Text>
          <Text style={styles.body}>Videos: {state.content.videos.length}</Text>
          <Text style={styles.body}>
            Music releases: {state.content.musicReleases.length}
          </Text>
          <Text style={styles.body}>Events: {state.content.events.length}</Text>
          <Text style={styles.body}>
            Featured cards: {state.content.featuredCards.length}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tokens.color.background
  },
  container: {
    padding: 24,
    gap: 18
  },
  hero: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: 24,
    gap: 10
  },
  card: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: 24,
    gap: 8
  },
  badge: {
    color: tokens.color.accent,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    fontSize: 12
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: tokens.color.text
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: tokens.color.textMuted
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: tokens.color.text
  },
  list: {
    gap: 6
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    color: tokens.color.text
  }
});
