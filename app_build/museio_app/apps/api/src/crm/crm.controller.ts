import { Body, Controller, Get, Headers, Param, Patch } from "@nestjs/common";
import type { UpdateClientProfileInput } from "@museio/types";
import { extractAccessToken } from "../auth/extract-access-token";
import { CrmService } from "./crm.service";

@Controller("crm")
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get("clients")
  getClients(@Headers("authorization") authorization?: string) {
    return this.crmService.getClients(extractAccessToken(authorization));
  }

  @Get("clients/:clientId")
  getClientProfile(
    @Param("clientId") clientId: string,
    @Headers("authorization") authorization?: string
  ) {
    return this.crmService.getClientProfile(
      clientId,
      extractAccessToken(authorization)
    );
  }

  @Patch("clients/:clientId")
  updateClientProfile(
    @Param("clientId") clientId: string,
    @Body() payload: UpdateClientProfileInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.crmService.updateClientProfile(
      clientId,
      payload,
      extractAccessToken(authorization)
    );
  }
}
