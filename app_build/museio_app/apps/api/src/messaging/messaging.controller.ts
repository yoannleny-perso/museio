import { Body, Controller, Get, Headers, Param, Post } from "@nestjs/common";
import type {
  CreateConversationThreadInput,
  CreateMessageInput,
  MarkThreadReadInput
} from "@museio/types";
import { extractAccessToken } from "../auth/extract-access-token";
import { MessagingService } from "./messaging.service";

@Controller("messages")
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get()
  getCreatorMessagingState(@Headers("authorization") authorization?: string) {
    return this.messagingService.getCreatorMessagingState(
      extractAccessToken(authorization)
    );
  }

  @Get(":threadId")
  getThreadDetail(
    @Param("threadId") threadId: string,
    @Headers("authorization") authorization?: string
  ) {
    return this.messagingService.getThreadDetail(
      threadId,
      extractAccessToken(authorization)
    );
  }

  @Post("threads")
  createConversationThread(
    @Body() payload: CreateConversationThreadInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.messagingService.createConversationThread(
      payload,
      extractAccessToken(authorization)
    );
  }

  @Post("threads/:threadId/messages")
  createMessage(
    @Param("threadId") threadId: string,
    @Body() payload: CreateMessageInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.messagingService.createMessage(
      threadId,
      payload,
      extractAccessToken(authorization)
    );
  }

  @Post("threads/:threadId/read")
  markThreadRead(
    @Param("threadId") threadId: string,
    @Body() payload: MarkThreadReadInput,
    @Headers("authorization") authorization?: string
  ) {
    return this.messagingService.markThreadRead(
      threadId,
      payload,
      extractAccessToken(authorization)
    );
  }
}
