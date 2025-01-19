import { Module } from '@nestjs/common';
import { DevicesService } from './services/devices.service';
import { DeviceGroupsService } from './services/device-groups.service';
import { FamiliesService } from './services/families.service';
import { UsersService } from './services/users.service';
import { FamiliesController } from './controllers/families.controller';
import { SpotifyConnectionsService } from './services/spotify-connections.service';
import { DatabaseModule } from 'src/database/database.module';
import { UsersController } from './controllers/users.controller';
import { SpotifyModule } from 'src/spotify/spotify.module';
import { SpotifyConnectionsController } from './controllers/spotify-connections.controller';
import { DevicesController } from './controllers/devices.controller';
import { DeviceGroupsController } from './controllers/device-groups.controller';

@Module({
  imports: [DatabaseModule, SpotifyModule],
  providers: [UsersService, FamiliesService, DeviceGroupsService, DevicesService, SpotifyConnectionsService],
  controllers: [
    FamiliesController,
    UsersController,
    SpotifyConnectionsController,
    DevicesController,
    DeviceGroupsController,
  ],
  exports: [UsersService, FamiliesService, DeviceGroupsService, DevicesService, SpotifyConnectionsService],
})
export class PihomeModule {}
