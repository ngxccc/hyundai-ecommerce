import { Module } from "@nestjs/common";
import { QuotesController } from "./quotes.controller";
import { QuotesService } from "./quotes.service";
import { QuoteExcelService } from "./services/quote-excel.service";

@Module({
  controllers: [QuotesController],
  providers: [QuotesService, QuoteExcelService],
  exports: [QuotesService, QuoteExcelService],
})
export class QuotesModule {}
