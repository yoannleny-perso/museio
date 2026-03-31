import { Body, Controller, Get, Headers, Param, Post } from "@nestjs/common";
import type {
  ImportExternalBusyBlocksInput,
  UpsertExternalCalendarAccountInput
} from "@museio/types";
import { extractAccessToken } from "../auth/extract-access-token";
import { CalendarService } from "./calendar.service";

@Controller("calendar")
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  getWorkspace(@Headers("authorization") authorization?: string) {
    return this.calendarService.getWorkspace(extractAccessToken(authorization));
  }

  @Post("accounts")
  upsertAccount(
    @Body() payload: UpsertExternalCalendarAccountInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.calendarService.upsertAccount(
      payload,
      extractAccessToken(authorization)
    );
  }

  @Post("accounts/:accountId/import-blocks")
  importBusyBlocks(
    @Param("accountId") accountId: string,
    @Body() payload: ImportExternalBusyBlocksInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.calendarService.importBusyBlocks(
      accountId,
      payload,
      extractAccessToken(authorization)
    );
  }
}
