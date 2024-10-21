import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Metric } from './metric.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MetricListener {
  constructor(
    @InjectRepository(Metric)
    private readonly repository: Repository<Metric>,
  ) {}

  @OnEvent('insert-metric', { async: true })
  async onUrlMetric(data: Metric) {
    this.repository.insert(data);
  }
}