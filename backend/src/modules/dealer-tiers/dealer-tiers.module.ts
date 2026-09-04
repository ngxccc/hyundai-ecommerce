import { Module } from "@nestjs/common";
import { DealerTiersController } from "./dealer-tiers.controller";
import { DealerTiersService } from "./dealer-tiers.service";

@Module({
  controllers: [DealerTiersController],
  providers: [DealerTiersService],
  exports: [DealerTiersService],
})
export class DealerTiersModule {}
