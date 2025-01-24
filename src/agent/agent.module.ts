import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { GeminiLangchainService } from './gemini/gemini-langchain.service';
import { AgentController } from './agent.controller';
import { NoteTool } from './tools/note.tool';
import { MongoService } from '../database/mongo.service';

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [AgentController],
  providers: [
    GeminiLangchainService,
    {
      provide: NoteTool,
      useFactory: (mongoService: MongoService) => new NoteTool(mongoService),
      inject: [MongoService],
    },
  ],
  exports: [GeminiLangchainService, NoteTool],
})
export class AgentModule {}
