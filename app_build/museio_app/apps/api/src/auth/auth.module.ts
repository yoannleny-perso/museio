import { Module } from "@nestjs/common";
import { AuthSessionController } from "./auth-session.controller";

@Module({
  controllers: [AuthSessionController]
})
export class AuthModule {}
