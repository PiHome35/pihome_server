import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, Logger, RequestMethod, ValidationPipe, VersioningType } from '@nestjs/common';
import { apiReference } from '@scalar/nestjs-api-reference';
import { MyClassSerializerInterceptor } from './pihome/interceptor/my-class-serializer.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn', 'debug', 'verbose'] });
  app.enableCors();
  app.setGlobalPrefix('/api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1'],
    prefix: 'v',
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalInterceptors(new MyClassSerializerInterceptor(app.get(Reflector)));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('PiHome API')
    .setDescription('API for PiHome mobile app and speaker device')
    .setVersion('1')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  app.use(
    '/api/docs',
    apiReference({
      spec: {
        content: document,
      },
    }),
  );

  const logger = new Logger('Bootstrap');

  await app.listen(3000, () => {
    logger.log('Server is running on http://localhost:3000');
  });
}

bootstrap();
