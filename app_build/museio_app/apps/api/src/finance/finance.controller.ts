import { Body, Controller, Get, Headers, Put, Query } from "@nestjs/common";
import type {
  FinanceExportInput,
  FinanceWorkspaceFilters,
  UpdateFinanceTaxProfileInput
} from "@museio/types";
import { FinanceService } from "./finance.service";

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

@Controller("finance")
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get("workspace")
  getWorkspace(
    @Query() query: FinanceWorkspaceFilters,
    @Headers("authorization") authorization?: string
  ) {
    return this.financeService.getWorkspace(
      query,
      extractAccessToken(authorization)
    );
  }

  @Put("tax-profile")
  updateTaxProfile(
    @Body() payload: UpdateFinanceTaxProfileInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.financeService.updateTaxProfile(
      payload,
      extractAccessToken(authorization)
    );
  }

  @Get("export")
  exportWorkspace(
    @Query() query: FinanceExportInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.financeService.exportWorkspace(
      query,
      extractAccessToken(authorization)
    );
  }
}
