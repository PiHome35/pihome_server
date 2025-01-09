import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn', 'debug', 'verbose'] });
  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('PiHome API')
    .setDescription('API for PiHome mobile app and speaker device')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const configService = app.get(ConfigService);

  const logger = new Logger('Bootstrap');
  app.setGlobalPrefix('api/v1');

  app.use(
    '/reference',
    apiReference({
      spec: {
        url: '/api-json',
      },
      theme: {
        colors: {
          primary: {
            main: '#1E88E5', // Modern blue color
          },
        },
      },
      layout: {
        title: 'PiHome API Documentation',
      },
      metadata: {
        description: 'Complete API documentation for the PiHome system',
        keywords: 'api, documentation, pihome, iot',
        robots: 'index, follow',
      },
      features: {
        search: true,
        authentication: {
          enabled: true,
          cookieName: 'pihome_auth',
        },
      },
    }),
  );

  await app.listen(configService.get<number>('http.port'), () => {
    logger.log(`Server is running on http://localhost:${configService.get<number>('http.port')}`);
  });
}

bootstrap();
