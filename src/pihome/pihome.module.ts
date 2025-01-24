import { Logger, Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { DevicesService } from './services/devices.service';
import { DeviceGroupsService } from './services/device-groups.service';
import { FamiliesService } from './services/families.service';
import { UsersService } from './services/users.service';
import { FamiliesController } from './controllers/families.controller';
import { SpotifyConnectionsService } from './services/spotify-connections.service';
import { DatabaseModule } from 'src/database/database.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ChatService } from './services/chat.service';
import { ChatResolver } from './resolvers/chat.resolver';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { UsersController } from './controllers/users.controller';
import { SpotifyModule } from 'src/spotify/spotify.module';
import { ChatModelsService } from './services/chat-models.service';
import { DeviceStatusResolver } from './resolvers/device-status.resolver';
import { DeviceStatusService } from './services/device-status.service';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { HttpModule } from '@nestjs/axios';
import { SpotifyController } from 'src/spotify/spotify.controller';
import { SpotifyService } from 'src/spotify/spotify.service';
import { GeminiLangchainService } from 'src/agent/gemini/gemini-langchain.service';
import { AgentModule } from 'src/agent/agent.module';

const graphqlModule = GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  installSubscriptionHandlers: true,
  sortSchema: true,
  playground: true,
  // plugins: [ApolloServerPluginLandingPageLocalDefault()],
  subscriptions: {
    'subscriptions-transport-ws': true,
    'graphql-ws': true,
  },
  context: ({ req }) => ({ req }),
});
import { SpotifyConnectionsController } from './controllers/spotify-connections.controller';
import { DevicesController } from './controllers/devices.controller';
import { DeviceGroupsController } from './controllers/device-groups.controller';
import { ChatModelsController } from './controllers/chat-models.controller';
import { PubSubModule } from 'src/pub-sub/pub-sub.module';

@Module({
  imports: [DatabaseModule, SpotifyModule, graphqlModule, HttpModule, AgentModule, PubSubModule],
  providers: [
    UsersService,
    FamiliesService,
    DeviceGroupsService,
    DevicesService,
    SpotifyConnectionsService,
    ChatService,
    ChatResolver,
    ChatModelsService,
    SpotifyService,
    GeminiLangchainService,
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    },
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
    // SpotifyController,
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
