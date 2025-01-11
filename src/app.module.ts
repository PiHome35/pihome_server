import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { FamiliesModule } from './families/families.module';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';
import { LoggerMiddleware } from './logger/logger.middleware';
import { DevicesModule } from './devices/devices.module';
import { PihomeModule } from './pihome/pihome.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
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
