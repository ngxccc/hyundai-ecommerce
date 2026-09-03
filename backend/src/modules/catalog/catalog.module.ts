import { Module } from "@nestjs/common";
import { MoviesController } from "./movies.controller";
import { CinemasController } from "./cinemas.controller";
import { MoviesService } from "./movies.service";
import { CinemasService } from "./cinemas.service";

@Module({
  controllers: [MoviesController, CinemasController],
  providers: [MoviesService, CinemasService],
  exports: [MoviesService, CinemasService],
})
export class CatalogModule {}
