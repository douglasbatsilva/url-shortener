import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Metric } from './metric.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MetricService {
  constructor(
    @InjectRepository(Metric)
    private readonly repository: Repository<Metric>,
  ) {}

  async countUrlClicksByAuthor(shortUrls: string[]): Promise<any> {
    const results = await this.repository
    .createQueryBuilder('metric')
    .select('metric.shortUrl')
    .addSelect('COUNT(metric.id)', 'count')
    .where('metric.shortUrl IN (:...shortUrls)', { shortUrls })
    .groupBy('metric.shortUrl')
    .orderBy('count', 'DESC')
    .getRawMany();

    const clicksMap = results.reduce((acc, result) => {
      acc[result.metric_shortUrl] = result.count;
      return acc;
    }, {});
  
    return clicksMap;
  }
}
