import { useCallback, useState } from "react";
import { router } from "expo-router";
import { ChevronDown, ChevronUp, Eye, PenSquare, Plus, Sparkles } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { fetchPortfolioEditorSnapshot } from "../../../src/lib/api";
import { useProtectedData } from "../../../src/lib/use-protected-data";
import {
  DetailScaffold,
  EmptyPanel,
  SectionCard,
  SectionHeader,
  StateCard,
  StatusBadge
} from "../../../src/ui/mobile-shell";
import { tokens } from "@museio/ui";

export default function PortfolioBuilderScreen() {
  const loader = useCallback((accessToken: string) => fetchPortfolioEditorSnapshot(accessToken), []);
  const { state, isLoading, errorMessage } = useProtectedData(
    loader,
    "Could not load portfolio builder."
  );
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <DetailScaffold backHref="/app/portfolio" title="Portfolio Builder" subtitle="Loading section structure">
        <StateCard title="Loading builder" body="Pulling section ordering and content readiness." />
      </DetailScaffold>
    );
  }

  if (!state) {
    return (
      <DetailScaffold backHref="/app/portfolio" title="Portfolio Builder" subtitle="Builder unavailable">
        <StateCard
          title="Builder unavailable"
          body={errorMessage ?? "Could not load portfolio builder."}
        />
      </DetailScaffold>
    );
  }

  if (state.settings.sectionOrder.length === 0) {
    return (
      <DetailScaffold backHref="/app/portfolio" title="Portfolio Builder" subtitle="Section system">
        <EmptyPanel
          title="Start building"
          body="No sections have been configured yet."
        />
      </DetailScaffold>
    );
  }

  return (
    <DetailScaffold backHref="/app/portfolio" title="Portfolio Builder" subtitle="Hero, bio, sections, and publish structure">
      {state.settings.sectionOrder.map((sectionId, index) => {
        const section = state.settings.sections.find((item) => item.id === sectionId);

        if (!section) {
          return null;
        }

        const isExpanded = expandedSectionId === section.id;

        return (
          <SectionCard key={section.id}>
            <Pressable
              style={styles.sectionRow}
              onPress={() => setExpandedSectionId(isExpanded ? null : section.id)}
            >
              <View style={styles.dragStub}>
                <Text style={styles.dragStubText}>{index + 1}</Text>
              </View>
              <View style={styles.sectionText}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionSubtitle}>{section.kind.replace(/-/g, " ")}</Text>
              </View>
              <StatusBadge label={section.enabled ? "enabled" : "hidden"} />
              {isExpanded ? (
                <ChevronUp color={tokens.color.textSubtle} size={18} strokeWidth={2.2} />
              ) : (
                <ChevronDown color={tokens.color.textSubtle} size={18} strokeWidth={2.2} />
              )}
            </Pressable>

            {isExpanded ? (
              <View style={styles.expandedActions}>
                <Pressable
                  style={styles.primaryAction}
                  onPress={() => router.push(`/app/portfolio-section/${section.id}`)}
                >
                  <PenSquare color="#FFFFFF" size={16} strokeWidth={2.2} />
                  <Text style={styles.primaryActionText}>Inspect</Text>
                </Pressable>
                <Pressable style={styles.secondaryAction} onPress={() => router.push("/app/theme-studio")}>
                  <Sparkles color={tokens.color.accent} size={16} strokeWidth={2.2} />
                  <Text style={styles.secondaryActionText}>Style</Text>
                </Pressable>
                <Pressable style={styles.secondaryAction} onPress={() => router.push("/app/portfolio-insights")}>
                  <Eye color={tokens.color.accent} size={16} strokeWidth={2.2} />
                  <Text style={styles.secondaryActionText}>Preview</Text>
                </Pressable>
              </View>
            ) : null}
          </SectionCard>
        );
      })}

      <SectionCard tone="accent">
        <SectionHeader
          title="Add section"
          subtitle="Future multi-instance section creation will layer onto this same structure."
        />
        <Pressable style={styles.addSectionRow}>
          <Plus color={tokens.color.accent} size={18} strokeWidth={2.3} />
          <Text style={styles.addSectionText}>Section creation remains web-first in this build.</Text>
        </Pressable>
      </SectionCard>
    </DetailScaffold>
  );
}

const styles = StyleSheet.create({
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  dragStub: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: "#F4EEFD",
    alignItems: "center",
    justifyContent: "center"
  },
  dragStubText: {
    color: tokens.color.accent,
    fontSize: 13,
    fontWeight: "800"
  },
  sectionText: {
    flex: 1,
    gap: 2
  },
  sectionTitle: {
    color: tokens.color.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "800"
  },
  sectionSubtitle: {
    color: tokens.color.textSubtle,
    fontSize: 13,
    lineHeight: 18,
    textTransform: "capitalize"
  },
  expandedActions: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap"
  },
  primaryAction: {
    minHeight: 40,
    borderRadius: 16,
    backgroundColor: tokens.color.accent,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700"
  },
  secondaryAction: {
    minHeight: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tokens.color.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  secondaryActionText: {
    color: tokens.color.accent,
    fontSize: 14,
    fontWeight: "700"
  },
  addSectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  addSectionText: {
    color: tokens.color.textMuted,
    fontSize: 14,
    lineHeight: 19
  }
});
