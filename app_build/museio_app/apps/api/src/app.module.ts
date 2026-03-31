import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { BookingModule } from "./booking/booking.module";
import { CalendarModule } from "./calendar/calendar.module";
import { CommercialModule } from "./commercial/commercial.module";
import { CrmModule } from "./crm/crm.module";
import { FinanceModule } from "./finance/finance.module";
import { HealthController } from "./health/health.controller";
import { MessagingModule } from "./messaging/messaging.module";
import { PortfolioModule } from "./portfolio/portfolio.module";
import { SupabaseModule } from "./supabase/supabase.module";

@Module({
  imports: [
    SupabaseModule,
    AuthModule,
    PortfolioModule,
    BookingModule,
    CommercialModule,
    FinanceModule,
    MessagingModule,
    CrmModule,
    CalendarModule
  ],
  controllers: [HealthController]
})
export class AppModule {}
