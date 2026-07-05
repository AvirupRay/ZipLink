import { Injectable, BadRequestException } from "@nestjs/common";
import { UrlDto } from "./dto/url.dto";
import { nanoid } from "nanoid";
import { UrlRepo } from "./repositories/url.repo";
import { RedisService } from "../redis/redis.service";

@Injectable()
export class UrlService {
  constructor(
    private urlRepo: UrlRepo,
    private redisService: RedisService,
  ) {}

  async urlShortner(dto: UrlDto) {
    if (!dto.url) {
      throw new BadRequestException("URL is required");
    }

    // Generate a unique code
    let shortCode = nanoid(6);
    let attempts = 0;
    
    // Check if code already exists and regenerate if it does (to handle conflicts)
    while (attempts < 5) {
      const existing = await this.urlRepo.getUrlByCode(shortCode);
      if (!existing) {
        break;
      }
      shortCode = nanoid(6);
      attempts++;
    }

    const created = await this.urlRepo.createUrl(dto.url, shortCode);
    
    // Cache the mapping in Redis for 24 hours (86400 seconds)
    await this.redisService.set(shortCode, created.originalUrl, 86400);

    return {
      originalUrl: created.originalUrl,
      shortCode: created.shortCode,
      shortUrl: `http://localhost:3000/${created.shortCode}`,
    };
  }

  async getOriginalUrl(shortCode: string) {
    // 1. Try fetching from Redis cache first
    const cachedUrl = await this.redisService.get(shortCode);
    if (cachedUrl) {
      // Increment clicks in DB in the background
      this.urlRepo.incrementClicks(shortCode).catch((err) => {
        console.error(`Failed to increment clicks for ${shortCode}:`, err);
      });
      return cachedUrl;
    }

    // 2. Cache miss: Fetch from Postgres
    const urlRecord = await this.urlRepo.getUrlByCode(shortCode);
    if (!urlRecord) {
      return null;
    }

    // 3. Cache the found URL in Redis for future hits
    await this.redisService.set(shortCode, urlRecord.originalUrl, 86400);
    
    // Increment clicks in the database
    await this.urlRepo.incrementClicks(shortCode);
    
    return urlRecord.originalUrl;
  }
}