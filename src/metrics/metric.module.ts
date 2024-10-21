import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Metric } from './metric.entity';
import { MetricListener } from './metric.listener';

@Module({
  imports: [TypeOrmModule.forFeature([Metric])],
  providers: [MetricListener],
  controllers: [],
})
export class MetricModule {}
