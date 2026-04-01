import { useCallback } from "react";
import { BarChart3 } from "lucide-react-native";
import { fetchPortfolioEditorSnapshot } from "../../../src/lib/api";
import { useProtectedData } from "../../../src/lib/use-protected-data";
import {
  DetailScaffold,
  MetricGrid,
  SectionCard,
  SectionHeader,
  StateCard
} from "../../../src/ui/mobile-shell";

export default function PortfolioInsightsScreen() {
  const loader = useCallback((accessToken: string) => fetchPortfolioEditorSnapshot(accessToken), []);
  const { state, isLoading, errorMessage } = useProtectedData(
    loader,
    "Could not load portfolio insights."
  );

  if (isLoading) {
    return (
      <DetailScaffold backHref="/app/portfolio" title="Portfolio Insights" subtitle="Loading signals">
        <StateCard title="Loading insights" body="Calculating mobile-facing portfolio signals." />
      </DetailScaffold>
    );
  }

  if (!state) {
    return (
      <DetailScaffold backHref="/app/portfolio" title="Portfolio Insights" subtitle="Insights unavailable">
        <StateCard
          title="Insights unavailable"
          body={errorMessage ?? "Could not load portfolio insights."}
        />
      </DetailScaffold>
    );
  }

  const enabledSections = state.settings.sections.filter((section) => section.enabled);
  const bookingStartSignals = [
    state.content.bookMe.primaryLabel ? 1 : 0,
    state.content.events.length > 0 ? 1 : 0,
    state.content.featuredCards.length > 0 ? 1 : 0,
    state.settings.visibility === "public" ? 1 : 0
  ];

  return (
    <DetailScaffold backHref="/app/portfolio" title="Portfolio Insights" subtitle="Portfolio health and conversion footing">
      <MetricGrid
        items={[
          {
            label: "Enabled Sections",
            value: String(enabledSections.length),
            subtitle: "Live in public mode",
            tone: "accent"
          },
          {
            label: "Top Media",
            value: String(state.content.photos.length + state.content.videos.length),
            subtitle: "Photos + videos"
          },
          {
            label: "Booking Signals",
            value: `${Math.round((bookingStartSignals.filter(Boolean).length / bookingStartSignals.length) * 100)}%`,
            subtitle: "CTA and booking readiness",
            tone: "success"
          }
        ]}
      />

      <SectionCard>
        <SectionHeader title="Top performing sections" subtitle="Using real enabled sections rather than mock analytics." />
        {enabledSections.map((section, index) => (
          <SectionCard key={section.id} tone={index === 0 ? "accent" : "default"}>
            <SectionHeader
              title={`${index + 1}. ${section.title}`}
              subtitle={section.kind.replace(/-/g, " ")}
            />
          </SectionCard>
        ))}
      </SectionCard>

      <SectionCard tone="accent">
        <SectionHeader
          title="AI-shaped insight"
          subtitle="Portfolios with a visible CTA, public handle, and multiple media surfaces feel substantially closer to launch-ready."
        />
        <BarChart3 color="#7A42E8" size={18} strokeWidth={2.2} />
      </SectionCard>
    </DetailScaffold>
  );
}
