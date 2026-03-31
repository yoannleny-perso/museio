import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Put,
  Req
} from "@nestjs/common";
import type {
  CreateInvoiceDraftInput,
  CreateInvoicePaymentSessionInput,
  CreateQuoteDraftInput,
  RespondToQuoteInput,
  SaveInvoiceDraftInput,
  SaveQuoteDraftInput,
  SendInvoiceInput,
  SendQuoteInput,
  UpdateStripeConnectedAccountInput
} from "@museio/types";
import { CommercialService } from "./commercial.service";

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

@Controller("commercial")
export class CommercialController {
  constructor(private readonly commercialService: CommercialService) {}

  @Get("jobs")
  getCreatorJobs(@Headers("authorization") authorization?: string) {
    return this.commercialService.getCreatorJobs(extractAccessToken(authorization));
  }

  @Get("jobs/:jobId")
  getCreatorJobState(
    @Param("jobId") jobId: string,
    @Headers("authorization") authorization?: string
  ) {
    return this.commercialService.getCreatorJobState(
      jobId,
      extractAccessToken(authorization)
    );
  }

  @Get("stripe/readiness")
  getStripeReadiness(@Headers("authorization") authorization?: string) {
    return this.commercialService.getStripeReadiness(
      extractAccessToken(authorization)
    );
  }

  @Put("stripe/account")
  updateStripeConnectedAccount(
    @Body() payload: UpdateStripeConnectedAccountInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.commercialService.updateStripeConnectedAccount(
      payload,
      extractAccessToken(authorization)
    );
  }

  @Post("jobs/:jobId/quotes")
  createQuoteDraft(
    @Param("jobId") jobId: string,
    @Body() payload: CreateQuoteDraftInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.commercialService.createQuoteDraft(
      jobId,
      payload,
      extractAccessToken(authorization)
    );
  }

  @Patch("quotes/:quoteId")
  saveQuoteDraft(
    @Param("quoteId") quoteId: string,
    @Body() payload: SaveQuoteDraftInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.commercialService.saveQuoteDraft(
      quoteId,
      payload,
      extractAccessToken(authorization)
    );
  }

  @Post("quotes/:quoteId/send")
  sendQuote(
    @Param("quoteId") quoteId: string,
    @Body() payload: SendQuoteInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.commercialService.sendQuote(
      quoteId,
      payload,
      extractAccessToken(authorization)
    );
  }

  @Get("public/quotes/:token")
  getPublicQuote(@Param("token") token: string) {
    return this.commercialService.getPublicQuote(token);
  }

  @Post("public/quotes/:token/respond")
  respondToQuote(
    @Param("token") token: string,
    @Body() payload: RespondToQuoteInput
  ) {
    return this.commercialService.respondToQuote(token, payload);
  }

  @Post("jobs/:jobId/invoices")
  createInvoiceDraft(
    @Param("jobId") jobId: string,
    @Body() payload: CreateInvoiceDraftInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.commercialService.createInvoiceDraft(
      jobId,
      payload,
      extractAccessToken(authorization)
    );
  }

  @Patch("invoices/:invoiceId")
  saveInvoiceDraft(
    @Param("invoiceId") invoiceId: string,
    @Body() payload: SaveInvoiceDraftInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.commercialService.saveInvoiceDraft(
      invoiceId,
      payload,
      extractAccessToken(authorization)
    );
  }

  @Post("invoices/:invoiceId/send")
  sendInvoice(
    @Param("invoiceId") invoiceId: string,
    @Body() payload: SendInvoiceInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.commercialService.sendInvoice(
      invoiceId,
      payload,
      extractAccessToken(authorization)
    );
  }

  @Get("public/invoices/:token")
  getPublicInvoice(@Param("token") token: string) {
    return this.commercialService.getPublicInvoice(token);
  }

  @Post("public/invoices/:token/payment-session")
  createInvoicePaymentSession(
    @Param("token") token: string,
    @Body() payload: CreateInvoicePaymentSessionInput
  ) {
    return this.commercialService.createPublicInvoicePaymentSession(token, payload);
  }

  @Post("stripe/webhook")
  handleStripeWebhook(
    @Req() request: { rawBody?: Buffer },
    @Headers("stripe-signature") signature?: string
  ) {
    return this.commercialService.handleStripeWebhook(
      request.rawBody?.toString("utf8") ?? "",
      signature ?? ""
    );
  }
}
