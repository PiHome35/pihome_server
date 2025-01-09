import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { FamiliesModule } from './families/families.module';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';
import { LoggerMiddleware } from './logger/logger.middleware';
import { DevicesModule } from './devices/devices.module';
import { PihomeModule } from './pihome/pihome.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('db.mongo.uri'),
        dbName: configService.get<string>('db.mongo.database'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    FamiliesModule,
    DevicesModule,
    PihomeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
