import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type {
  AddPortfolioSectionInput,
  CreatePortfolioEventInput,
  CreatePortfolioFeaturedCardInput,
  CreatePortfolioMusicReleaseInput,
  CreatePortfolioPhotoInput,
  CreatePortfolioVideoInput,
  ReorderPortfolioSectionsInput,
  UpdatePortfolioEventInput,
  UpdatePortfolioFeaturedCardInput,
  UpdatePortfolioInput,
  UpdatePortfolioMusicReleaseInput,
  UpdatePortfolioPhotoInput,
  UpdatePortfolioVideoInput
} from "@museio/types";
import { PortfolioService } from "./portfolio.service";

type UploadedPortfolioFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};

function extractAccessToken(authorization?: string) {
  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

@Controller("portfolio")
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get("editor")
  getEditorState(@Headers("authorization") authorization?: string) {
    return this.portfolioService.getEditorState(extractAccessToken(authorization));
  }

  @Put("editor")
  updateEditorState(
    @Body() payload: UpdatePortfolioInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.portfolioService.updateEditorState(
      payload,
      extractAccessToken(authorization)
    );
  }

  @Post("sections")
  addSection(
    @Body() payload: AddPortfolioSectionInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.portfolioService.addSection(payload, extractAccessToken(authorization));
  }

  @Patch("sections/order")
  reorderSections(
    @Body() payload: ReorderPortfolioSectionsInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.portfolioService.reorderSections(
      payload,
      extractAccessToken(authorization)
    );
  }

  @Delete("sections/:sectionId")
  removeSection(
    @Param("sectionId") sectionId: string,
    @Headers("authorization") authorization?: string
  ) {
    return this.portfolioService.removeSection(
      sectionId,
      extractAccessToken(authorization)
    );
  }

  @Post("portrait-image")
  @UseInterceptors(FileInterceptor("file"))
  uploadPortraitImage(
    @UploadedFile() file: UploadedPortfolioFile,
    @Headers("authorization") authorization?: string
  ) {
    return this.portfolioService.uploadPortraitImage(
      extractAccessToken(authorization),
      file
    );
  }

  @Delete("portrait-image")
  deletePortraitImage(@Headers("authorization") authorization?: string) {
    return this.portfolioService.deletePortraitImage(extractAccessToken(authorization));
  }

  @Post("photos")
  @UseInterceptors(FileInterceptor("file"))
  createPhoto(
    @Body() payload: CreatePortfolioPhotoInput,
    @UploadedFile() file: UploadedPortfolioFile,
    @Headers("authorization") authorization?: string
  ) {
    return this.portfolioService.createPhoto(
      payload,
      extractAccessToken(authorization),
      file
    );
  }

  @Patch("photos/:photoId")
  updatePhoto(
    @Param("photoId") photoId: string,
    @Body() payload: UpdatePortfolioPhotoInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.portfolioService.updatePhoto(
      photoId,
      payload,
      extractAccessToken(authorization)
    );
  }

  @Post("photos/:photoId/image")
  @UseInterceptors(FileInterceptor("file"))
  replacePhotoImage(
    @Param("photoId") photoId: string,
    @UploadedFile() file: UploadedPortfolioFile,
    @Headers("authorization") authorization?: string
  ) {
    return this.portfolioService.replacePhotoImage(
      photoId,
      extractAccessToken(authorization),
      file
    );
  }

  @Delete("photos/:photoId")
  deletePhoto(
    @Param("photoId") photoId: string,
    @Headers("authorization") authorization?: string
  ) {
    return this.portfolioService.deletePhoto(
      photoId,
      extractAccessToken(authorization)
    );
  }

  @Post("videos")
  createVideo(
    @Body() payload: CreatePortfolioVideoInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.portfolioService.createVideo(
      payload,
      extractAccessToken(authorization)
    );
  }

  @Patch("videos/:videoId")
  updateVideo(
    @Param("videoId") videoId: string,
    @Body() payload: UpdatePortfolioVideoInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.portfolioService.updateVideo(
      videoId,
      payload,
      extractAccessToken(authorization)
    );
  }

  @Delete("videos/:videoId")
  deleteVideo(
    @Param("videoId") videoId: string,
    @Headers("authorization") authorization?: string
  ) {
    return this.portfolioService.deleteVideo(
      videoId,
      extractAccessToken(authorization)
    );
  }

  @Post("music-releases")
  createMusicRelease(
    @Body() payload: CreatePortfolioMusicReleaseInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.portfolioService.createMusicRelease(
      payload,
      extractAccessToken(authorization)
    );
  }

  @Patch("music-releases/:releaseId")
  updateMusicRelease(
    @Param("releaseId") releaseId: string,
    @Body() payload: UpdatePortfolioMusicReleaseInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.portfolioService.updateMusicRelease(
      releaseId,
      payload,
      extractAccessToken(authorization)
    );
  }

  @Post("music-releases/:releaseId/image")
  @UseInterceptors(FileInterceptor("file"))
  uploadMusicReleaseCover(
    @Param("releaseId") releaseId: string,
    @UploadedFile() file: UploadedPortfolioFile,
    @Headers("authorization") authorization?: string
  ) {
    return this.portfolioService.uploadMusicReleaseCover(
      releaseId,
      extractAccessToken(authorization),
      file
    );
  }

  @Delete("music-releases/:releaseId/image")
  deleteMusicReleaseCover(
    @Param("releaseId") releaseId: string,
    @Headers("authorization") authorization?: string
  ) {
    return this.portfolioService.deleteMusicReleaseCover(
      releaseId,
      extractAccessToken(authorization)
    );
  }

  @Delete("music-releases/:releaseId")
  deleteMusicRelease(
    @Param("releaseId") releaseId: string,
    @Headers("authorization") authorization?: string
  ) {
    return this.portfolioService.deleteMusicRelease(
      releaseId,
      extractAccessToken(authorization)
    );
  }

  @Post("events")
  createEvent(
    @Body() payload: CreatePortfolioEventInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.portfolioService.createEvent(
      payload,
      extractAccessToken(authorization)
    );
  }

  @Patch("events/:eventId")
  updateEvent(
    @Param("eventId") eventId: string,
    @Body() payload: UpdatePortfolioEventInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.portfolioService.updateEvent(
      eventId,
      payload,
      extractAccessToken(authorization)
    );
  }

  @Post("events/:eventId/image")
  @UseInterceptors(FileInterceptor("file"))
  uploadEventImage(
    @Param("eventId") eventId: string,
    @UploadedFile() file: UploadedPortfolioFile,
    @Headers("authorization") authorization?: string
  ) {
    return this.portfolioService.uploadEventImage(
      eventId,
      extractAccessToken(authorization),
      file
    );
  }

  @Delete("events/:eventId/image")
  deleteEventImage(
    @Param("eventId") eventId: string,
    @Headers("authorization") authorization?: string
  ) {
    return this.portfolioService.deleteEventImage(
      eventId,
      extractAccessToken(authorization)
    );
  }

  @Delete("events/:eventId")
  deleteEvent(
    @Param("eventId") eventId: string,
    @Headers("authorization") authorization?: string
  ) {
    return this.portfolioService.deleteEvent(
      eventId,
      extractAccessToken(authorization)
    );
  }

  @Post("featured-cards")
  createFeaturedCard(
    @Body() payload: CreatePortfolioFeaturedCardInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.portfolioService.createFeaturedCard(
      payload,
      extractAccessToken(authorization)
    );
  }

  @Patch("featured-cards/:cardId")
  updateFeaturedCard(
    @Param("cardId") cardId: string,
    @Body() payload: UpdatePortfolioFeaturedCardInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.portfolioService.updateFeaturedCard(
      cardId,
      payload,
      extractAccessToken(authorization)
    );
  }

  @Post("featured-cards/:cardId/image")
  @UseInterceptors(FileInterceptor("file"))
  uploadFeaturedCardImage(
    @Param("cardId") cardId: string,
    @UploadedFile() file: UploadedPortfolioFile,
    @Headers("authorization") authorization?: string
  ) {
    return this.portfolioService.uploadFeaturedCardImage(
      cardId,
      extractAccessToken(authorization),
      file
    );
  }

  @Delete("featured-cards/:cardId/image")
  deleteFeaturedCardImage(
    @Param("cardId") cardId: string,
    @Headers("authorization") authorization?: string
  ) {
    return this.portfolioService.deleteFeaturedCardImage(
      cardId,
      extractAccessToken(authorization)
    );
  }

  @Delete("featured-cards/:cardId")
  deleteFeaturedCard(
    @Param("cardId") cardId: string,
    @Headers("authorization") authorization?: string
  ) {
    return this.portfolioService.deleteFeaturedCard(
      cardId,
      extractAccessToken(authorization)
    );
  }

  @Get("public/:handle")
  getPublicState(@Param("handle") handle: string) {
    return this.portfolioService.getPublicState(handle);
  }
}
