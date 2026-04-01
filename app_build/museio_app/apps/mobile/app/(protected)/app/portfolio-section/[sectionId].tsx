import { useCallback, useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { fetchPortfolioEditorSnapshot } from "../../../../src/lib/api";
import { useProtectedData } from "../../../../src/lib/use-protected-data";
import {
  DetailRow,
  DetailScaffold,
  SectionCard,
  SectionHeader,
  StateCard,
  StatusBadge
} from "../../../../src/ui/mobile-shell";

export default function PortfolioSectionScreen() {
  const { sectionId } = useLocalSearchParams<{ sectionId: string }>();
  const loader = useCallback((accessToken: string) => fetchPortfolioEditorSnapshot(accessToken), []);
  const { state, isLoading, errorMessage } = useProtectedData(
    loader,
    "Could not load portfolio section."
  );

  const section = useMemo(
    () => state?.settings.sections.find((item) => item.id === sectionId),
    [sectionId, state]
  );

  if (isLoading) {
    return (
      <DetailScaffold backHref="/app/portfolio-builder" title="Portfolio Section" subtitle="Loading section">
        <StateCard title="Loading section" body="Pulling live section detail." />
      </DetailScaffold>
    );
  }

  if (!state || !section) {
    return (
      <DetailScaffold backHref="/app/portfolio-builder" title="Portfolio Section" subtitle="Section unavailable">
        <StateCard
          title="Section unavailable"
          body={errorMessage ?? "Could not load the requested section."}
        />
      </DetailScaffold>
    );
  }

  const counts = {
    photos: state.content.photos.length,
    videos: state.content.videos.length,
    events: state.content.events.length,
    "music-releases": state.content.musicReleases.length,
    "featured-cards": state.content.featuredCards.length
  };

  return (
    <DetailScaffold backHref="/app/portfolio-builder" title={section.title} subtitle={section.kind.replace(/-/g, " ")}>
      <SectionCard>
        <SectionHeader
          title={section.title}
          subtitle="This mobile screen mirrors the block-specific prototype intent without introducing fake save behavior."
          action={<StatusBadge label={section.enabled ? "enabled" : "hidden"} />}
        />
      </SectionCard>

      <SectionCard>
        <DetailRow label="Kind" value={section.kind.replace(/-/g, " ")} />
        <DetailRow label="Order" value={String(state.settings.sectionOrder.indexOf(section.id) + 1)} />
        <DetailRow
          label="Collection size"
          value={
            section.kind in counts
              ? String(counts[section.kind as keyof typeof counts])
              : section.kind === "book-me"
                ? state.content.bookMe.primaryLabel
                : section.kind === "bio"
                  ? state.settings.fullBio || "No bio yet"
                  : state.settings.artistName || "No hero content yet"
          }
        />
      </SectionCard>
    </DetailScaffold>
  );
}
