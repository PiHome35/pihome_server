import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const globalPrefix = '/api/v1';

  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn', 'debug', 'verbose'] });
  app.enableCors();
  app.setGlobalPrefix(globalPrefix);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('PiHome API')
    .setDescription('API for PiHome mobile app and speaker device')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  app.use(
    `${globalPrefix}/docs`,
    apiReference({
      spec: {
        content: document,
      },
    }),
  );

  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  await app.listen(configService.get<number>('http.port'), () => {
    logger.log(`Server is running on http://localhost:${configService.get<number>('http.port')}`);
  });
}

bootstrap();
