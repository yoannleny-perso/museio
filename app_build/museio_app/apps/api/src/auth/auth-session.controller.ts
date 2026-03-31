import { Controller, Get } from "@nestjs/common";
import { protectedRoutePrefixes, publicRoutePatterns } from "@museio/domain";

@Controller("auth")
export class AuthSessionController {
  @Get("session")
  getSessionContract() {
    return {
      strategy: "supabase-session",
      developmentFallback: "disabled",
      user: null,
      protectedRoutes: protectedRoutePrefixes.web,
      publicRoutes: publicRoutePatterns.web
    };
  }
}
