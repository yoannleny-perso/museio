import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { tokens } from "@museio/ui";
import type { PortfolioEditorState } from "@museio/types";
import { fetchPortfolioEditorSnapshot } from "../../../src/lib/api";
import { useAuth } from "../../../src/auth/auth-context";

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

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
            Fetching the protected portfolio state from the API.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const activeTheme =
    state.availableThemes.find((theme) => theme.id === state.settings.themeId) ??
    state.availableThemes[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.hero, { backgroundColor: tokens.color.surfaceDark }]}>
          <Text style={styles.badge}>Portfolio flagship</Text>
          <Text style={styles.title}>{state.settings.artistName || "Untitled portfolio"}</Text>
          <Text style={styles.heroBody}>
            {state.settings.visibility === "public" ? "Public" : "Private"} · /
            {state.settings.handle || "handle-needed"}
          </Text>
          <Text style={styles.heroSubtle}>
            {state.settings.shortBio || "Add a short bio to give the public portfolio a stronger first impression."}
          </Text>
        </View>

        <View style={styles.metricRow}>
          <MetricCard label="Theme" value={activeTheme?.label ?? "Default"} />
          <MetricCard label="Sections" value={String(state.settings.sectionOrder.length)} />
          <MetricCard label="Visibility" value={state.settings.visibility} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardBadge}>Live sections</Text>
          <Text style={styles.cardTitle}>Current section order</Text>
          <View style={styles.list}>
            {state.settings.sectionOrder.map((sectionId) => {
              const section = state.settings.sections.find(
                (candidate) => candidate.id === sectionId
              );

              if (!section) {
                return null;
              }

              return (
                <View key={section.id} style={styles.listRow}>
                  <Text style={styles.listItem}>{section.title}</Text>
                  <Text style={styles.listMeta}>{section.enabled ? "Enabled" : "Hidden"}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardBadge}>Collections</Text>
          <Text style={styles.cardTitle}>What the portfolio can already show</Text>
          <View style={styles.collectionGrid}>
            <MetricCard label="Photos" value={String(state.content.photos.length)} />
            <MetricCard label="Videos" value={String(state.content.videos.length)} />
            <MetricCard label="Releases" value={String(state.content.musicReleases.length)} />
            <MetricCard label="Events" value={String(state.content.events.length)} />
            <MetricCard label="Cards" value={String(state.content.featuredCards.length)} />
          </View>
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
    padding: 20,
    gap: 16
  },
  hero: {
    borderRadius: tokens.radius.lg,
    padding: 24,
    gap: 10
  },
  card: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: 22,
    gap: 10,
    borderWidth: 1,
    borderColor: tokens.color.border
  },
  badge: {
    color: "#D8CBFF",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    fontSize: 12,
    fontWeight: "700"
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 32,
    color: "#FFFFFF"
  },
  heroBody: {
    fontSize: 16,
    lineHeight: 24,
    color: "rgba(255,255,255,0.78)"
  },
  heroSubtle: {
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255,255,255,0.66)"
  },
  metricRow: {
    gap: 12
  },
  metricCard: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: tokens.radius.md,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: tokens.color.border
  },
  metricLabel: {
    fontSize: 12,
    color: tokens.color.textSubtle,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "700"
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "800",
    color: tokens.color.text
  },
  cardBadge: {
    color: tokens.color.accent,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    fontSize: 12,
    fontWeight: "700"
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: tokens.color.text
  },
  list: {
    gap: 10
  },
  listRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.border
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    color: tokens.color.text,
    fontWeight: "700"
  },
  listMeta: {
    fontSize: 14,
    color: tokens.color.textMuted
  },
  collectionGrid: {
    gap: 10
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: tokens.color.textMuted
  }
});
