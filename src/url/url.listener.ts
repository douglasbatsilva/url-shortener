import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Url } from './url.entity';
import { UrlRepository } from './url.repository';

@Injectable()
export class UrlListener {
  constructor(private readonly repository: UrlRepository) {}

  @OnEvent('url.metric', { async: true })
  async onUrlMetric(url: Url) {
    url.clicks += 1;
    this.repository.update({ id: url.id }, url);
  }
}