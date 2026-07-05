import { Module } from "@nestjs/common";
import { UrlController } from "./url.controller";
import { UrlService } from "./url.service";
import { UrlRepo } from "./repositories/url.repo";
import { PrismaModule } from "../prisma/prisma.module";
import { RedisModule } from "../redis/redis.module";

@Module({
    imports: [PrismaModule, RedisModule],
    controllers: [UrlController],
    providers: [UrlService, UrlRepo],
})
export class UrlModule {}