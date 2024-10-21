import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { Url } from './url.entity';
import { UrlRepository } from './url.repository';
import { UrlListener } from './url.listener';

@Module({
  imports: [TypeOrmModule.forFeature([Url])],
  providers: [UrlService, UrlRepository, UrlListener],
  controllers: [UrlController],
})
export class UrlModule {}
