import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { MongoService } from './mongo.service';

@Module({
  providers: [PrismaService, MongoService],
  exports: [PrismaService, MongoService],
})
export class DatabaseModule {}
