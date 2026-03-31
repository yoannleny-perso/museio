import { Module } from "@nestjs/common";
import { SupabaseModule } from "../supabase/supabase.module";
import { FinanceController } from "./finance.controller";
import { FinanceService } from "./finance.service";

@Module({
  imports: [SupabaseModule],
  controllers: [FinanceController],
  providers: [FinanceService]
})
export class FinanceModule {}
