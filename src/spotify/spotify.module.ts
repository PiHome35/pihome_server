import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { SpotifyService } from './spotify.service';
import { DatabaseModule } from 'src/database/database.module';
import { UsersService } from 'src/pihome/services/users.service';
import { PrismaService } from 'src/database/prisma.service';
import { DevicesService } from 'src/pihome/services/devices.service';
import { PihomeModule } from 'src/pihome/pihome.module';
import { SpotifyController } from './spotify.controller';

@Module({
  imports: [HttpModule.register({}), ConfigModule, DatabaseModule],
  controllers: [SpotifyController],
  providers: [SpotifyService, UsersService, PrismaService],
  exports: [SpotifyService, HttpModule],
})
export class SpotifyModule {}
