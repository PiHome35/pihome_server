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
import { HttpModule } from '@nestjs/axios';
import { SpotifyService } from 'src/spotify/spotify.service';
import { AgentModule } from '../agent/agent.module';
import { SpotifyConnectionsController } from './controllers/spotify-connections.controller';
import { DevicesController } from './controllers/devices.controller';
import { DeviceGroupsController } from './controllers/device-groups.controller';
import { ChatModelsController } from './controllers/chat-models.controller';
import { PubSubModule } from 'src/pub-sub/pub-sub.module';
import { MongoService } from 'src/database/mongo.service';
import { SpotifyTool } from 'src/agent/tools/spotify.tool';
import { NoteTool } from 'src/agent/tools/note.tool';
// import { GeminiLangGraphModule } from 'src/agent/gemini/gemini-langgraph.module';

const graphqlModule = GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  installSubscriptionHandlers: true,
  sortSchema: true,
  playground: true,
  subscriptions: {
    'subscriptions-transport-ws': true,
    'graphql-ws': true,
  },
  context: ({ req }) => ({ req }),
});

@Module({
  imports: [DatabaseModule, SpotifyModule, graphqlModule, HttpModule, PubSubModule, AgentModule],
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
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    },
    SpotifyTool,
    NoteTool,
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
