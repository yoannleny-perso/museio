import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import {
  Alert,
  Image as ReactNativeImage,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from "react-native";
import {
  CalendarDays,
  Camera,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  GripVertical,
  ImagePlus,
  Music4,
  Palette,
  Pencil,
  Plus,
  PlaySquare,
  Share2,
  Sparkles,
  Star,
  Trash2,
  UserRound,
  X
} from "lucide-react-native";
import { portfolioSectionLabels } from "@museio/domain";
import type {
  PortfolioEditorState,
  PortfolioSectionDefinition,
  PortfolioSectionKind,
  SocialPlatform
} from "@museio/types";
import { tokens } from "@museio/ui";
import {
  addPortfolioSection,
  createPortfolioPhoto,
  deletePortfolioPhoto,
  deletePortfolioPortrait,
  fetchPortfolioEditorSnapshot,
  removePortfolioSection,
  reorderPortfolioSections,
  updatePortfolioEditor,
  uploadPortfolioPortrait
} from "../lib/api";
import { useAuth } from "../auth/auth-context";
import { sanitizeErrorMessage } from "../lib/use-protected-data";
import { AppScaffold, StateCard, formatDateLabel } from "../ui/mobile-shell";
import {
  displaySocialLinkValue,
  legacySocialLabels,
  legacySocialPlatformOrder,
  LegacySocialIcon,
  normalizeSocialLinkValue,
  visibleSocialEntries
} from "./legacy-social";

type TextEditorState = {
  title: string;
  subtitle: string;
  value: string;
  placeholder?: string;
  multiline?: boolean;
  saveLabel?: string;
  onSave: (value: string) => Promise<void>;
};

type SocialEditorState = {
  platform: SocialPlatform;
  value: string;
};

const fixedSectionKinds = new Set<PortfolioSectionKind>(["hero", "bio"]);
const addableSectionKinds = [
  "photos",
  "videos",
  "music-releases",
  "events",
  "book-me",
  "featured-cards"
] as const satisfies readonly PortfolioSectionKind[];

export default function LegacyPortfolioScreen() {
  const { getAccessToken } = useAuth();
  const [editor, setEditor] = useState<PortfolioEditorState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savingLabel, setSavingLabel] = useState<string | null>(null);
  const [textEditor, setTextEditor] = useState<TextEditorState | null>(null);
  const [socialPickerOpen, setSocialPickerOpen] = useState(false);
  const [socialEditor, setSocialEditor] = useState<SocialEditorState | null>(null);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [portraitCandidate, setPortraitCandidate] =
    useState<ImagePicker.ImagePickerAsset | null>(null);

  const requireAccessToken = useCallback(async () => {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error("A valid session is required.");
    }

    return accessToken;
  }, [getAccessToken]);

  const loadEditor = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const accessToken = await requireAccessToken();
      const nextState = await fetchPortfolioEditorSnapshot(accessToken);
      setEditor(nextState);
    } catch (error) {
      setErrorMessage(sanitizeErrorMessage(error, "Could not load portfolio."));
    } finally {
      setIsLoading(false);
    }
  }, [requireAccessToken]);

  useEffect(() => {
    void loadEditor();
  }, [loadEditor]);

  const runMutation = useCallback(
    async (
      label: string,
      mutation: (accessToken: string) => Promise<PortfolioEditorState>
    ) => {
      try {
        setSavingLabel(label);
        setErrorMessage(null);
        const accessToken = await requireAccessToken();
        const nextState = await mutation(accessToken);
        setEditor(nextState);
        return nextState;
      } catch (error) {
        const message = sanitizeErrorMessage(error, "Could not update portfolio.");
        setErrorMessage(message);
        Alert.alert("Portfolio update failed", message);
        return null;
      } finally {
        setSavingLabel(null);
      }
    },
    [requireAccessToken]
  );

  const updateSnapshot = useCallback(
    async (
      label: string,
      updater: (current: PortfolioEditorState) => PortfolioEditorState
    ) => {
      if (!editor) {
        return null;
      }

      const nextState = updater(editor);

      return runMutation(label, (accessToken) =>
        updatePortfolioEditor(accessToken, {
          settings: nextState.settings,
          content: nextState.content
        })
      );
    },
    [editor, runMutation]
  );

  const visibleSocials = useMemo(
    () => (editor ? visibleSocialEntries(editor.settings.socialLinks) : []),
    [editor]
  );

  const enabledOrderedSections = useMemo(() => {
    if (!editor) {
      return [];
    }

    return editor.settings.sectionOrder
      .map((sectionId) =>
        editor.settings.sections.find((section) => section.id === sectionId)
      )
      .filter((section): section is PortfolioSectionDefinition => Boolean(section?.enabled));
  }, [editor]);

  const movableSections = useMemo(
    () => enabledOrderedSections.filter((section) => !fixedSectionKinds.has(section.kind)),
    [enabledOrderedSections]
  );

  const availableSections = useMemo(() => {
    if (!editor) {
      return [];
    }

    return addableSectionKinds.filter(
      (kind) => !editor.settings.sections.find((section) => section.kind === kind)?.enabled
    );
  }, [editor]);

  async function ensureMediaLibraryPermission() {
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!result.granted) {
      Alert.alert(
        "Photo access required",
        "Allow photo library access to upload portfolio images."
      );
      return false;
    }

    return true;
  }

  async function handlePickPortrait() {
    const hasPermission = await ensureMediaLibraryPermission();

    if (!hasPermission) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.9
    });

    if (!result.canceled && result.assets[0]) {
      setPortraitCandidate(result.assets[0]);
    }
  }

  async function handleSavePortrait() {
    if (!portraitCandidate) {
      return;
    }

    const saved = await runMutation("Saving portrait", (accessToken) =>
      uploadPortfolioPortrait(accessToken, {
        uri: portraitCandidate.uri,
        name: portraitCandidate.fileName ?? "portfolio-portrait.jpg",
        type: portraitCandidate.mimeType ?? "image/jpeg"
      })
    );

    if (saved) {
      setPortraitCandidate(null);
    }
  }

  async function handleDeletePortrait() {
    Alert.alert(
      "Remove portrait photo?",
      "This only removes the current portrait image. Your portfolio settings stay intact.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            void runMutation("Removing portrait", (accessToken) =>
              deletePortfolioPortrait(accessToken)
            );
          }
        }
      ]
    );
  }

  async function handleAddGalleryPhotos() {
    const hasPermission = await ensureMediaLibraryPermission();

    if (!hasPermission || !editor) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 0.9
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    await runMutation("Uploading photos", async (accessToken) => {
      let nextState = editor;

      for (const [index, asset] of result.assets.entries()) {
        nextState =
          (await createPortfolioPhoto(
            accessToken,
            {
              altText:
                asset.fileName?.replace(/\.[^.]+$/, "") ||
                `${editor.settings.artistName || "Portfolio"} photo ${index + 1}`,
              caption: ""
            },
            {
              uri: asset.uri,
              name: asset.fileName ?? `portfolio-photo-${Date.now()}-${index + 1}.jpg`,
              type: asset.mimeType ?? "image/jpeg"
            }
          )) ?? nextState;
      }

      return nextState;
    });
  }

  async function handleDeletePhoto(photoId: string) {
    Alert.alert(
      "Delete photo?",
      "This permanently deletes just this photo from the gallery.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void runMutation("Deleting photo", (accessToken) =>
              deletePortfolioPhoto(accessToken, photoId)
            );
          }
        }
      ]
    );
  }

  async function handleVisibilityChange(nextValue: boolean) {
    if (!editor) {
      return;
    }

    if (nextValue && !editor.settings.handle.trim()) {
      Alert.alert(
        "Public handle required",
        "Set a public handle in Settings before making the portfolio live."
      );
      return;
    }

    await updateSnapshot("Updating visibility", (current) => ({
      ...current,
      settings: {
        ...current.settings,
        visibility: nextValue ? "public" : "private"
      }
    }));
  }

  function openSettingsFieldEditor(
    field: "artistName" | "shortBio" | "fullBio",
    config: {
      title: string;
      subtitle: string;
      placeholder?: string;
      multiline?: boolean;
      saveLabel?: string;
    }
  ) {
    if (!editor) {
      return;
    }

    setTextEditor({
      title: config.title,
      subtitle: config.subtitle,
      value: editor.settings[field],
      placeholder: config.placeholder,
      multiline: config.multiline,
      saveLabel: config.saveLabel,
      onSave: async (value) => {
        await updateSnapshot(config.saveLabel ?? "Saving portfolio", (current) => ({
          ...current,
          settings: {
            ...current.settings,
            [field]: value.trim()
          }
        }));
      }
    });
  }

  function openBookMeEditor(
    field: "heading" | "description" | "primaryLabel" | "secondaryLabel",
    config: {
      title: string;
      subtitle: string;
      placeholder?: string;
      multiline?: boolean;
    }
  ) {
    if (!editor) {
      return;
    }

    setTextEditor({
      title: config.title,
      subtitle: config.subtitle,
      value: editor.content.bookMe[field] ?? "",
      placeholder: config.placeholder,
      multiline: config.multiline,
      saveLabel: "Saving booking CTA",
      onSave: async (value) => {
        await updateSnapshot("Saving booking CTA", (current) => ({
          ...current,
          content: {
            ...current.content,
            bookMe: {
              ...current.content.bookMe,
              [field]: value.trim()
            }
          }
        }));
      }
    });
  }

  function openSocialEditor(platform: SocialPlatform) {
    if (!editor) {
      return;
    }

    setSocialEditor({
      platform,
      value: displaySocialLinkValue(platform, editor.settings.socialLinks[platform])
    });
  }

  async function handleSaveSocialLink(value: string) {
    if (!editor || !socialEditor) {
      return;
    }

    const normalized = normalizeSocialLinkValue(socialEditor.platform, value);

    const saved = await updateSnapshot("Saving social link", (current) => ({
      ...current,
      settings: {
        ...current.settings,
        socialLinks: {
          ...current.settings.socialLinks,
          [socialEditor.platform]: normalized
        }
      }
    }));

    if (saved) {
      setSocialEditor(null);
    }
  }

  async function handleRemoveSocialLink() {
    if (!editor || !socialEditor) {
      return;
    }

    const saved = await updateSnapshot("Removing social link", (current) => ({
      ...current,
      settings: {
        ...current.settings,
        socialLinks: {
          ...current.settings.socialLinks,
          [socialEditor.platform]: ""
        }
      }
    }));

    if (saved) {
      setSocialEditor(null);
    }
  }

  async function handleAddSection(kind: PortfolioSectionKind) {
    const saved = await runMutation("Adding section", (accessToken) =>
      addPortfolioSection(accessToken, { kind })
    );

    if (saved) {
      setAddSectionOpen(false);
    }
  }

  async function handleHideSection(section: PortfolioSectionDefinition) {
    const detail =
      section.kind === "photos"
        ? "Removing the section only hides the layout. Existing photos stay saved."
        : "Removing the section only hides the layout. Existing content stays saved.";

    Alert.alert("Hide section?", detail, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Hide Section",
        style: "destructive",
        onPress: () => {
          void runMutation("Hiding section", (accessToken) =>
            removePortfolioSection(accessToken, section.id)
          );
        }
      }
    ]);
  }

  async function handleMoveSection(sectionId: string, direction: -1 | 1) {
    const movableIds = movableSections.map((section) => section.id);
    const index = movableIds.indexOf(sectionId);
    const nextIndex = index + direction;

    if (index === -1 || nextIndex < 0 || nextIndex >= movableIds.length || !editor) {
      return;
    }

    const reorderedMovable = [...movableIds];
    const [target] = reorderedMovable.splice(index, 1);
    reorderedMovable.splice(nextIndex, 0, target);

    const replacementQueue = [...reorderedMovable];
    const nextEnabledOrder = enabledOrderedSections.map((section) =>
      fixedSectionKinds.has(section.kind) ? section.id : replacementQueue.shift()!
    );

    await runMutation("Reordering sections", (accessToken) =>
      reorderPortfolioSections(accessToken, {
        orderedSectionIds: nextEnabledOrder
      })
    );
  }

  if (isLoading) {
    return (
      <AppScaffold brand activeTab="portfolio">
        <StateCard
          title="Loading portfolio"
          body="Rebuilding the inline portfolio editor from live portfolio settings."
        />
      </AppScaffold>
    );
  }

  if (!editor) {
    return (
      <AppScaffold brand activeTab="portfolio">
        <StateCard
          title="Portfolio unavailable"
          body={errorMessage ?? "Could not load portfolio."}
        />
      </AppScaffold>
    );
  }

  const photoSection = editor.settings.sections.find((section) => section.kind === "photos");
  const handleLabel = editor.settings.handle ? `/${editor.settings.handle}` : "Handle needed";

  return (
    <>
      <AppScaffold
        brand
        activeTab="portfolio"
        topAction={
          <View style={styles.visibilityWrap}>
            <Text style={styles.visibilityLabel}>
              {editor.settings.visibility === "public" ? "Public" : "Private"}
            </Text>
            <Switch
              value={editor.settings.visibility === "public"}
              onValueChange={(value) => void handleVisibilityChange(value)}
              thumbColor="#FFFFFF"
              trackColor={{ false: "#D8DCE7", true: "#BFA7F8" }}
              ios_backgroundColor="#D8DCE7"
            />
          </View>
        }
      >
        {savingLabel ? (
          <InlineStatusBanner title={savingLabel} tone="info" />
        ) : null}
        {errorMessage ? (
          <InlineStatusBanner title={errorMessage} tone="danger" />
        ) : null}

        <View style={styles.surfaceShell}>
          <View style={styles.metaRow}>
            <Pressable
              style={styles.handleChip}
              onPress={() => router.push("/app/settings")}
            >
              <Eye color={tokens.color.accent} size={15} strokeWidth={2.3} />
              <Text style={styles.handleChipText}>
                {editor.settings.visibility === "public" ? handleLabel : `Draft · ${handleLabel}`}
              </Text>
            </Pressable>

            <View style={styles.metaActions}>
              <Pressable
                style={styles.metaActionPill}
                onPress={() => router.push("/app/theme-studio")}
              >
                <Palette color={tokens.color.accent} size={15} strokeWidth={2.3} />
                <Text style={styles.metaActionText}>Theme</Text>
              </Pressable>
              <Pressable
                style={styles.metaActionPill}
                onPress={() => router.push("/app/portfolio-insights")}
              >
                <Sparkles color={tokens.color.accent} size={15} strokeWidth={2.3} />
                <Text style={styles.metaActionText}>Insights</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.portraitFrame}>
              {editor.settings.portraitUrl ? (
                <>
                  <ReactNativeImage
                    source={{ uri: editor.settings.portraitUrl }}
                    style={styles.portraitImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={["rgba(255,255,255,0)", "rgba(255,248,238,0.82)", "#FFF8EE"]}
                    style={styles.heroGradient}
                  />
                  <View style={styles.portraitActions}>
                    <RoundIconButton icon={Camera} onPress={handlePickPortrait} />
                    <RoundIconButton
                      icon={Trash2}
                      onPress={handleDeletePortrait}
                      tone="danger"
                    />
                  </View>
                  <View style={styles.heroIdentity}>
                    <Pressable
                      onPress={() =>
                        openSettingsFieldEditor("artistName", {
                          title: "Artist Name",
                          subtitle: "Add the name that should headline your portfolio.",
                          placeholder: "Yoann DJset"
                        })
                      }
                    >
                      <Text style={styles.artistNameText}>
                        {editor.settings.artistName || "Add Artist Name"}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() =>
                        openSettingsFieldEditor("shortBio", {
                          title: "Short Bio",
                          subtitle: "Write the one-liner shown under your artist name.",
                          placeholder: "Famous DJ that perform all over the world!"
                        })
                      }
                    >
                      <Text style={styles.shortBioText}>
                        {editor.settings.shortBio || "Tap to add your short bio"}
                      </Text>
                    </Pressable>
                    <View style={styles.socialRow}>
                      {visibleSocials.length > 0 ? (
                        visibleSocials.map(([platform]) => (
                          <Pressable
                            key={platform}
                            style={styles.socialIconButton}
                            onPress={() => openSocialEditor(platform)}
                          >
                            <LegacySocialIcon platform={platform} color="#5A6072" size={18} />
                          </Pressable>
                        ))
                      ) : (
                        <Text style={styles.socialEmptyInline}>Add your social links</Text>
                      )}
                      <Pressable
                        style={styles.socialAddButton}
                        onPress={() => setSocialPickerOpen(true)}
                      >
                        <Plus color={tokens.color.accent} size={16} strokeWidth={2.5} />
                      </Pressable>
                    </View>
                  </View>
                </>
              ) : (
                <Pressable style={styles.emptyHero} onPress={handlePickPortrait}>
                  <View style={styles.emptyHeroIcon}>
                    <UploadGlyph />
                  </View>
                  <Text style={styles.emptyHeroTitle}>Add Portrait Photo</Text>
                  <Text style={styles.emptyHeroBody}>
                    Upload a professional portrait to showcase your profile
                  </Text>
                  <View style={styles.recommendBadge}>
                    <Text style={styles.recommendBadgeText}>4:5 ratio recommended</Text>
                  </View>
                  <Text style={styles.emptyHeroHint}>Tap to browse your photo library</Text>
                </Pressable>
              )}
            </View>

            {!editor.settings.artistName ? (
              <PlaceholderEditorCard
                icon={UserRound}
                title="Add Artist Name"
                body="Click to add your artist or stage name"
                onPress={() =>
                  openSettingsFieldEditor("artistName", {
                    title: "Artist Name",
                    subtitle: "Add the name that should headline your portfolio.",
                    placeholder: "Yoann DJset"
                  })
                }
              />
            ) : null}

            {!editor.settings.shortBio ? (
              <PlaceholderEditorCard
                icon={FileText}
                title="Add Short Bio"
                body="Add a brief tagline or description about yourself"
                onPress={() =>
                  openSettingsFieldEditor("shortBio", {
                    title: "Short Bio",
                    subtitle: "Write the one-liner shown under your artist name.",
                    placeholder: "Famous DJ that perform all over the world!"
                  })
                }
              />
            ) : null}

            {visibleSocials.length === 0 ? (
              <PlaceholderEditorCard
                icon={Share2}
                title="Add Social Media Links"
                body="Connect your social profiles to grow your audience"
                onPress={() => setSocialPickerOpen(true)}
              />
            ) : null}

            <RichTextCard
              title="About"
              body={
                editor.settings.fullBio ||
                "Add your longer artist story, booking context, or performance background."
              }
              isEmpty={!editor.settings.fullBio}
              onPress={() =>
                openSettingsFieldEditor("fullBio", {
                  title: "Full Bio",
                  subtitle: "Add your fuller story for live mode and long-form portfolio sections.",
                  placeholder: "Tell your story, performance background, and what makes your set unique.",
                  multiline: true,
                  saveLabel: "Saving full bio"
                })
              }
            />

            {movableSections.map((section) => (
              <PortfolioSectionBlock
                key={section.id}
                section={section}
                canMoveUp={movableSections.findIndex((item) => item.id === section.id) > 0}
                canMoveDown={
                  movableSections.findIndex((item) => item.id === section.id) <
                  movableSections.length - 1
                }
                onMoveUp={() => void handleMoveSection(section.id, -1)}
                onMoveDown={() => void handleMoveSection(section.id, 1)}
                onHide={() => void handleHideSection(section)}
                onManage={() => router.push(`/app/portfolio-section/${section.id}`)}
              >
                {renderSectionBody({
                  section,
                  editor,
                  onAddPhotos: handleAddGalleryPhotos,
                  onDeletePhoto: handleDeletePhoto,
                  onEditBookMe: openBookMeEditor
                })}
              </PortfolioSectionBlock>
            ))}

            <Pressable style={styles.addSectionCard} onPress={() => setAddSectionOpen(true)}>
              <View style={styles.addSectionIcon}>
                <Plus color="#FFFFFF" size={20} strokeWidth={2.7} />
              </View>
              <Text style={styles.addSectionTitle}>Add New Section</Text>
              <Text style={styles.addSectionBody}>
                Choose from various content types to showcase your work
              </Text>
            </Pressable>

            <View style={styles.footerActionRow}>
              <Pressable
                style={styles.footerAction}
                onPress={() => router.push("/app/portfolio-builder")}
              >
                <Text style={styles.footerActionText}>Advanced section tools</Text>
              </Pressable>
              {photoSection?.enabled ? (
                <Pressable style={styles.footerAction} onPress={handleAddGalleryPhotos}>
                  <Text style={styles.footerActionText}>Upload photos</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>
      </AppScaffold>

      <TextEditorModal
        state={textEditor}
        onClose={() => setTextEditor(null)}
        onConfirm={async (value) => {
          if (!textEditor) {
            return;
          }

          await textEditor.onSave(value);
          setTextEditor(null);
        }}
      />

      <SocialPlatformPickerModal
        open={socialPickerOpen}
        activePlatforms={new Set(visibleSocials.map(([platform]) => platform))}
        onClose={() => setSocialPickerOpen(false)}
        onSelect={(platform) => {
          setSocialPickerOpen(false);
          openSocialEditor(platform);
        }}
      />

      <SocialLinkEditorModal
        state={socialEditor}
        onClose={() => setSocialEditor(null)}
        onConfirm={(value) => handleSaveSocialLink(value)}
        onRemove={() => handleRemoveSocialLink()}
      />

      <PortraitPreviewModal
        asset={portraitCandidate}
        onClose={() => setPortraitCandidate(null)}
        onConfirm={() => handleSavePortrait()}
      />

      <AddSectionModal
        open={addSectionOpen}
        availableSections={availableSections}
        onClose={() => setAddSectionOpen(false)}
        onSelect={(kind) => void handleAddSection(kind)}
      />
    </>
  );
}

function renderSectionBody({
  section,
  editor,
  onAddPhotos,
  onDeletePhoto,
  onEditBookMe
}: {
  section: PortfolioSectionDefinition;
  editor: PortfolioEditorState;
  onAddPhotos: () => Promise<void>;
  onDeletePhoto: (photoId: string) => Promise<void>;
  onEditBookMe: (
    field: "heading" | "description" | "primaryLabel" | "secondaryLabel",
    config: {
      title: string;
      subtitle: string;
      placeholder?: string;
      multiline?: boolean;
    }
  ) => void;
}) {
  switch (section.kind) {
    case "photos":
      return (
        <PhotoGalleryPanel
          photos={editor.content.photos}
          onAddPhotos={onAddPhotos}
          onDeletePhoto={onDeletePhoto}
        />
      );
    case "videos":
      return (
        <PreviewListPanel
          emptyTitle="No videos yet"
          emptyBody="Add reel, promo, or performance videos from the advanced editor."
          items={editor.content.videos.map((video) => ({
            id: video.id,
            title: video.title,
            subtitle: video.caption || video.embedUrl.replace(/^https?:\/\//, "")
          }))}
          icon={PlaySquare}
        />
      );
    case "music-releases":
      return (
        <PreviewListPanel
          emptyTitle="No releases yet"
          emptyBody="Add singles, EPs, or platform links from the advanced editor."
          items={editor.content.musicReleases.map((release) => ({
            id: release.id,
            title: release.title,
            subtitle: release.subtitle || `${release.links.length} link${release.links.length === 1 ? "" : "s"}`
          }))}
          icon={Music4}
        />
      );
    case "events":
      return (
        <PreviewListPanel
          emptyTitle="No events yet"
          emptyBody="Add upcoming gigs or appearances from the advanced editor."
          items={editor.content.events.map((event) => ({
            id: event.id,
            title: event.title,
            subtitle: `${formatDateLabel(event.eventDate)} · ${event.location}`
          }))}
          icon={CalendarDays}
        />
      );
    case "featured-cards":
      return (
        <PreviewListPanel
          emptyTitle="No featured cards yet"
          emptyBody="Highlight promo cards, press snippets, or call-to-action modules."
          items={editor.content.featuredCards.map((card) => ({
            id: card.id,
            title: card.title,
            subtitle: card.description
          }))}
          icon={Star}
        />
      );
    case "book-me":
      return (
        <BookMePanel bookMe={editor.content.bookMe} onEdit={onEditBookMe} />
      );
    case "hero":
    case "bio":
      return null;
  }
}

function PortfolioSectionBlock({
  section,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onHide,
  onManage,
  children
}: {
  section: PortfolioSectionDefinition;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onHide: () => void;
  onManage: () => void;
  children: ReactNode;
}) {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionBlockHeader}>
        <View style={styles.sectionTitleRow}>
          <GripVertical color="#A17A2B" size={18} strokeWidth={2.2} />
          <Text style={styles.sectionBlockTitle}>{section.title}</Text>
        </View>
        <View style={styles.sectionBlockActions}>
          <SectionControlButton
            icon={ChevronUp}
            disabled={!canMoveUp}
            onPress={onMoveUp}
          />
          <SectionControlButton
            icon={ChevronDown}
            disabled={!canMoveDown}
            onPress={onMoveDown}
          />
          <SectionControlButton icon={Pencil} onPress={onManage} />
          <SectionControlButton icon={Trash2} tone="danger" onPress={onHide} />
        </View>
      </View>
      {children}
    </View>
  );
}

function PhotoGalleryPanel({
  photos,
  onAddPhotos,
  onDeletePhoto
}: {
  photos: PortfolioEditorState["content"]["photos"];
  onAddPhotos: () => Promise<void>;
  onDeletePhoto: (photoId: string) => Promise<void>;
}) {
  const visiblePhotos = photos.slice(0, 5);
  const placeholderCount = Math.max(0, 5 - visiblePhotos.length);

  return (
    <View style={styles.photoPanel}>
      <View style={styles.photoGrid}>
        {visiblePhotos.map((photo) => (
          <View key={photo.id} style={styles.photoTile}>
            <ReactNativeImage
              source={{ uri: photo.imageUrl }}
              style={styles.photoTileImage}
              resizeMode="cover"
            />
            <Pressable
              style={styles.photoDeleteButton}
              onPress={() => void onDeletePhoto(photo.id)}
            >
              <Trash2 color="#FFFFFF" size={12} strokeWidth={2.5} />
            </Pressable>
          </View>
        ))}

        <Pressable style={styles.photoUploadTile} onPress={() => void onAddPhotos()}>
          <Text style={styles.photoUploadLabel}>
            {visiblePhotos.length === 0 ? "Drop photos here or click to browse" : "Add more photos"}
          </Text>
        </Pressable>

        {Array.from({ length: placeholderCount }).map((_, index) => (
          <Pressable
            key={`placeholder-${index}`}
            style={styles.photoPlaceholderTile}
            onPress={() => void onAddPhotos()}
          >
            <Text style={styles.photoPlaceholderLabel}>Drop photos here or click to browse</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.photoMetaText}>JPG, PNG, WebP up to 10MB each</Text>
      <View style={styles.photoActionsRow}>
        <Pressable style={styles.primaryInlineButton} onPress={() => void onAddPhotos()}>
          <ImagePlus color="#FFFFFF" size={15} strokeWidth={2.4} />
          <Text style={styles.primaryInlineButtonText}>
            Upload {visiblePhotos.length > 0 ? `${visiblePhotos.length} More` : "Photos"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function PreviewListPanel({
  emptyTitle,
  emptyBody,
  items,
  icon: Icon
}: {
  emptyTitle: string;
  emptyBody: string;
  items: Array<{ id: string; title: string; subtitle: string }>;
  icon: typeof Music4;
}) {
  if (items.length === 0) {
    return (
      <View style={styles.emptyContentPanel}>
        <View style={styles.emptyContentIcon}>
          <Icon color={tokens.color.accent} size={20} strokeWidth={2.2} />
        </View>
        <Text style={styles.emptyContentTitle}>{emptyTitle}</Text>
        <Text style={styles.emptyContentBody}>{emptyBody}</Text>
      </View>
    );
  }

  return (
    <View style={styles.previewList}>
      {items.slice(0, 3).map((item) => (
        <View key={item.id} style={styles.previewListItem}>
          <View style={styles.previewListBullet}>
            <Icon color={tokens.color.accent} size={14} strokeWidth={2.3} />
          </View>
          <View style={styles.previewListText}>
            <Text style={styles.previewListTitle}>{item.title}</Text>
            <Text style={styles.previewListSubtitle}>{item.subtitle}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function BookMePanel({
  bookMe,
  onEdit
}: {
  bookMe: PortfolioEditorState["content"]["bookMe"];
  onEdit: (
    field: "heading" | "description" | "primaryLabel" | "secondaryLabel",
    config: {
      title: string;
      subtitle: string;
      placeholder?: string;
      multiline?: boolean;
    }
  ) => void;
}) {
  return (
    <View style={styles.bookMePanel}>
      <Pressable
        onPress={() =>
          onEdit("heading", {
            title: "Book Me Heading",
            subtitle: "Set the booking section headline.",
            placeholder: "Ready to Book?"
          })
        }
      >
        <Text style={styles.bookMeTitle}>{bookMe.heading || "Add booking heading"}</Text>
      </Pressable>
      <Pressable
        onPress={() =>
          onEdit("description", {
            title: "Book Me Description",
            subtitle: "Explain how clients should use this section.",
            placeholder: "Use this section as your premium booking entry point.",
            multiline: true
          })
        }
      >
        <Text style={styles.bookMeBody}>
          {bookMe.description || "Add booking description"}
        </Text>
      </Pressable>
      <View style={styles.bookMeButtonRow}>
        <Pressable
          style={styles.primaryInlineButton}
          onPress={() =>
            onEdit("primaryLabel", {
              title: "Primary CTA Label",
              subtitle: "Set the main booking button label.",
              placeholder: "Booking Coming Soon"
            })
          }
        >
          <Text style={styles.primaryInlineButtonText}>
            {bookMe.primaryLabel || "Primary CTA"}
          </Text>
        </Pressable>
        <Pressable
          style={styles.secondaryInlineButton}
          onPress={() =>
            onEdit("secondaryLabel", {
              title: "Secondary CTA Label",
              subtitle: "Optional alternate booking CTA.",
              placeholder: "Send an Inquiry"
            })
          }
        >
          <Text style={styles.secondaryInlineButtonText}>
            {bookMe.secondaryLabel || "Secondary CTA"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function PlaceholderEditorCard({
  icon: Icon,
  title,
  body,
  onPress
}: {
  icon: typeof UserRound;
  title: string;
  body: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.placeholderCard} onPress={onPress}>
      <View style={styles.placeholderIconWrap}>
        <Icon color="#7A7F8C" size={26} strokeWidth={1.9} />
      </View>
      <Text style={styles.placeholderTitle}>{title}</Text>
      <Text style={styles.placeholderBody}>{body}</Text>
    </Pressable>
  );
}

function RichTextCard({
  title,
  body,
  isEmpty,
  onPress
}: {
  title: string;
  body: string;
  isEmpty: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.richTextCard} onPress={onPress}>
      <Text style={styles.richTextLabel}>{title}</Text>
      <Text style={[styles.richTextBody, isEmpty && styles.richTextBodyMuted]}>{body}</Text>
    </Pressable>
  );
}

function TextEditorModal({
  state,
  onClose,
  onConfirm
}: {
  state: TextEditorState | null;
  onClose: () => void;
  onConfirm: (value: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setDraft(state?.value ?? "");
  }, [state]);

  return (
    <Modal transparent animationType="fade" visible={Boolean(state)} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.modalBackdropPressable} onPress={onClose} />
        <View style={styles.dialogCard}>
          <View style={styles.dialogHeader}>
            <View style={styles.dialogHeaderText}>
              <Text style={styles.dialogTitle}>{state?.title}</Text>
              <Text style={styles.dialogSubtitle}>{state?.subtitle}</Text>
            </View>
            <Pressable style={styles.dialogClose} onPress={onClose}>
              <X color={tokens.color.accent} size={18} strokeWidth={2.5} />
            </Pressable>
          </View>
          <TextInput
            multiline={state?.multiline}
            numberOfLines={state?.multiline ? 5 : 1}
            value={draft}
            onChangeText={setDraft}
            placeholder={state?.placeholder}
            placeholderTextColor="#B2B7C4"
            style={[styles.dialogInput, state?.multiline && styles.dialogInputMultiline]}
            textAlignVertical={state?.multiline ? "top" : "center"}
          />
          <View style={styles.dialogActions}>
            <Pressable style={styles.secondaryDialogButton} onPress={onClose}>
              <Text style={styles.secondaryDialogButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={styles.primaryDialogButton}
              onPress={() => void onConfirm(draft)}
            >
              <Text style={styles.primaryDialogButtonText}>
                {state?.saveLabel ?? "Save"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SocialPlatformPickerModal({
  open,
  activePlatforms,
  onClose,
  onSelect
}: {
  open: boolean;
  activePlatforms: Set<SocialPlatform>;
  onClose: () => void;
  onSelect: (platform: SocialPlatform) => void;
}) {
  return (
    <Modal transparent animationType="fade" visible={open} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.modalBackdropPressable} onPress={onClose} />
        <View style={styles.dialogCardLarge}>
          <View style={styles.dialogHeader}>
            <View style={styles.dialogHeaderText}>
              <Text style={styles.dialogTitle}>Add Social Platform</Text>
            </View>
            <Pressable style={styles.dialogClose} onPress={onClose}>
              <X color={tokens.color.accent} size={18} strokeWidth={2.5} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.socialPickerList}>
              {legacySocialPlatformOrder.map((platform) => (
                <Pressable
                  key={platform}
                  style={[
                    styles.socialPickerItem,
                    activePlatforms.has(platform) && styles.socialPickerItemActive
                  ]}
                  onPress={() => onSelect(platform)}
                >
                  <LegacySocialIcon platform={platform} color="#5A6072" size={24} />
                  <Text style={styles.socialPickerLabel}>{legacySocialLabels[platform]}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function SocialLinkEditorModal({
  state,
  onClose,
  onConfirm,
  onRemove
}: {
  state: SocialEditorState | null;
  onClose: () => void;
  onConfirm: (value: string) => Promise<void>;
  onRemove: () => Promise<void>;
}) {
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setDraft(state?.value ?? "");
  }, [state]);

  if (!state) {
    return null;
  }

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.modalBackdropPressable} onPress={onClose} />
        <View style={styles.dialogCard}>
          <View style={styles.dialogHeader}>
            <View style={styles.dialogHeaderText}>
              <Text style={styles.dialogTitle}>{legacySocialLabels[state.platform]}</Text>
              <Text style={styles.dialogSubtitle}>
                Add or update the public link for this platform.
              </Text>
            </View>
            <Pressable style={styles.dialogClose} onPress={onClose}>
              <X color={tokens.color.accent} size={18} strokeWidth={2.5} />
            </Pressable>
          </View>

          <View style={styles.socialEditorHeader}>
            <LegacySocialIcon platform={state.platform} color={tokens.color.accent} size={24} />
            <Text style={styles.socialEditorTitle}>{legacySocialLabels[state.platform]}</Text>
          </View>

          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={
              state.platform === "email" ? "you@example.com" : "https://"
            }
            placeholderTextColor="#B2B7C4"
            style={styles.dialogInput}
            autoCapitalize="none"
            keyboardType={state.platform === "email" ? "email-address" : "url"}
          />

          <View style={styles.dialogActionsStacked}>
            <Pressable
              style={styles.primaryDialogButton}
              onPress={() => void onConfirm(draft)}
            >
              <Text style={styles.primaryDialogButtonText}>Save Link</Text>
            </Pressable>
            <View style={styles.dialogActions}>
              <Pressable style={styles.secondaryDialogButton} onPress={onClose}>
                <Text style={styles.secondaryDialogButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.dangerDialogButton} onPress={() => void onRemove()}>
                <Text style={styles.dangerDialogButtonText}>Remove</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function PortraitPreviewModal({
  asset,
  onClose,
  onConfirm
}: {
  asset: ImagePicker.ImagePickerAsset | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <Modal transparent animationType="fade" visible={Boolean(asset)} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.modalBackdropPressable} onPress={onClose} />
        <View style={styles.imageDialogCard}>
          <View style={styles.dialogHeader}>
            <View style={styles.dialogHeaderText}>
              <Text style={styles.dialogTitle}>Edit Portfolio Photo</Text>
            </View>
            <Pressable style={styles.dialogClose} onPress={onClose}>
              <X color={tokens.color.accent} size={18} strokeWidth={2.5} />
            </Pressable>
          </View>
          {asset ? (
            <ReactNativeImage
              source={{ uri: asset.uri }}
              style={styles.portraitPreviewImage}
              resizeMode="cover"
            />
          ) : null}
          <Text style={styles.imageDialogHint}>
            Preview your portrait before saving it to the portfolio header.
          </Text>
          <View style={styles.dialogActions}>
            <Pressable style={styles.secondaryDialogButton} onPress={onClose}>
              <Text style={styles.secondaryDialogButtonText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.primaryDialogButton} onPress={() => void onConfirm()}>
              <Text style={styles.primaryDialogButtonText}>Save Image</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function AddSectionModal({
  open,
  availableSections,
  onClose,
  onSelect
}: {
  open: boolean;
  availableSections: readonly PortfolioSectionKind[];
  onClose: () => void;
  onSelect: (kind: PortfolioSectionKind) => void;
}) {
  return (
    <Modal transparent animationType="fade" visible={open} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.modalBackdropPressable} onPress={onClose} />
        <View style={styles.dialogCard}>
          <View style={styles.dialogHeader}>
            <View style={styles.dialogHeaderText}>
              <Text style={styles.dialogTitle}>Add New Section</Text>
              <Text style={styles.dialogSubtitle}>
                Turn on another portfolio block without deleting any existing content.
              </Text>
            </View>
            <Pressable style={styles.dialogClose} onPress={onClose}>
              <X color={tokens.color.accent} size={18} strokeWidth={2.5} />
            </Pressable>
          </View>

          <View style={styles.addSectionList}>
            {availableSections.length > 0 ? (
              availableSections.map((kind) => (
                <Pressable
                  key={kind}
                  style={styles.addSectionListItem}
                  onPress={() => onSelect(kind)}
                >
                  <Text style={styles.addSectionListTitle}>
                    {portfolioSectionLabels[kind]}
                  </Text>
                  <Text style={styles.addSectionListSubtitle}>
                    Add this section back into the live editor layout.
                  </Text>
                </Pressable>
              ))
            ) : (
              <Text style={styles.emptyAddSectionText}>
                All current built-in sections are already enabled.
              </Text>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SectionControlButton({
  icon: Icon,
  onPress,
  disabled = false,
  tone = "default"
}: {
  icon: typeof ChevronUp;
  onPress: () => void;
  disabled?: boolean;
  tone?: "default" | "danger";
}) {
  return (
    <Pressable
      style={[
        styles.sectionControlButton,
        disabled && styles.sectionControlButtonDisabled
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Icon
        color={tone === "danger" ? tokens.color.danger : "#8D6D31"}
        size={14}
        strokeWidth={2.4}
      />
    </Pressable>
  );
}

function RoundIconButton({
  icon: Icon,
  onPress,
  tone = "default"
}: {
  icon: typeof Camera;
  onPress: () => void;
  tone?: "default" | "danger";
}) {
  return (
    <Pressable style={styles.roundIconButton} onPress={onPress}>
      <Icon
        color={tone === "danger" ? tokens.color.danger : tokens.color.accent}
        size={16}
        strokeWidth={2.5}
      />
    </Pressable>
  );
}

function InlineStatusBanner({
  title,
  tone
}: {
  title: string;
  tone: "info" | "danger";
}) {
  return (
    <View
      style={[
        styles.inlineBanner,
        tone === "danger" ? styles.inlineBannerDanger : styles.inlineBannerInfo
      ]}
    >
      <Text
        style={[
          styles.inlineBannerText,
          tone === "danger" && styles.inlineBannerTextDanger
        ]}
      >
        {title}
      </Text>
    </View>
  );
}

function UploadGlyph() {
  return (
    <View style={styles.uploadGlyphWrap}>
      <View style={styles.uploadGlyphArrowStem} />
      <View style={styles.uploadGlyphArrowHeadLeft} />
      <View style={styles.uploadGlyphArrowHeadRight} />
      <View style={styles.uploadGlyphTray} />
    </View>
  );
}

const styles = StyleSheet.create({
  visibilityWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  visibilityLabel: {
    color: tokens.color.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700"
  },
  inlineBanner: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 11
  },
  inlineBannerInfo: {
    backgroundColor: "#EEF3FF"
  },
  inlineBannerDanger: {
    backgroundColor: "#FFF0F3"
  },
  inlineBannerText: {
    color: tokens.color.info,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700"
  },
  inlineBannerTextDanger: {
    color: tokens.color.danger
  },
  surfaceShell: {
    gap: 14
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  handleChip: {
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E6D6B4",
    backgroundColor: "#FFF8EE",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  handleChipText: {
    color: tokens.color.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700"
  },
  metaActions: {
    flexDirection: "row",
    gap: 8,
    flexShrink: 1
  },
  metaActionPill: {
    minHeight: 38,
    borderRadius: 999,
    backgroundColor: "#F7F1FF",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  metaActionText: {
    color: tokens.color.accent,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700"
  },
  heroCard: {
    borderRadius: 26,
    backgroundColor: "#FFF8EE",
    borderWidth: 1,
    borderColor: "#F2D8AF",
    padding: 12,
    gap: 12,
    shadowColor: "#EBC67A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 26
  },
  portraitFrame: {
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F4E2C0",
    minHeight: 336
  },
  portraitImage: {
    width: "100%",
    aspectRatio: 4 / 5
  },
  heroGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 220
  },
  portraitActions: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    gap: 8
  },
  roundIconButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(139,106,230,0.18)"
  },
  heroIdentity: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 16,
    gap: 8
  },
  artistNameText: {
    color: "#21202B",
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "900"
  },
  shortBioText: {
    color: "#5A6072",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600"
  },
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap"
  },
  socialIconButton: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center"
  },
  socialEmptyInline: {
    color: "#6E7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600"
  },
  socialAddButton: {
    width: 28,
    height: 28,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#DCC7FF",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  emptyHero: {
    minHeight: 336,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#F0D7A8",
    backgroundColor: "#FFF6E7",
    paddingHorizontal: 24,
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  },
  emptyHeroIcon: {
    width: 62,
    height: 62,
    borderRadius: 999,
    backgroundColor: "#FFF1D8",
    alignItems: "center",
    justifyContent: "center"
  },
  emptyHeroTitle: {
    color: tokens.color.text,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "800",
    textAlign: "center"
  },
  emptyHeroBody: {
    color: "#63697A",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center"
  },
  recommendBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#F3E8D0"
  },
  recommendBadgeText: {
    color: "#9A7A3B",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700"
  },
  emptyHeroHint: {
    color: "#8D7551",
    fontSize: 12,
    lineHeight: 16
  },
  placeholderCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#F0D7A8",
    backgroundColor: "#FFF6E7",
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",
    gap: 8
  },
  placeholderIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: "#FFF1D8",
    alignItems: "center",
    justifyContent: "center"
  },
  placeholderTitle: {
    color: tokens.color.text,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "800",
    textAlign: "center"
  },
  placeholderBody: {
    color: "#666C7B",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center"
  },
  richTextCard: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2C9",
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 8
  },
  richTextLabel: {
    color: "#8E6F34",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  richTextBody: {
    color: tokens.color.text,
    fontSize: 15,
    lineHeight: 22
  },
  richTextBodyMuted: {
    color: "#7F8695"
  },
  sectionBlock: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#F0D8AE",
    backgroundColor: "#FFF8ED",
    padding: 14,
    gap: 12
  },
  sectionBlockHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  sectionBlockTitle: {
    color: tokens.color.text,
    fontSize: 21,
    lineHeight: 25,
    fontWeight: "900"
  },
  sectionBlockActions: {
    flexDirection: "row",
    gap: 6
  },
  sectionControlButton: {
    width: 28,
    height: 28,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E7CC9B",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  sectionControlButtonDisabled: {
    opacity: 0.4
  },
  photoPanel: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F2E1C2",
    padding: 12,
    gap: 10
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  photoTile: {
    width: "31%",
    aspectRatio: 0.82,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative"
  },
  photoTileImage: {
    width: "100%",
    height: "100%"
  },
  photoDeleteButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: "rgba(24,24,32,0.64)",
    alignItems: "center",
    justifyContent: "center"
  },
  photoUploadTile: {
    width: "31%",
    aspectRatio: 0.82,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#EACB94",
    backgroundColor: "#FFF9F0",
    padding: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  photoUploadLabel: {
    color: "#8D7858",
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
    fontWeight: "600"
  },
  photoPlaceholderTile: {
    width: "31%",
    aspectRatio: 0.82,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#EFDAB4",
    backgroundColor: "#FFFDFC",
    padding: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  photoPlaceholderLabel: {
    color: "#A08C69",
    fontSize: 11,
    lineHeight: 15,
    textAlign: "center"
  },
  photoMetaText: {
    color: "#8E8164",
    fontSize: 12,
    lineHeight: 16
  },
  photoActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-start"
  },
  primaryInlineButton: {
    minHeight: 38,
    borderRadius: 12,
    backgroundColor: "#E39B2B",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  primaryInlineButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "800"
  },
  secondaryInlineButton: {
    minHeight: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E1D8C7",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  secondaryInlineButtonText: {
    color: tokens.color.text,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "800"
  },
  previewList: {
    gap: 10
  },
  previewListItem: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F2E3CA",
    padding: 12
  },
  previewListBullet: {
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: "#F5ECFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1
  },
  previewListText: {
    flex: 1,
    gap: 3
  },
  previewListTitle: {
    color: tokens.color.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800"
  },
  previewListSubtitle: {
    color: "#697082",
    fontSize: 12,
    lineHeight: 17
  },
  emptyContentPanel: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#EFDAB4",
    backgroundColor: "#FFFDF9",
    paddingHorizontal: 20,
    paddingVertical: 22,
    alignItems: "center",
    gap: 8
  },
  emptyContentIcon: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "#F6EDFF",
    alignItems: "center",
    justifyContent: "center"
  },
  emptyContentTitle: {
    color: tokens.color.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "800",
    textAlign: "center"
  },
  emptyContentBody: {
    color: "#767E8F",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center"
  },
  bookMePanel: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F2E1C2",
    padding: 14,
    gap: 10
  },
  bookMeTitle: {
    color: tokens.color.text,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900"
  },
  bookMeBody: {
    color: "#6B7282",
    fontSize: 14,
    lineHeight: 20
  },
  bookMeButtonRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap"
  },
  addSectionCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E2B765",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 22,
    alignItems: "center",
    gap: 8
  },
  addSectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#E39B2B",
    alignItems: "center",
    justifyContent: "center"
  },
  addSectionTitle: {
    color: tokens.color.text,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900"
  },
  addSectionBody: {
    color: "#6E7380",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center"
  },
  footerActionRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap"
  },
  footerAction: {
    minHeight: 38,
    borderRadius: 999,
    paddingHorizontal: 14,
    backgroundColor: "#F6EFD9",
    alignItems: "center",
    justifyContent: "center"
  },
  footerActionText: {
    color: "#8D6C32",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "800"
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: tokens.color.overlay,
    justifyContent: "center",
    paddingHorizontal: 20
  },
  modalBackdropPressable: {
    ...StyleSheet.absoluteFillObject
  },
  dialogCard: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 20,
    gap: 16
  },
  dialogCardLarge: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 20,
    gap: 16,
    maxHeight: "80%"
  },
  imageDialogCard: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 20,
    gap: 14
  },
  dialogHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14
  },
  dialogHeaderText: {
    flex: 1,
    gap: 4
  },
  dialogTitle: {
    color: tokens.color.text,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900"
  },
  dialogSubtitle: {
    color: "#6B7282",
    fontSize: 13,
    lineHeight: 18
  },
  dialogClose: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#DCC7FF",
    alignItems: "center",
    justifyContent: "center"
  },
  dialogInput: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E4E7F0",
    backgroundColor: "#F8F9FC",
    paddingHorizontal: 14,
    color: tokens.color.text,
    fontSize: 15
  },
  dialogInputMultiline: {
    minHeight: 128,
    paddingTop: 14,
    paddingBottom: 14
  },
  dialogActions: {
    flexDirection: "row",
    gap: 10
  },
  dialogActionsStacked: {
    gap: 10
  },
  primaryDialogButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: tokens.color.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14
  },
  primaryDialogButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "800"
  },
  secondaryDialogButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E4E7F0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14
  },
  secondaryDialogButtonText: {
    color: tokens.color.text,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "700"
  },
  dangerDialogButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: "#FFF0F3",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14
  },
  dangerDialogButtonText: {
    color: tokens.color.danger,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "800"
  },
  socialPickerList: {
    gap: 6
  },
  socialPickerItem: {
    minHeight: 54,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  socialPickerItemActive: {
    backgroundColor: "#F5F6FA"
  },
  socialPickerLabel: {
    color: tokens.color.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700"
  },
  socialEditorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  socialEditorTitle: {
    color: tokens.color.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "800"
  },
  portraitPreviewImage: {
    width: "100%",
    aspectRatio: 4 / 5,
    borderRadius: 18,
    backgroundColor: "#F2F4F8"
  },
  imageDialogHint: {
    color: "#6D7380",
    fontSize: 13,
    lineHeight: 18
  },
  addSectionList: {
    gap: 8
  },
  addSectionListItem: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0E3C7",
    backgroundColor: "#FFF8EE",
    padding: 14,
    gap: 4
  },
  addSectionListTitle: {
    color: tokens.color.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800"
  },
  addSectionListSubtitle: {
    color: "#6F7685",
    fontSize: 13,
    lineHeight: 18
  },
  emptyAddSectionText: {
    color: "#6F7685",
    fontSize: 14,
    lineHeight: 20
  },
  uploadGlyphWrap: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center"
  },
  uploadGlyphArrowStem: {
    position: "absolute",
    top: 2,
    width: 3,
    height: 13,
    borderRadius: 999,
    backgroundColor: "#8E8F97"
  },
  uploadGlyphArrowHeadLeft: {
    position: "absolute",
    top: 3,
    left: 8,
    width: 10,
    height: 3,
    borderRadius: 999,
    backgroundColor: "#8E8F97",
    transform: [{ rotate: "-45deg" }]
  },
  uploadGlyphArrowHeadRight: {
    position: "absolute",
    top: 3,
    right: 8,
    width: 10,
    height: 3,
    borderRadius: 999,
    backgroundColor: "#8E8F97",
    transform: [{ rotate: "45deg" }]
  },
  uploadGlyphTray: {
    position: "absolute",
    bottom: 5,
    width: 18,
    height: 11,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#8E8F97"
  }
});
