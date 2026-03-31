import { Module } from "@nestjs/common";
import { SupabaseModule } from "../supabase/supabase.module";
import { CalendarController } from "./calendar.controller";
import { CalendarService } from "./calendar.service";

@Module({
  imports: [SupabaseModule],
  controllers: [CalendarController],
  providers: [CalendarService]
})
export class CalendarModule {}
