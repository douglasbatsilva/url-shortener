import {
  Controller,
  Post,
  Body,
  Param,
  Res,
  Get,
  UseGuards,
  Put,
  Delete,
} from '@nestjs/common';
import { UrlService } from './url.service';
import { FastifyReply } from 'fastify';
import { JwtAuthGuard, Public } from 'src/guards/auth.guard';
import { User } from 'src/decorators/user.decorator';
import { IRequestUser } from 'src/interfaces/user.interface';

@Controller('')
export class UrlController {
  constructor(private readonly service: UrlService) {}

  @UseGuards(JwtAuthGuard)
  @Public()
  @Post('shorten')
  async shorten(
    @Body('url') url: string,
    @Res() reply: FastifyReply,
    @User() user: IRequestUser,
  ) {
    const userId = user?.id ?? null;
    const shortUrl = await this.service.createShortUrl(url, userId);
    return reply.status(201).send(shortUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Get('list')
  async list(@Res() reply: FastifyReply, @User() user: IRequestUser) {
    const userId = user?.id ?? null;
    const urls = await this.service.list(userId);
    return reply.status(200).send(urls);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:shortUrl')
  async updateUrl(
    @Param('shortUrl') shortUrl: string,
    @Body('url') url: string,
    @Res() reply: FastifyReply,
    @User() user: IRequestUser,
  ) {
    const userId = user?.id ?? null;
    const resp = await this.service.update(shortUrl, userId, url);
    return reply.status(200).send(resp);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:shortUrl')
  async deleteUrl(
    @Param('shortUrl') shortUrl: string,
    @Res() reply: FastifyReply,
    @User() user: IRequestUser,
  ) {
    const userId = user?.id ?? null;
    await this.service.delete(shortUrl, userId);
    return reply.status(204);
  }

  @UseGuards(JwtAuthGuard)
  @Public()
  @Get(':shortUrl')
  async redirect(
    @Param('shortUrl') shortUrl: string,
    @Res() reply: FastifyReply,
  ) {
    const foundUrl = await this.service.findOriginalUrl(shortUrl);
    return reply.redirect(foundUrl, 302);
  }
}
