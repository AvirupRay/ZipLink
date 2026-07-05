import { Body, Controller, Post, Get, Param, Redirect, NotFoundException } from "@nestjs/common";
import { UrlDto } from "./dto/url.dto";
import { UrlService } from "./url.service";

@Controller()
export class UrlController {
  constructor(private urlService: UrlService) {}

  @Post("shortner")
  urlShortner(@Body() body: UrlDto) {
    return this.urlService.urlShortner(body);
  }

  @Get(":code")
  @Redirect()
  async redirect(@Param("code") code: string) {
    const originalUrl = await this.urlService.getOriginalUrl(code);
    if (!originalUrl) {
      throw new NotFoundException("Short URL not found");
    }
    return { url: originalUrl, statusCode: 302 };
  }
}