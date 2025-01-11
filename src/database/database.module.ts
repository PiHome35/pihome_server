import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('db.mongo.uri'),
        dbName: configService.get<string>('db.mongo.database'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
