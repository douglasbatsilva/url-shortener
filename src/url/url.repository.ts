import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
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

  find(where: Partial<Url>): Promise<Url[]> {
    return this.repository.find({ where });
  }

  create(url: Partial<Url>): Promise<Url> {
    const newUrl = this.repository.create(url);
    return this.repository.save(newUrl);
  }

  update(where: Partial<Url>, data: Partial<Url>): Promise<UpdateResult> {
    return this.repository.update(where, data);
  }
}
