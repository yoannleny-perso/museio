import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Put
} from "@nestjs/common";
import type {
  ApplyBookingDecisionInput,
  CreateBookingInternalNoteInput,
  CreatePublicBookingRequestInput,
  UpdateBookingRequestStatusInput,
  UpdateCreatorAvailabilityInput
} from "@museio/types";
import { BookingService } from "./booking.service";

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

@Controller("booking")
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get("public/:handle")
  getPublicBookingPage(@Param("handle") handle: string) {
    return this.bookingService.getPublicBookingPage(handle);
  }

  @Post("public/:handle/requests")
  createPublicBookingRequest(
    @Param("handle") handle: string,
    @Body() payload: CreatePublicBookingRequestInput
  ) {
    return this.bookingService.createPublicBookingRequest(handle, payload);
  }

  @Get("inbox")
  getCreatorBookingInbox(@Headers("authorization") authorization?: string) {
    return this.bookingService.getCreatorBookingInbox(
      extractAccessToken(authorization)
    );
  }

  @Get("inbox/:requestId")
  getCreatorBookingRequestDetail(
    @Param("requestId") requestId: string,
    @Headers("authorization") authorization?: string
  ) {
    return this.bookingService.getCreatorBookingRequestDetail(
      requestId,
      extractAccessToken(authorization)
    );
  }

  @Put("availability")
  updateCreatorAvailability(
    @Body() payload: UpdateCreatorAvailabilityInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.bookingService.updateCreatorAvailability(
      payload,
      extractAccessToken(authorization)
    );
  }

  @Patch("inbox/:requestId/status")
  updateBookingRequestStatus(
    @Param("requestId") requestId: string,
    @Body() payload: UpdateBookingRequestStatusInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.bookingService.updateBookingRequestStatus(
      requestId,
      payload,
      extractAccessToken(authorization)
    );
  }

  @Post("inbox/:requestId/decision")
  applyBookingDecision(
    @Param("requestId") requestId: string,
    @Body() payload: ApplyBookingDecisionInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.bookingService.applyBookingDecision(
      requestId,
      payload,
      extractAccessToken(authorization)
    );
  }

  @Post("inbox/:requestId/notes")
  createBookingInternalNote(
    @Param("requestId") requestId: string,
    @Body() payload: CreateBookingInternalNoteInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.bookingService.createBookingInternalNote(
      requestId,
      payload,
      extractAccessToken(authorization)
    );
  }
}
