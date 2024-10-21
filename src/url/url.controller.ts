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
import { ShortenUrlDto, ShortUrlDto } from './dto/url.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Url')
@Controller('')
export class UrlController {
  constructor(private readonly service: UrlService) {}

  @UseGuards(JwtAuthGuard)
  @Public()
  @Post('shorten')
  @ApiOperation({ summary: 'Shorten Url' })
  @ApiResponse({ status: 201, description: 'Url shortened.', example: 'http://localhost:3000/AbCDef' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBody({ type: ShortenUrlDto })
  @ApiBearerAuth()
  async shorten(
    @Body() body: ShortenUrlDto,
    @Res() reply: FastifyReply,
    @User() user: IRequestUser,
  ) {
    const userId = user?.id ?? null;
    const shortUrl = await this.service.createShortUrl(body.url, userId);
    return reply.status(201).send(shortUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Get('list')
  @ApiOperation({ summary: 'List Urls' })
  @ApiResponse({ status: 200, description: 'Urls list.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBearerAuth()
  async list(@Res() reply: FastifyReply, @User() user: IRequestUser) {
    const userId = user?.id ?? null;
    const urls = await this.service.list(userId);
    return reply.status(200).send(urls);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:shortUrl')
  @ApiOperation({ summary: 'Update Url' })
  @ApiResponse({ status: 204, description: 'Url updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'URL not found.' })
  @ApiParam({ name: 'shortUrl' })
  @ApiBody({ type: ShortenUrlDto })
  @ApiBearerAuth()
  async updateUrl(
    @Param() params: ShortUrlDto,
    @Body() body: ShortenUrlDto,
    @Res() reply: FastifyReply,
    @User() user: IRequestUser,
  ) {
    const userId = user?.id ?? null;
    await this.service.update(params.shortUrl, userId, body.url);
    return reply.status(204);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:shortUrl')
  @ApiOperation({ summary: 'Delete Url' })
  @ApiResponse({ status: 204, description: 'Url deleted.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'URL not found.' })
  @ApiParam({ name: 'shortUrl' })
  @ApiBearerAuth()
  async deleteUrl(
    @Param() params: ShortUrlDto,
    @Res() reply: FastifyReply,
    @User() user: IRequestUser,
  ) {
    const userId = user?.id ?? null;
    await this.service.delete(params.shortUrl, userId);
    return reply.status(204);
  }

  @UseGuards(JwtAuthGuard)
  @Public()
  @Get(':shortUrl')
  @ApiOperation({ summary: 'Redirect Url' })
  @ApiResponse({ status: 302, description: 'Url redirected.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'URL not found.' })
  @ApiParam({ name: 'shortUrl' })
  @ApiBearerAuth()
  async redirect(
    @Param() params: ShortUrlDto,
    @Res() reply: FastifyReply,
  ) {
    const foundUrl = await this.service.findOriginalUrl(params.shortUrl);
    return reply.redirect(foundUrl, 302);
  }
}
