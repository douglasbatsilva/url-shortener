import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Url } from './url.entity';

@Injectable()
export class UrlRepository {
  constructor(
    @InjectRepository(Url)
    private readonly repository: Repository<Url>,
  ) {}

  findOne(where: Partial<Url>): Promise<Url> {
    return this.repository.findOne({ where });
  }

  create(url: Partial<Url>): Promise<Url> {
    const newUrl = this.repository.create(url);
    return this.repository.save(newUrl);
  }
}
