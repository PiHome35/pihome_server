import { Module } from '@nestjs/common';
import { DevicesService } from './services/devices.service';
import { DeviceGroupsService } from './services/device-groups.service';
import { FamiliesService } from './services/families.service';
import { UsersService } from './services/users.service';
import { FamiliesController } from './controllers/families.controller';
import { SpotifyConnectionsService } from './services/spotify-connections.service';
import { DatabaseModule } from 'src/database/database.module';
import { UsersController } from './controllers/users.controller';

@Module({
  imports: [DatabaseModule],
  providers: [UsersService, FamiliesService, DeviceGroupsService, DevicesService, SpotifyConnectionsService],
  controllers: [FamiliesController, UsersController],
  exports: [UsersService, FamiliesService, DeviceGroupsService, DevicesService, SpotifyConnectionsService],
})
export class PihomeModule {}
