import { Module } from "@nestjs/common";
import { SupabaseModule } from "../supabase/supabase.module";
import { CrmController } from "./crm.controller";
import { CrmService } from "./crm.service";

@Module({
  imports: [SupabaseModule],
  controllers: [CrmController],
  providers: [CrmService]
})
export class CrmModule {}
