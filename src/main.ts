import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

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
  await app.listen(configService.get<number>('http.port'), () => {
    logger.log(`Server is running on http://localhost:${configService.get<number>('http.port')}`);
  });
}

bootstrap();
