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

@Module({
  controllers: [FamiliesController, UsersController],
  imports: [DatabaseModule, graphqlModule],
  providers: [
    UsersService,
    FamiliesService,
    DeviceGroupsService,
    DevicesService,
    SpotifyConnectionsService,
    ChatService,
    ChatResolver,
  ],
  exports: [UsersService, FamiliesService, DeviceGroupsService, DevicesService, SpotifyConnectionsService, ChatService],
})
export class PihomeModule {}
