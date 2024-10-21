import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ClusterService } from './cluster.service';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { abortOnError: false, bufferLogs: true },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useStaticAssets({
    root: join(__dirname, '..', 'public'),
    prefix: '/public/',
  });

  const config = new DocumentBuilder()
    .setTitle('Users And Url Shortener')
    .setDescription('Manager for users and url shortener')
    .addBearerAuth({ type: 'http', in: 'header' })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  await app.listen({
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    host: '0.0.0.0',
  });
}

ClusterService.clusterize(bootstrap);
