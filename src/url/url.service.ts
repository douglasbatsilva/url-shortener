import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import { UrlRepository } from './url.repository';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/user.entity';
import { Url } from './url.entity';
import { IsNull, UpdateResult } from 'typeorm';

@Injectable()
export class UrlService {
  private nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

  constructor(
    private readonly configService: ConfigService,
    private readonly repository: UrlRepository,
  ) {}

  async createShortUrl(originalUrl: string, userId: number | null): Promise<string> {
    const treatedUrl = this.treatUrl(originalUrl);

    const shortUrl = this.nanoid();

    const urlBody: Partial<Url> = { originalUrl: treatedUrl, shortUrl }

    if (userId != null) urlBody.author = { id: userId } as User;

    const shorted = await this.repository.create(urlBody);

    const baseUrl = this.configService.get<string>('BASE_URL');

    return `${baseUrl}/${shorted.shortUrl}`;
  }

  treatUrl(url: string): string | null {
    const regex = /^(https?:\/\/)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g;

    if (regex.test(url) === false ) return null

    if (!/^https?:\/\//.test(url)) return `https://${url}`;

    return url;
  }

  async find(where: Partial<Url>): Promise<any> {
    const foundUrl = await this.repository.findOne({ ...where, deletedAt: IsNull() as any }) as Url;

    if (foundUrl == null) {
      throw new HttpException('URL not found', HttpStatus.NOT_FOUND);
    }

    return foundUrl;
  }

  async findOriginalUrl(shortUrl: string): Promise<string> {
    if (shortUrl.length !== 6) {
      throw new HttpException('Invalid URL', HttpStatus.BAD_REQUEST);
    }

    const foundUrl = await this.find({ shortUrl });

    foundUrl.clicks += 1;
    this.repository.update({ id: foundUrl.id }, foundUrl);

    return foundUrl.originalUrl;
  }


  async list(userId: number | null): Promise<Partial<Url>[]> {
    const urls = await this.repository.find({ authorId: userId, deletedAt: IsNull() as any }) as Url[];

    return urls.map((url) => {
      return {
        originalUrl: url.originalUrl,
        shortUrl: url.shortUrl,
        clicks: url.clicks
      }
    })
  }

  async update(shortUrl: string, userId: number | null, url: string): Promise<UpdateResult> {
    const foundUrl = await this.find({ shortUrl, authorId: userId });

    foundUrl.originalUrl = this.treatUrl(url);
    foundUrl.updatedAt = new Date();

    return this.repository.update({ id: foundUrl.id }, foundUrl);
  }

  async delete(shortUrl: string, userId: number | null): Promise<UpdateResult> {
    const foundUrl = await this.find({ shortUrl, authorId: userId });

    foundUrl.deletedAt = new Date();

    return this.repository.update({ id: foundUrl.id }, foundUrl);
  }
}
