import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './infra/database.module';
import { ConfigModule } from '@nestjs/config';
import { UrlModule } from './url/url.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    UsersModule,
    UrlModule,
  ],
})
export class AppModule {}
