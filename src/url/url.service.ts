import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import { UrlRepository } from './url.repository';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/user.entity';
import { Url } from './url.entity';
import { IsNull, UpdateResult } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IRequest } from 'src/interfaces/request.interface';

@Injectable()
export class UrlService {
  private nanoid = customAlphabet(
    '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    6,
  );

  constructor(
    private readonly configService: ConfigService,
    private readonly repository: UrlRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async createShortUrl(
    originalUrl: string,
    userId: number | null,
  ): Promise<string> {
    const urlBody: Partial<Url> = { originalUrl, shortUrl: this.nanoid() };

    if (userId != null) urlBody.user = { id: userId } as User;

    const shorted = await this.repository.create(urlBody);

    const baseUrl = this.configService.get<string>('BASE_URL');

    return `${baseUrl}/${shorted.shortUrl}`;
  }

  async find(where: Partial<Url>): Promise<Url | null> {
    const foundUrl = (await this.repository.findOne({
      ...where,
      deletedAt: IsNull() as any,
    })) as Url;

    if (foundUrl == null) {
      throw new HttpException('URL not found', HttpStatus.NOT_FOUND);
    }

    return foundUrl;
  }

  async findOriginalUrl(shortUrl: string, request: IRequest): Promise<string> {
    const foundUrl = await this.find({ shortUrl });

    this.eventEmitter.emit('insert-metric', { 
      userId: foundUrl.userId,
      ip: request.ip,
      userAgent: request.userAgent,
      hostname: request.hostname,
      urlId: foundUrl.id,
      shortUrl,
    });

    return foundUrl.originalUrl;
  }

  async list(userId: number | null): Promise<Partial<Url>[]> {
    const urls = (await this.repository.find({
      userId,
      deletedAt: IsNull() as any,
    })) as Url[];

    if (urls == null || urls.length === 0) return [];

    return urls.map((url) => {
      return {
        originalUrl: url.originalUrl,
        shortUrl: url.shortUrl,
      };
    });
  }

  async update(
    shortUrl: string,
    userId: number | null,
    url: string,
  ): Promise<UpdateResult> {
    const foundUrl = await this.find({ shortUrl, userId });

    foundUrl.originalUrl = url;
    foundUrl.updatedAt = new Date();

    return this.repository.update({ id: foundUrl.id }, foundUrl);
  }

  async delete(shortUrl: string, userId: number | null): Promise<UpdateResult> {
    const foundUrl = await this.find({ shortUrl, userId });

    foundUrl.deletedAt = new Date();

    return this.repository.update({ id: foundUrl.id }, foundUrl);
  }
}
