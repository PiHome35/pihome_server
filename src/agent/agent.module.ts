import { Module } from '@nestjs/common';
import { NoteTool } from './tools/note.tool';
import { SpotifyService } from '../spotify/spotify.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { HttpModule } from '@nestjs/axios';
import { UsersService } from 'src/pihome/services/users.service';
import { SpotifyModule } from 'src/spotify/spotify.module';
import { SpotifyConnectionsService } from 'src/pihome/services/spotify-connections.service';
import { SpotifyTool } from './tools/spotify.tool';
import { AgentService } from './agent.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [ConfigModule, DatabaseModule, HttpModule, SpotifyModule, CacheModule.register()],
  providers: [AgentService, NoteTool, SpotifyService, UsersService, SpotifyConnectionsService, SpotifyTool, NoteTool],
  exports: [AgentService, NoteTool, SpotifyService, UsersService, SpotifyConnectionsService, SpotifyTool, NoteTool],
})
export class AgentModule {}
