import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { Url } from './url.entity';
import { UrlRepository } from './url.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Url])],
  providers: [UrlService, UrlRepository],
  controllers: [UrlController],
})
export class UrlModule {}
