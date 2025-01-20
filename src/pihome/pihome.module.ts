import { Module } from '@nestjs/common';
import { DevicesService } from './services/devices.service';
import { DeviceGroupsService } from './services/device-groups.service';
import { FamiliesService } from './services/families.service';
import { UsersService } from './services/users.service';
import { FamiliesController } from './controllers/families.controller';
import { SpotifyConnectionsService } from './services/spotify-connections.service';
import { DatabaseModule } from 'src/database/database.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ChatService } from './services/chat.service';
import { ChatResolver } from './resolver/chat.resolver';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { UsersController } from './controllers/users.controller';
import { SpotifyModule } from 'src/spotify/spotify.module';
import { ChatModelsService } from './services/chat-models.service';
import { DeviceStatusResolver } from './resolver/device-status.resolver';
import { DeviceStatusService } from './services/device-status.service';

const graphqlModule = GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  installSubscriptionHandlers: true,
  sortSchema: true,
  playground: true,
  subscriptions: {
    'graphql-ws': true,
    'subscriptions-transport-ws': true,
  },
  context: ({ req }) => ({ req }),
});
import { SpotifyConnectionsController } from './controllers/spotify-connections.controller';
import { DevicesController } from './controllers/devices.controller';
import { DeviceGroupsController } from './controllers/device-groups.controller';
import { ChatModelsController } from './controllers/chat-models.controller';
import { PubSubModule } from 'src/pub-sub/pub-sub.module';

@Module({
  imports: [DatabaseModule, SpotifyModule, graphqlModule, PubSubModule],
  providers: [
    UsersService,
    FamiliesService,
    DeviceGroupsService,
    DevicesService,
    SpotifyConnectionsService,
    ChatService,
    ChatResolver,
    ChatModelsService,
    DeviceStatusService,
    DeviceStatusResolver,
  ],
  controllers: [
    FamiliesController,
    UsersController,
    SpotifyConnectionsController,
    DevicesController,
    DeviceGroupsController,
    ChatModelsController,
  ],
  exports: [
    UsersService,
    FamiliesService,
    DeviceGroupsService,
    DevicesService,
    SpotifyConnectionsService,
    ChatModelsService,
    ChatService,
  ],
})
export class PihomeModule {}
