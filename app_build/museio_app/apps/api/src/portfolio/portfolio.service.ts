import { randomUUID } from "node:crypto";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common";
import {
  createEmptyPortfolioContent,
  createSectionDefinition,
  getPortfolioThemeOption,
  hasContentForSection,
  portfolioSectionKinds,
  portfolioThemeIds,
  portfolioThemeOptions
} from "@museio/domain";
import type {
  AddPortfolioSectionInput,
  CreatePortfolioEventInput,
  CreatePortfolioFeaturedCardInput,
  CreatePortfolioMusicReleaseInput,
  CreatePortfolioPhotoInput,
  CreatePortfolioVideoInput,
  PortfolioEditorState,
  PortfolioEventItem,
  PortfolioFeaturedCardItem,
  PortfolioMusicReleaseItem,
  PortfolioPhotoItem,
  PortfolioPublicState,
  PortfolioReleaseLink,
  PortfolioSectionDefinition,
  PortfolioSettings,
  PortfolioThemeId,
  ReorderPortfolioSectionsInput,
  UpdatePortfolioEventInput,
  UpdatePortfolioFeaturedCardInput,
  UpdatePortfolioInput,
  UpdatePortfolioMusicReleaseInput,
  UpdatePortfolioPhotoInput,
  UpdatePortfolioVideoInput
} from "@museio/types";
import {
  addPortfolioSectionInputSchema,
  createPortfolioEventInputSchema,
  createPortfolioFeaturedCardInputSchema,
  createPortfolioMusicReleaseInputSchema,
  createPortfolioPhotoInputSchema,
  createPortfolioVideoInputSchema,
  reorderPortfolioSectionsInputSchema,
  updatePortfolioEventInputSchema,
  updatePortfolioFeaturedCardInputSchema,
  updatePortfolioInputSchema,
  updatePortfolioMusicReleaseInputSchema,
  updatePortfolioPhotoInputSchema,
  updatePortfolioVideoInputSchema
} from "@museio/validation";
import type { User } from "@supabase/supabase-js";
import { SupabaseService } from "../supabase/supabase.service";

const HANDLE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PORTRAIT_ASSET_KEY = "portrait";

interface PortfolioSettingsRow {
  id: string;
  owner_user_id: string;
  handle: string | null;
  artist_name: string;
  portrait_storage_path: string | null;
  short_bio: string;
  full_bio: string;
  social_links: Record<string, string>;
  visibility: "private" | "public";
  theme_id: string;
  section_order: string[];
  sections: PortfolioSectionDefinition[];
  book_me_content: {
    heading: string;
    description: string;
    primaryLabel: string;
    secondaryLabel?: string;
  };
  created_at: string;
  updated_at: string;
}

interface PortfolioPhotoRow {
  id: string;
  portfolio_id: string;
  owner_user_id: string;
  storage_path: string;
  alt_text: string;
  caption: string | null;
  sort_order: number;
}

interface PortfolioVideoRow {
  id: string;
  portfolio_id: string;
  owner_user_id: string;
  title: string;
  embed_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  sort_order: number;
}

interface PortfolioMusicReleaseRow {
  id: string;
  portfolio_id: string;
  owner_user_id: string;
  title: string;
  subtitle: string | null;
  cover_storage_path: string | null;
  links: PortfolioReleaseLink[];
  sort_order: number;
}

interface PortfolioEventRow {
  id: string;
  portfolio_id: string;
  owner_user_id: string;
  title: string;
  event_date: string;
  location: string;
  ticket_url: string | null;
  image_storage_path: string | null;
  sort_order: number;
}

interface PortfolioFeaturedCardRow {
  id: string;
  portfolio_id: string;
  owner_user_id: string;
  title: string;
  description: string;
  cta_label: string;
  cta_url: string;
  image_storage_path: string | null;
  sort_order: number;
}

type UploadedPortfolioFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};

type CollectionTableName =
  | "portfolio_photos"
  | "portfolio_videos"
  | "portfolio_music_releases"
  | "portfolio_events"
  | "portfolio_featured_cards";

@Injectable()
export class PortfolioService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getEditorState(accessToken?: string | null) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const settingsRow = await this.ensurePortfolioSettings(user);

    return this.buildEditorState(settingsRow);
  }

  async updateEditorState(payload: UpdatePortfolioInput, accessToken?: string | null) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const parsed = updatePortfolioInputSchema.parse(payload);
    const current = await this.ensurePortfolioSettings(user);
    const normalized = await this.normalizeSettings(
      parsed.settings,
      parsed.content.bookMe,
      current,
      user
    );

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_settings")
      .update({
        handle: normalized.handle,
        artist_name: normalized.artist_name,
        short_bio: normalized.short_bio,
        full_bio: normalized.full_bio,
        social_links: normalized.social_links,
        visibility: normalized.visibility,
        theme_id: normalized.theme_id,
        section_order: normalized.section_order,
        sections: normalized.sections,
        book_me_content: normalized.book_me_content
      })
      .eq("id", current.id)
      .eq("owner_user_id", user.id)
      .select("*")
      .single();

    if (error) {
      this.throwPortfolioPersistenceError(error.message);
    }

    return this.buildEditorState(this.mapSettingsRow(data));
  }

  async addSection(payload: AddPortfolioSectionInput, accessToken?: string | null) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const parsed = addPortfolioSectionInputSchema.parse(payload);
    const current = await this.ensurePortfolioSettings(user);
    const sections = this.coerceSections(current.sections);
    const nextSections = sections.map((section) =>
      section.kind === parsed.kind ? { ...section, enabled: true } : section
    );
    const target = nextSections.find((section) => section.kind === parsed.kind);

    if (!target) {
      throw new BadRequestException(
        "This phase only supports the canonical built-in portfolio sections."
      );
    }

    if (current.sections.find((section) => section.kind === parsed.kind)?.enabled) {
      throw new ConflictException("That section is already active in the layout.");
    }

    const nextOrder = current.section_order.includes(target.id)
      ? [...current.section_order]
      : [...current.section_order, target.id];

    await this.updateSectionLayout(user.id, current.id, nextSections, nextOrder);

    return this.getEditorState(accessToken);
  }

  async reorderSections(
    payload: ReorderPortfolioSectionsInput,
    accessToken?: string | null
  ) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const parsed = reorderPortfolioSectionsInputSchema.parse(payload);
    const current = await this.ensurePortfolioSettings(user);
    const enabledIds = this.coerceSections(current.sections)
      .filter((section) => section.enabled)
      .map((section) => section.id)
      .sort();
    const requestedIds = [...parsed.orderedSectionIds].sort();

    if (enabledIds.join("|") !== requestedIds.join("|")) {
      throw new BadRequestException(
        "Section reordering must include every enabled section exactly once."
      );
    }

    await this.updateSectionLayout(
      user.id,
      current.id,
      this.coerceSections(current.sections),
      parsed.orderedSectionIds
    );

    return this.getEditorState(accessToken);
  }

  async removeSection(sectionId: string, accessToken?: string | null) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const current = await this.ensurePortfolioSettings(user);
    const sections = this.coerceSections(current.sections);
    const target = sections.find((section) => section.id === sectionId);

    if (!target) {
      throw new NotFoundException("Portfolio section not found.");
    }

    const nextSections = sections.map((section) =>
      section.id === sectionId ? { ...section, enabled: false } : section
    );
    const nextOrder = current.section_order.filter(
      (candidateId) => candidateId !== sectionId
    );

    await this.updateSectionLayout(user.id, current.id, nextSections, nextOrder);

    return this.getEditorState(accessToken);
  }

  async uploadPortraitImage(
    accessToken: string | null | undefined,
    file?: UploadedPortfolioFile | null
  ) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const current = await this.ensurePortfolioSettings(user);
    const requiredFile = this.requireFile(file, "portrait image");
    const storagePath = this.buildAssetPath(
      user.id,
      current.id,
      "portrait",
      PORTRAIT_ASSET_KEY,
      requiredFile.originalname
    );

    await this.supabaseService.uploadAsset({
      path: storagePath,
      body: requiredFile.buffer,
      contentType: requiredFile.mimetype
    });

    const previousPath = current.portrait_storage_path;
    const { error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_settings")
      .update({
        portrait_storage_path: storagePath
      })
      .eq("id", current.id)
      .eq("owner_user_id", user.id);

    if (error) {
      await this.supabaseService.removeAsset(storagePath);
      this.throwPortfolioPersistenceError(error.message);
    }

    if (previousPath && previousPath !== storagePath) {
      await this.supabaseService.removeAsset(previousPath);
    }

    return this.getEditorState(accessToken);
  }

  async deletePortraitImage(accessToken?: string | null) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const current = await this.ensurePortfolioSettings(user);

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_settings")
      .update({
        portrait_storage_path: null
      })
      .eq("id", current.id)
      .eq("owner_user_id", user.id);

    if (error) {
      this.throwPortfolioPersistenceError(error.message);
    }

    await this.supabaseService.removeAsset(current.portrait_storage_path);

    return this.getEditorState(accessToken);
  }

  async createPhoto(
    payload: CreatePortfolioPhotoInput,
    accessToken?: string | null,
    file?: UploadedPortfolioFile | null
  ) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const current = await this.ensurePortfolioSettings(user);
    const parsed = createPortfolioPhotoInputSchema.parse(payload);
    const requiredFile = this.requireFile(file, "photo");
    const storagePath = this.buildAssetPath(
      user.id,
      current.id,
      "photos",
      randomUUID(),
      requiredFile.originalname
    );

    await this.supabaseService.uploadAsset({
      path: storagePath,
      body: requiredFile.buffer,
      contentType: requiredFile.mimetype
    });

    const sortOrder = await this.getNextSortOrder("portfolio_photos", current.id);
    const { error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_photos")
      .insert({
        portfolio_id: current.id,
        owner_user_id: user.id,
        storage_path: storagePath,
        alt_text: parsed.altText,
        caption: parsed.caption || null,
        sort_order: sortOrder
      });

    if (error) {
      await this.supabaseService.removeAsset(storagePath);
      this.throwPortfolioPersistenceError(error.message);
    }

    return this.getEditorState(accessToken);
  }

  async updatePhoto(
    photoId: string,
    payload: UpdatePortfolioPhotoInput,
    accessToken?: string | null
  ) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const current = await this.ensurePortfolioSettings(user);
    const parsed = updatePortfolioPhotoInputSchema.parse(payload);
    await this.ensureOwnedRecord("portfolio_photos", photoId, current.id, user.id);

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_photos")
      .update({
        alt_text: parsed.altText,
        caption: parsed.caption || null
      })
      .eq("id", photoId)
      .eq("portfolio_id", current.id)
      .eq("owner_user_id", user.id);

    if (error) {
      this.throwPortfolioPersistenceError(error.message);
    }

    return this.getEditorState(accessToken);
  }

  async replacePhotoImage(
    photoId: string,
    accessToken?: string | null,
    file?: UploadedPortfolioFile | null
  ) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const current = await this.ensurePortfolioSettings(user);
    const existing = await this.ensureOwnedRecord<PortfolioPhotoRow>(
      "portfolio_photos",
      photoId,
      current.id,
      user.id
    );
    const requiredFile = this.requireFile(file, "photo");
    const storagePath = this.buildAssetPath(
      user.id,
      current.id,
      "photos",
      photoId,
      requiredFile.originalname
    );

    await this.supabaseService.uploadAsset({
      path: storagePath,
      body: requiredFile.buffer,
      contentType: requiredFile.mimetype
    });

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_photos")
      .update({
        storage_path: storagePath
      })
      .eq("id", photoId)
      .eq("portfolio_id", current.id)
      .eq("owner_user_id", user.id);

    if (error) {
      await this.supabaseService.removeAsset(storagePath);
      this.throwPortfolioPersistenceError(error.message);
    }

    if (existing.storage_path && existing.storage_path !== storagePath) {
      await this.supabaseService.removeAsset(existing.storage_path);
    }

    return this.getEditorState(accessToken);
  }

  async deletePhoto(photoId: string, accessToken?: string | null) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const current = await this.ensurePortfolioSettings(user);
    const existing = await this.ensureOwnedRecord<PortfolioPhotoRow>(
      "portfolio_photos",
      photoId,
      current.id,
      user.id
    );

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_photos")
      .delete()
      .eq("id", photoId)
      .eq("portfolio_id", current.id)
      .eq("owner_user_id", user.id);

    if (error) {
      this.throwPortfolioPersistenceError(error.message);
    }

    await this.supabaseService.removeAsset(existing.storage_path);

    return this.getEditorState(accessToken);
  }

  async createVideo(payload: CreatePortfolioVideoInput, accessToken?: string | null) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const current = await this.ensurePortfolioSettings(user);
    const parsed = createPortfolioVideoInputSchema.parse(payload);
    const sortOrder = await this.getNextSortOrder("portfolio_videos", current.id);

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_videos")
      .insert({
        portfolio_id: current.id,
        owner_user_id: user.id,
        title: parsed.title,
        embed_url: parsed.embedUrl,
        thumbnail_url: parsed.thumbnailUrl || null,
        caption: parsed.caption || null,
        sort_order: sortOrder
      });

    if (error) {
      this.throwPortfolioPersistenceError(error.message);
    }

    return this.getEditorState(accessToken);
  }

  async updateVideo(
    videoId: string,
    payload: UpdatePortfolioVideoInput,
    accessToken?: string | null
  ) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const current = await this.ensurePortfolioSettings(user);
    const parsed = updatePortfolioVideoInputSchema.parse(payload);
    await this.ensureOwnedRecord("portfolio_videos", videoId, current.id, user.id);

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_videos")
      .update({
        title: parsed.title,
        embed_url: parsed.embedUrl,
        thumbnail_url: parsed.thumbnailUrl || null,
        caption: parsed.caption || null
      })
      .eq("id", videoId)
      .eq("portfolio_id", current.id)
      .eq("owner_user_id", user.id);

    if (error) {
      this.throwPortfolioPersistenceError(error.message);
    }

    return this.getEditorState(accessToken);
  }

  async deleteVideo(videoId: string, accessToken?: string | null) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const current = await this.ensurePortfolioSettings(user);
    await this.ensureOwnedRecord("portfolio_videos", videoId, current.id, user.id);

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_videos")
      .delete()
      .eq("id", videoId)
      .eq("portfolio_id", current.id)
      .eq("owner_user_id", user.id);

    if (error) {
      this.throwPortfolioPersistenceError(error.message);
    }

    return this.getEditorState(accessToken);
  }

  async createMusicRelease(
    payload: CreatePortfolioMusicReleaseInput,
    accessToken?: string | null
  ) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const current = await this.ensurePortfolioSettings(user);
    const parsed = createPortfolioMusicReleaseInputSchema.parse(payload);
    const sortOrder = await this.getNextSortOrder(
      "portfolio_music_releases",
      current.id
    );

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_music_releases")
      .insert({
        portfolio_id: current.id,
        owner_user_id: user.id,
        title: parsed.title,
        subtitle: parsed.subtitle || null,
        links: parsed.links,
        sort_order: sortOrder
      });

    if (error) {
      this.throwPortfolioPersistenceError(error.message);
    }

    return this.getEditorState(accessToken);
  }

  async updateMusicRelease(
    releaseId: string,
    payload: UpdatePortfolioMusicReleaseInput,
    accessToken?: string | null
  ) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const current = await this.ensurePortfolioSettings(user);
    const parsed = updatePortfolioMusicReleaseInputSchema.parse(payload);
    await this.ensureOwnedRecord(
      "portfolio_music_releases",
      releaseId,
      current.id,
      user.id
    );

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_music_releases")
      .update({
        title: parsed.title,
        subtitle: parsed.subtitle || null,
        links: parsed.links
      })
      .eq("id", releaseId)
      .eq("portfolio_id", current.id)
      .eq("owner_user_id", user.id);

    if (error) {
      this.throwPortfolioPersistenceError(error.message);
    }

    return this.getEditorState(accessToken);
  }

  async uploadMusicReleaseCover(
    releaseId: string,
    accessToken?: string | null,
    file?: UploadedPortfolioFile | null
  ) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const current = await this.ensurePortfolioSettings(user);
    const existing = await this.ensureOwnedRecord<PortfolioMusicReleaseRow>(
      "portfolio_music_releases",
      releaseId,
      current.id,
      user.id
    );
    const requiredFile = this.requireFile(file, "music release cover");
    const storagePath = this.buildAssetPath(
      user.id,
      current.id,
      "music-releases",
      releaseId,
      requiredFile.originalname
    );

    await this.supabaseService.uploadAsset({
      path: storagePath,
      body: requiredFile.buffer,
      contentType: requiredFile.mimetype
    });

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_music_releases")
      .update({
        cover_storage_path: storagePath
      })
      .eq("id", releaseId)
      .eq("portfolio_id", current.id)
      .eq("owner_user_id", user.id);

    if (error) {
      await this.supabaseService.removeAsset(storagePath);
      this.throwPortfolioPersistenceError(error.message);
    }

    if (existing.cover_storage_path && existing.cover_storage_path !== storagePath) {
      await this.supabaseService.removeAsset(existing.cover_storage_path);
    }

    return this.getEditorState(accessToken);
  }

  async deleteMusicReleaseCover(releaseId: string, accessToken?: string | null) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const current = await this.ensurePortfolioSettings(user);
    const existing = await this.ensureOwnedRecord<PortfolioMusicReleaseRow>(
      "portfolio_music_releases",
      releaseId,
      current.id,
      user.id
    );

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_music_releases")
      .update({
        cover_storage_path: null
      })
      .eq("id", releaseId)
      .eq("portfolio_id", current.id)
      .eq("owner_user_id", user.id);

    if (error) {
      this.throwPortfolioPersistenceError(error.message);
    }

    await this.supabaseService.removeAsset(existing.cover_storage_path);

    return this.getEditorState(accessToken);
  }

  async deleteMusicRelease(releaseId: string, accessToken?: string | null) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const current = await this.ensurePortfolioSettings(user);
    const existing = await this.ensureOwnedRecord<PortfolioMusicReleaseRow>(
      "portfolio_music_releases",
      releaseId,
      current.id,
      user.id
    );

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_music_releases")
      .delete()
      .eq("id", releaseId)
      .eq("portfolio_id", current.id)
      .eq("owner_user_id", user.id);

    if (error) {
      this.throwPortfolioPersistenceError(error.message);
    }

    await this.supabaseService.removeAsset(existing.cover_storage_path);

    return this.getEditorState(accessToken);
  }

  async createEvent(payload: CreatePortfolioEventInput, accessToken?: string | null) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const current = await this.ensurePortfolioSettings(user);
    const parsed = createPortfolioEventInputSchema.parse(payload);
    const sortOrder = await this.getNextSortOrder("portfolio_events", current.id);

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_events")
      .insert({
        portfolio_id: current.id,
        owner_user_id: user.id,
        title: parsed.title,
        event_date: parsed.eventDate,
        location: parsed.location,
        ticket_url: parsed.ticketUrl || null,
        sort_order: sortOrder
      });

    if (error) {
      this.throwPortfolioPersistenceError(error.message);
    }

    return this.getEditorState(accessToken);
  }

  async updateEvent(
    eventId: string,
    payload: UpdatePortfolioEventInput,
    accessToken?: string | null
  ) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const current = await this.ensurePortfolioSettings(user);
    const parsed = updatePortfolioEventInputSchema.parse(payload);
    await this.ensureOwnedRecord("portfolio_events", eventId, current.id, user.id);

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_events")
      .update({
        title: parsed.title,
        event_date: parsed.eventDate,
        location: parsed.location,
        ticket_url: parsed.ticketUrl || null
      })
      .eq("id", eventId)
      .eq("portfolio_id", current.id)
      .eq("owner_user_id", user.id);

    if (error) {
      this.throwPortfolioPersistenceError(error.message);
    }

    return this.getEditorState(accessToken);
  }

  async uploadEventImage(
    eventId: string,
    accessToken?: string | null,
    file?: UploadedPortfolioFile | null
  ) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const current = await this.ensurePortfolioSettings(user);
    const existing = await this.ensureOwnedRecord<PortfolioEventRow>(
      "portfolio_events",
      eventId,
      current.id,
      user.id
    );
    const requiredFile = this.requireFile(file, "event image");
    const storagePath = this.buildAssetPath(
      user.id,
      current.id,
      "events",
      eventId,
      requiredFile.originalname
    );

    await this.supabaseService.uploadAsset({
      path: storagePath,
      body: requiredFile.buffer,
      contentType: requiredFile.mimetype
    });

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_events")
      .update({
        image_storage_path: storagePath
      })
      .eq("id", eventId)
      .eq("portfolio_id", current.id)
      .eq("owner_user_id", user.id);

    if (error) {
      await this.supabaseService.removeAsset(storagePath);
      this.throwPortfolioPersistenceError(error.message);
    }

    if (existing.image_storage_path && existing.image_storage_path !== storagePath) {
      await this.supabaseService.removeAsset(existing.image_storage_path);
    }

    return this.getEditorState(accessToken);
  }

  async deleteEventImage(eventId: string, accessToken?: string | null) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const current = await this.ensurePortfolioSettings(user);
    const existing = await this.ensureOwnedRecord<PortfolioEventRow>(
      "portfolio_events",
      eventId,
      current.id,
      user.id
    );

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_events")
      .update({
        image_storage_path: null
      })
      .eq("id", eventId)
      .eq("portfolio_id", current.id)
      .eq("owner_user_id", user.id);

    if (error) {
      this.throwPortfolioPersistenceError(error.message);
    }

    await this.supabaseService.removeAsset(existing.image_storage_path);

    return this.getEditorState(accessToken);
  }

  async deleteEvent(eventId: string, accessToken?: string | null) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const current = await this.ensurePortfolioSettings(user);
    const existing = await this.ensureOwnedRecord<PortfolioEventRow>(
      "portfolio_events",
      eventId,
      current.id,
      user.id
    );

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_events")
      .delete()
      .eq("id", eventId)
      .eq("portfolio_id", current.id)
      .eq("owner_user_id", user.id);

    if (error) {
      this.throwPortfolioPersistenceError(error.message);
    }

    await this.supabaseService.removeAsset(existing.image_storage_path);

    return this.getEditorState(accessToken);
  }

  async createFeaturedCard(
    payload: CreatePortfolioFeaturedCardInput,
    accessToken?: string | null
  ) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const current = await this.ensurePortfolioSettings(user);
    const parsed = createPortfolioFeaturedCardInputSchema.parse(payload);
    const sortOrder = await this.getNextSortOrder(
      "portfolio_featured_cards",
      current.id
    );

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_featured_cards")
      .insert({
        portfolio_id: current.id,
        owner_user_id: user.id,
        title: parsed.title,
        description: parsed.description,
        cta_label: parsed.ctaLabel,
        cta_url: parsed.ctaUrl,
        sort_order: sortOrder
      });

    if (error) {
      this.throwPortfolioPersistenceError(error.message);
    }

    return this.getEditorState(accessToken);
  }

  async updateFeaturedCard(
    cardId: string,
    payload: UpdatePortfolioFeaturedCardInput,
    accessToken?: string | null
  ) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const current = await this.ensurePortfolioSettings(user);
    const parsed = updatePortfolioFeaturedCardInputSchema.parse(payload);
    await this.ensureOwnedRecord(
      "portfolio_featured_cards",
      cardId,
      current.id,
      user.id
    );

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_featured_cards")
      .update({
        title: parsed.title,
        description: parsed.description,
        cta_label: parsed.ctaLabel,
        cta_url: parsed.ctaUrl
      })
      .eq("id", cardId)
      .eq("portfolio_id", current.id)
      .eq("owner_user_id", user.id);

    if (error) {
      this.throwPortfolioPersistenceError(error.message);
    }

    return this.getEditorState(accessToken);
  }

  async uploadFeaturedCardImage(
    cardId: string,
    accessToken?: string | null,
    file?: UploadedPortfolioFile | null
  ) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const current = await this.ensurePortfolioSettings(user);
    const existing = await this.ensureOwnedRecord<PortfolioFeaturedCardRow>(
      "portfolio_featured_cards",
      cardId,
      current.id,
      user.id
    );
    const requiredFile = this.requireFile(file, "featured card image");
    const storagePath = this.buildAssetPath(
      user.id,
      current.id,
      "featured-cards",
      cardId,
      requiredFile.originalname
    );

    await this.supabaseService.uploadAsset({
      path: storagePath,
      body: requiredFile.buffer,
      contentType: requiredFile.mimetype
    });

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_featured_cards")
      .update({
        image_storage_path: storagePath
      })
      .eq("id", cardId)
      .eq("portfolio_id", current.id)
      .eq("owner_user_id", user.id);

    if (error) {
      await this.supabaseService.removeAsset(storagePath);
      this.throwPortfolioPersistenceError(error.message);
    }

    if (existing.image_storage_path && existing.image_storage_path !== storagePath) {
      await this.supabaseService.removeAsset(existing.image_storage_path);
    }

    return this.getEditorState(accessToken);
  }

  async deleteFeaturedCardImage(cardId: string, accessToken?: string | null) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const current = await this.ensurePortfolioSettings(user);
    const existing = await this.ensureOwnedRecord<PortfolioFeaturedCardRow>(
      "portfolio_featured_cards",
      cardId,
      current.id,
      user.id
    );

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_featured_cards")
      .update({
        image_storage_path: null
      })
      .eq("id", cardId)
      .eq("portfolio_id", current.id)
      .eq("owner_user_id", user.id);

    if (error) {
      this.throwPortfolioPersistenceError(error.message);
    }

    await this.supabaseService.removeAsset(existing.image_storage_path);

    return this.getEditorState(accessToken);
  }

  async deleteFeaturedCard(cardId: string, accessToken?: string | null) {
    const user = await this.supabaseService.verifyAccessToken(accessToken);
    const current = await this.ensurePortfolioSettings(user);
    const existing = await this.ensureOwnedRecord<PortfolioFeaturedCardRow>(
      "portfolio_featured_cards",
      cardId,
      current.id,
      user.id
    );

    const { error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_featured_cards")
      .delete()
      .eq("id", cardId)
      .eq("portfolio_id", current.id)
      .eq("owner_user_id", user.id);

    if (error) {
      this.throwPortfolioPersistenceError(error.message);
    }

    await this.supabaseService.removeAsset(existing.image_storage_path);

    return this.getEditorState(accessToken);
  }

  async getPublicState(handle: string): Promise<PortfolioPublicState> {
    const normalizedHandle = this.normalizeHandle(handle);

    if (!normalizedHandle) {
      throw new NotFoundException("Portfolio handle not found.");
    }

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_settings")
      .select("*")
      .eq("handle", normalizedHandle)
      .maybeSingle();

    if (error) {
      this.throwPortfolioPersistenceError(error.message);
    }

    if (!data) {
      throw new NotFoundException("Portfolio handle not found.");
    }

    const settingsRow = this.mapSettingsRow(data);

    if (settingsRow.visibility !== "public") {
      throw new ForbiddenException("This portfolio is currently private.");
    }

    const editorState = await this.buildEditorState(settingsRow);
    const visibleSections = this.getVisibleSections(
      editorState.settings,
      editorState.content
    );

    return {
      handle: normalizedHandle,
      canonicalUrl: this.getCanonicalUrl(normalizedHandle),
      settings: editorState.settings,
      theme: getPortfolioThemeOption(editorState.settings.themeId),
      content: editorState.content,
      visibleSections
    };
  }

  private async ensurePortfolioSettings(user: User) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_settings")
      .select("*")
      .eq("owner_user_id", user.id)
      .maybeSingle();

    if (error) {
      this.throwPortfolioPersistenceError(error.message);
    }

    if (data) {
      return this.mapSettingsRow(data);
    }

    const sections = this.createStarterSections();
    const starterContent = createEmptyPortfolioContent();
    const candidateHandle = this.normalizeHandle(
      typeof user.user_metadata.handle === "string" ? user.user_metadata.handle : ""
    );
    const safeHandle =
      candidateHandle && HANDLE_PATTERN.test(candidateHandle)
        ? await this.ensureAvailableHandle(candidateHandle, user.id)
        : null;

    const artistName =
      typeof user.user_metadata.full_name === "string" &&
      user.user_metadata.full_name.trim().length > 0
        ? user.user_metadata.full_name.trim()
        : user.email?.split("@")[0] ?? "Untitled Artist";
    const enabledSectionIds = sections
      .filter((section) => section.enabled)
      .map((section) => section.id);

    const { data: created, error: createError } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_settings")
      .insert({
        owner_user_id: user.id,
        handle: safeHandle,
        artist_name: artistName,
        short_bio: "",
        full_bio: "",
        social_links: {},
        visibility: "private",
        theme_id: portfolioThemeOptions[0].id,
        section_order: enabledSectionIds,
        sections,
        book_me_content: starterContent.bookMe
      })
      .select("*")
      .single();

    if (createError) {
      this.throwPortfolioPersistenceError(createError.message);
    }

    return this.mapSettingsRow(created);
  }

  private async buildEditorState(
    settingsRow: PortfolioSettingsRow
  ): Promise<PortfolioEditorState> {
    const [
      portraitUrl,
      photoRows,
      videoRows,
      releaseRows,
      eventRows,
      featuredCardRows
    ] = await Promise.all([
      this.supabaseService.createSignedUrl(settingsRow.portrait_storage_path),
      this.fetchTableRows<PortfolioPhotoRow>("portfolio_photos", settingsRow.id),
      this.fetchTableRows<PortfolioVideoRow>("portfolio_videos", settingsRow.id),
      this.fetchTableRows<PortfolioMusicReleaseRow>(
        "portfolio_music_releases",
        settingsRow.id
      ),
      this.fetchTableRows<PortfolioEventRow>("portfolio_events", settingsRow.id),
      this.fetchTableRows<PortfolioFeaturedCardRow>(
        "portfolio_featured_cards",
        settingsRow.id
      )
    ]);

    const photos = await Promise.all(
      photoRows.map(async (photo): Promise<PortfolioPhotoItem> => ({
        id: photo.id,
        imageUrl:
          (await this.supabaseService.createSignedUrl(photo.storage_path)) ?? "",
        storagePath: photo.storage_path,
        altText: photo.alt_text,
        caption: photo.caption ?? undefined,
        sortOrder: photo.sort_order
      }))
    );

    const musicReleases = await Promise.all(
      releaseRows.map(async (release): Promise<PortfolioMusicReleaseItem> => ({
        id: release.id,
        title: release.title,
        subtitle: release.subtitle ?? undefined,
        coverUrl:
          (await this.supabaseService.createSignedUrl(release.cover_storage_path)) ??
          undefined,
        storagePath: release.cover_storage_path ?? undefined,
        links: release.links ?? [],
        sortOrder: release.sort_order
      }))
    );

    const events = await Promise.all(
      eventRows.map(async (event): Promise<PortfolioEventItem> => ({
        id: event.id,
        title: event.title,
        eventDate: event.event_date,
        location: event.location,
        ticketUrl: event.ticket_url ?? undefined,
        imageUrl:
          (await this.supabaseService.createSignedUrl(event.image_storage_path)) ??
          undefined,
        storagePath: event.image_storage_path ?? undefined,
        sortOrder: event.sort_order
      }))
    );

    const featuredCards = await Promise.all(
      featuredCardRows.map(
        async (card): Promise<PortfolioFeaturedCardItem> => ({
          id: card.id,
          title: card.title,
          description: card.description,
          ctaLabel: card.cta_label,
          ctaUrl: card.cta_url,
          imageUrl:
            (await this.supabaseService.createSignedUrl(card.image_storage_path)) ??
            undefined,
          storagePath: card.image_storage_path ?? undefined,
          sortOrder: card.sort_order
        })
      )
    );

    return {
      settings: {
        portfolioId: settingsRow.id,
        accountId: settingsRow.owner_user_id,
        handle: settingsRow.handle ?? "",
        artistName: settingsRow.artist_name,
        portraitUrl,
        shortBio: settingsRow.short_bio,
        fullBio: settingsRow.full_bio,
        socialLinks: settingsRow.social_links ?? {},
        visibility: settingsRow.visibility,
        themeId: this.normalizeThemeId(settingsRow.theme_id),
        sectionOrder: settingsRow.section_order,
        sections: this.coerceSections(settingsRow.sections),
        updatedAt: settingsRow.updated_at
      },
      availableThemes: portfolioThemeOptions,
      content: {
        photos,
        videos: videoRows.map((video) => ({
          id: video.id,
          title: video.title,
          embedUrl: video.embed_url,
          thumbnailUrl: video.thumbnail_url ?? undefined,
          caption: video.caption ?? undefined,
          sortOrder: video.sort_order
        })),
        musicReleases,
        events,
        featuredCards,
        bookMe: settingsRow.book_me_content
      }
    };
  }

  private getVisibleSections(
    settings: PortfolioSettings,
    content: PortfolioEditorState["content"]
  ) {
    return settings.sectionOrder
      .map((sectionId) => settings.sections.find((section) => section.id === sectionId))
      .filter((section): section is PortfolioSectionDefinition => Boolean(section))
      .filter((section) =>
        hasContentForSection(section.kind, content, {
          artistName: settings.artistName,
          shortBio: settings.shortBio,
          fullBio: settings.fullBio
        })
      );
  }

  private async normalizeSettings(
    incoming: PortfolioSettings,
    bookMeContent: PortfolioEditorState["content"]["bookMe"],
    current: PortfolioSettingsRow,
    user: User
  ) {
    const normalizedHandle = this.normalizeHandle(incoming.handle);

    if (normalizedHandle && !HANDLE_PATTERN.test(normalizedHandle)) {
      throw new BadRequestException(
        "Handles must use lowercase letters, numbers, and single hyphens only."
      );
    }

    if (incoming.visibility === "public" && !normalizedHandle) {
      throw new BadRequestException(
        "Set a public handle before making the portfolio live."
      );
    }

    if (normalizedHandle) {
      await this.assertHandleAvailable(normalizedHandle, user.id, current.id);
    }

    const sections = this.coerceSections(incoming.sections.length ? incoming.sections : current.sections);
    const enabledIds = sections.filter((section) => section.enabled).map((section) => section.id);
    const requestedOrder = incoming.sectionOrder.filter((sectionId) =>
      enabledIds.includes(sectionId)
    );
    const normalizedSectionOrder = [...requestedOrder];

    for (const enabledId of enabledIds) {
      if (!normalizedSectionOrder.includes(enabledId)) {
        normalizedSectionOrder.push(enabledId);
      }
    }

    return {
      handle: normalizedHandle,
      artist_name: incoming.artistName.trim(),
      short_bio: incoming.shortBio.trim(),
      full_bio: incoming.fullBio.trim(),
      social_links: incoming.socialLinks,
      visibility: incoming.visibility,
      theme_id: this.normalizeThemeId(incoming.themeId),
      section_order: normalizedSectionOrder,
      sections,
      book_me_content: bookMeContent
    };
  }

  private createStarterSections() {
    return portfolioSectionKinds.map((kind, index) => ({
      ...createSectionDefinition(kind, index),
      instanceKey: "default"
    }));
  }

  private coerceSections(rawSections: PortfolioSectionDefinition[]) {
    const sectionsByKind = new Map(
      rawSections.map((section) => [section.kind, section] as const)
    );

    return portfolioSectionKinds.map((kind, index) => {
      const existing = sectionsByKind.get(kind);
      const fallback = createSectionDefinition(kind, index);

      return {
        id: existing?.id ?? fallback.id,
        kind,
        instanceKey: existing?.instanceKey ?? "default",
        title: existing?.title?.trim() || fallback.title,
        enabled: existing?.enabled ?? fallback.enabled
      };
    });
  }

  private normalizeHandle(handle: string) {
    return handle.trim().toLowerCase();
  }

  private normalizeThemeId(themeId: string): PortfolioThemeId {
    return portfolioThemeIds.includes(themeId as (typeof portfolioThemeIds)[number])
      ? (themeId as PortfolioThemeId)
      : portfolioThemeOptions[0].id;
  }

  private async updateSectionLayout(
    ownerUserId: string,
    portfolioId: string,
    sections: PortfolioSectionDefinition[],
    sectionOrder: string[]
  ) {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_settings")
      .update({
        sections,
        section_order: sectionOrder
      })
      .eq("id", portfolioId)
      .eq("owner_user_id", ownerUserId);

    if (error) {
      this.throwPortfolioPersistenceError(error.message);
    }
  }

  private async fetchTableRows<T>(table: CollectionTableName, portfolioId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from(table)
      .select("*")
      .eq("portfolio_id", portfolioId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      this.throwPortfolioPersistenceError(error.message);
    }

    return (data ?? []) as T[];
  }

  private async ensureOwnedRecord<T>(
    table: CollectionTableName,
    recordId: string,
    portfolioId: string,
    ownerUserId: string
  ) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from(table)
      .select("*")
      .eq("id", recordId)
      .eq("portfolio_id", portfolioId)
      .eq("owner_user_id", ownerUserId)
      .maybeSingle();

    if (error) {
      this.throwPortfolioPersistenceError(error.message);
    }

    if (!data) {
      throw new NotFoundException("Portfolio item not found.");
    }

    return data as T;
  }

  private async getNextSortOrder(table: CollectionTableName, portfolioId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from(table)
      .select("sort_order")
      .eq("portfolio_id", portfolioId)
      .order("sort_order", { ascending: false })
      .limit(1);

    if (error) {
      this.throwPortfolioPersistenceError(error.message);
    }

    return typeof data?.[0]?.sort_order === "number" ? data[0].sort_order + 1 : 0;
  }

  private buildAssetPath(
    ownerUserId: string,
    portfolioId: string,
    collection: string,
    itemId: string,
    originalName: string
  ) {
    const safeName = originalName
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return [ownerUserId, portfolioId, collection, itemId, `${Date.now()}-${safeName}`]
      .filter(Boolean)
      .join("/");
  }

  private requireFile(file: UploadedPortfolioFile | null | undefined, label: string) {
    if (!file || !file.buffer || !file.originalname || !file.mimetype) {
      throw new BadRequestException(`Upload a ${label} before saving.`);
    }

    return file;
  }

  private async assertHandleAvailable(
    handle: string,
    ownerUserId: string,
    portfolioId: string
  ) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_settings")
      .select("id, owner_user_id")
      .eq("handle", handle)
      .maybeSingle();

    if (error) {
      this.throwPortfolioPersistenceError(error.message);
    }

    if (data && (data.id !== portfolioId || data.owner_user_id !== ownerUserId)) {
      throw new ConflictException("That public handle is already in use.");
    }
  }

  private async ensureAvailableHandle(handle: string, ownerUserId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from("portfolio_settings")
      .select("id")
      .eq("handle", handle)
      .neq("owner_user_id", ownerUserId)
      .maybeSingle();

    if (error) {
      this.throwPortfolioPersistenceError(error.message);
    }

    return data ? null : handle;
  }

  private getCanonicalUrl(handle: string) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

    return appUrl ? `${appUrl}/${handle}` : undefined;
  }

  private mapSettingsRow(data: Record<string, unknown>): PortfolioSettingsRow {
    return {
      id: String(data.id),
      owner_user_id: String(data.owner_user_id),
      handle:
        typeof data.handle === "string" && data.handle.trim().length > 0
          ? data.handle
          : null,
      artist_name: typeof data.artist_name === "string" ? data.artist_name : "",
      portrait_storage_path:
        typeof data.portrait_storage_path === "string"
          ? data.portrait_storage_path
          : null,
      short_bio: typeof data.short_bio === "string" ? data.short_bio : "",
      full_bio: typeof data.full_bio === "string" ? data.full_bio : "",
      social_links:
        typeof data.social_links === "object" && data.social_links
          ? (data.social_links as Record<string, string>)
          : {},
      visibility: data.visibility === "public" ? "public" : "private",
      theme_id:
        typeof data.theme_id === "string" ? data.theme_id : portfolioThemeOptions[0].id,
      section_order: Array.isArray(data.section_order)
        ? data.section_order.filter((value): value is string => typeof value === "string")
        : [],
      sections: Array.isArray(data.sections)
        ? (data.sections as PortfolioSectionDefinition[])
        : this.createStarterSections(),
      book_me_content:
        typeof data.book_me_content === "object" && data.book_me_content
          ? (data.book_me_content as PortfolioSettingsRow["book_me_content"])
          : createEmptyPortfolioContent().bookMe,
      created_at:
        typeof data.created_at === "string"
          ? data.created_at
          : new Date().toISOString(),
      updated_at:
        typeof data.updated_at === "string"
          ? data.updated_at
          : new Date().toISOString()
    };
  }

  private throwPortfolioPersistenceError(message: string): never {
    if (
      message.includes("duplicate key") ||
      message.includes("portfolio_settings_handle_unique_idx")
    ) {
      throw new ConflictException("That public handle is already in use.");
    }

    if (
      message.includes("relation") &&
      message.includes("does not exist")
    ) {
      throw new InternalServerErrorException(
        "Portfolio persistence is not ready until the Supabase migration is applied."
      );
    }

    throw new InternalServerErrorException(message);
  }
}
