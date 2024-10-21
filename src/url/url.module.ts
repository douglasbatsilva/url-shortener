import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { Url } from './url.entity';
import { UrlRepository } from './url.repository';
import { Metric } from 'src/metrics/metric.entity';
import { MetricModule } from 'src/metrics/metric.module';

@Module({
  imports: [TypeOrmModule.forFeature([Url]), TypeOrmModule.forFeature([Metric]), MetricModule],
  providers: [UrlService, UrlRepository],
  controllers: [UrlController],
})
export class UrlModule {}
