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
  HttpCode,
} from '@nestjs/common';
import { UrlService } from './url.service';
import { FastifyReply } from 'fastify';
import { JwtAuthGuard, Public } from 'src/guards/auth.guard';
import { ShortenUrlDto, ShortUrlDto } from './dto/url.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'src/decorators/request.decorator';
import { IRequest, IRequestUser } from 'src/interfaces/request.interface';

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
  @HttpCode(201)
  async shorten(
    @Body() body: ShortenUrlDto,
    @Request() user: IRequestUser,
  ) {
    const userId = user?.id ?? null;
    return this.service.createShortUrl(body.url, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('list')
  @ApiOperation({ summary: 'List Urls' })
  @ApiResponse({ status: 200, description: 'Urls list.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBearerAuth()
  @HttpCode(200)
  async list(@Request() user: IRequestUser) {
    const userId = user?.id ?? null;
    return this.service.list(userId);
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
  @HttpCode(204)
  async updateUrl(
    @Param() params: ShortUrlDto,
    @Body() body: ShortenUrlDto,
    @Request() user: IRequestUser,
  ) {
    const userId = user?.id ?? null;
    return this.service.update(params.shortUrl, userId, body.url);
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
  @HttpCode(204)
  async deleteUrl(
    @Param() params: ShortUrlDto,
    @Request() user: IRequestUser,
  ) {
    const userId = user?.id ?? null;
    return this.service.delete(params.shortUrl, userId);
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
    @Request() request: IRequest,
  ) {
    const foundUrl = await this.service.findOriginalUrl(params.shortUrl, request);
    return reply.redirect(foundUrl, 302);
  }
}
