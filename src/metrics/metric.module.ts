import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Metric } from './metric.entity';
import { MetricListener } from './metric.listener';
import { MetricService } from './metric.service';

@Module({
  imports: [TypeOrmModule.forFeature([Metric])],
  providers: [MetricListener, MetricService],
  exports: [MetricService],
  controllers: [],
})
export class MetricModule {}
