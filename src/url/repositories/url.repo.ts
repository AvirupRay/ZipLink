import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class UrlRepo {
  constructor(private prisma: PrismaService) {}

  async createUrl(originalUrl: string, shortCode: string) {
    return this.prisma.url.create({
      data: {
        originalUrl,
        shortCode,
      },
    });
  }

  async getUrlByCode(shortCode: string) {
    return this.prisma.url.findUnique({
      where: {
        shortCode,
      },
    });
  }

  async incrementClicks(shortCode: string) {
    return this.prisma.url.update({
      where: {
        shortCode,
      },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });
  }
}