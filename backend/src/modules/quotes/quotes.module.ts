import { Module } from "@nestjs/common";
import { CompanySettingsModule } from "../company-settings/company-settings.module";
import { QuotesController } from "./quotes.controller";
import { QuotesService } from "./quotes.service";
import { QuoteExcelService } from "./services/quote-excel.service";
@Module({
  imports: [CompanySettingsModule],
  controllers: [QuotesController],
  providers: [QuotesService, QuoteExcelService],
  exports: [QuotesService, QuoteExcelService],
})
export class QuotesModule {}
