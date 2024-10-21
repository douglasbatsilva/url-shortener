import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { Url } from './url.entity';
import { UrlRepository } from './url.repository';
import { UrlMetricsListener } from './listeners/url-metrics.listener';

@Module({
  imports: [TypeOrmModule.forFeature([Url])],
  providers: [UrlService, UrlRepository, UrlMetricsListener],
  controllers: [UrlController],
})
export class UrlModule {}
