import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import { UrlRepository } from './url.repository';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UrlService {
  private nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

  constructor(
    private repository: UrlRepository,
    private readonly configService: ConfigService,
  ) {}

  async createShortUrl(originalUrl: string): Promise<string> {
    const treatedUrl = this.treatUrl(originalUrl);

    const shortUrl = this.nanoid();

    const shorted = await this.repository.create({ originalUrl:treatedUrl, shortUrl });

    const baseUrl = this.configService.get<string>('BASE_URL');

    return `${baseUrl}/${shorted.shortUrl}`;
  }

  treatUrl(url: string): string | null {
    const regex = /^(https?:\/\/)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g;

    if (regex.test(url) === false ) return null

    if (!/^https?:\/\//.test(url)) return `https://${url}`;

    return url;
  }

  async findOriginalUrl(shortUrl: string): Promise<string> {
    if (shortUrl.length !== 6) {
      throw new HttpException('Invalid URL', HttpStatus.BAD_REQUEST);
    }

    const foundUrl = await this.repository.findOne({ shortUrl });

    if (foundUrl == null) {
      throw new HttpException('URL not found', HttpStatus.NOT_FOUND);
    }

    return foundUrl.originalUrl;
  }
}
