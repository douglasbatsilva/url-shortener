import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './infra/database.module';
import { ConfigModule } from '@nestjs/config';
import { UrlModule } from './url/url.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MetricModule } from './metrics/metric.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    UsersModule,
    MetricModule,
    UrlModule,
  ],
})
export class AppModule {}
