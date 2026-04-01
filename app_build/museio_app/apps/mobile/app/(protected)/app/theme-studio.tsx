import { useCallback, useState } from "react";
import { Palette } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { fetchPortfolioEditorSnapshot } from "../../../src/lib/api";
import { useProtectedData } from "../../../src/lib/use-protected-data";
import {
  DetailScaffold,
  SectionCard,
  SectionHeader,
  StateCard,
  StatusBadge
} from "../../../src/ui/mobile-shell";
import type { PortfolioThemeId } from "@museio/types";
import { tokens } from "@museio/ui";

export default function ThemeStudioScreen() {
  const loader = useCallback((accessToken: string) => fetchPortfolioEditorSnapshot(accessToken), []);
  const { state, isLoading, errorMessage } = useProtectedData(
    loader,
    "Could not load theme studio."
  );
  const [selectedThemeId, setSelectedThemeId] = useState<PortfolioThemeId | null>(null);

  if (isLoading) {
    return (
      <DetailScaffold backHref="/app/portfolio" title="Theme Studio" subtitle="Loading theme options">
        <StateCard title="Loading theme studio" body="Pulling live portfolio themes and current style direction." />
      </DetailScaffold>
    );
  }

  if (!state) {
    return (
      <DetailScaffold backHref="/app/portfolio" title="Theme Studio" subtitle="Theme studio unavailable">
        <StateCard
          title="Theme studio unavailable"
          body={errorMessage ?? "Could not load theme studio."}
        />
      </DetailScaffold>
    );
  }

  const activeThemeId = selectedThemeId ?? state.settings.themeId;
  const activeTheme = state.availableThemes.find((theme) => theme.id === activeThemeId) ?? state.availableThemes[0];

  return (
    <DetailScaffold backHref="/app/portfolio" title="Theme Studio" subtitle="Choose the portfolio mood">
      <SectionCard tone={activeTheme.surfaceMode === "dark" ? "dark" : "accent"}>
        <SectionHeader
          title={activeTheme.label}
          subtitle={activeTheme.description}
          action={<StatusBadge label={selectedThemeId ? "preview" : "live"} />}
        />
      </SectionCard>

      {state.availableThemes.map((theme) => (
        <Pressable
          key={theme.id}
          style={[
            styles.themeCard,
            activeThemeId === theme.id && styles.themeCardActive
          ]}
          onPress={() => setSelectedThemeId(theme.id)}
        >
          <View style={styles.swatches}>
            <View style={[styles.swatch, { backgroundColor: theme.gradient[0] }]} />
            <View style={[styles.swatch, { backgroundColor: theme.gradient[1] }]} />
            <View style={[styles.swatch, { backgroundColor: theme.accent }]} />
          </View>
          <View style={styles.themeText}>
            <Text style={styles.themeTitle}>{theme.label}</Text>
            <Text style={styles.themeSubtitle}>{theme.description}</Text>
          </View>
          {activeThemeId === theme.id ? (
            <View style={styles.activeDot} />
          ) : null}
        </Pressable>
      ))}

      <SectionCard tone="accent">
        <SectionHeader
          title="Theme application"
          subtitle="Preview is real on mobile, but saving theme changes remains web-first in this build."
        />
        <View style={styles.previewRow}>
          <Palette color={tokens.color.accent} size={18} strokeWidth={2.2} />
          <Text style={styles.previewText}>Current live theme: {state.settings.themeId}</Text>
        </View>
      </SectionCard>
    </DetailScaffold>
  );
}

const styles = StyleSheet.create({
  themeCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: tokens.color.border,
    backgroundColor: "#FFFFFF",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  themeCardActive: {
    borderColor: tokens.color.accent,
    backgroundColor: "#FBF8FF"
  },
  swatches: {
    flexDirection: "row",
    gap: 4
  },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: 999
  },
  themeText: {
    flex: 1,
    gap: 4
  },
  themeTitle: {
    color: tokens.color.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "800"
  },
  themeSubtitle: {
    color: tokens.color.textMuted,
    fontSize: 13,
    lineHeight: 18
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: tokens.color.accent
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  previewText: {
    color: tokens.color.textMuted,
    fontSize: 14,
    lineHeight: 19
  }
});
