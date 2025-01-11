import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('db.postgres.host'),
        port: configService.get<number>('db.postgres.port'),
        username: configService.get<string>('db.postgres.username'),
        password: configService.get<string>('db.postgres.password'),
        database: configService.get<string>('db.postgres.database'),
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV !== 'production',
        namingStrategy: new SnakeNamingStrategy(),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('db.mongo.host');
        const port = configService.get<number>('db.mongo.port');
        const username = configService.get<string>('db.mongo.username');
        const password = configService.get<string>('db.mongo.password');
        const database = configService.get<string>('db.mongo.database');

        return {
          uri: `mongodb://${username}:${password}@${host}:${port}/${database}`,
          dbName: database,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
