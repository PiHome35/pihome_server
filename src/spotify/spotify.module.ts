import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { SpotifyService } from './spotify.service';
import { SpotifyController } from './spotify.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [HttpModule.register({}), ConfigModule, DatabaseModule],
  controllers: [SpotifyController],
  providers: [SpotifyService],
  exports: [SpotifyService, HttpModule],
})
export class SpotifyModule {}
