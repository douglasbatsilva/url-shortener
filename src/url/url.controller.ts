import { Controller, Post, Body, Param, Res, Get } from '@nestjs/common';
import { UrlService } from './url.service';
import { FastifyReply } from 'fastify';

@Controller('')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('shorten')
  async shortenUrl(@Body('url') url: string, @Res() reply: FastifyReply) {
    const shortUrl = await this.urlService.createShortUrl(url);
    return reply.status(201).send(shortUrl);
  }

  @Get(':shortUrl')
  async redirectToOriginal(@Param('shortUrl') shortUrl: string, @Res() reply: FastifyReply) {
    const foundUrl = await this.urlService.findOriginalUrl(shortUrl);
    return reply.redirect(foundUrl, 302);
  }
}
