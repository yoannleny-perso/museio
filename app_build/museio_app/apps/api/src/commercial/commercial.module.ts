import { Module } from "@nestjs/common";
import { SupabaseModule } from "../supabase/supabase.module";
import { CommercialController } from "./commercial.controller";
import { CommercialService } from "./commercial.service";

@Module({
  imports: [SupabaseModule],
  controllers: [CommercialController],
  providers: [CommercialService]
})
export class CommercialModule {}
