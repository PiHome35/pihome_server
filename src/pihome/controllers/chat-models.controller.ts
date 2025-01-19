import { Controller, Get } from '@nestjs/common';
import { ChatModelsService } from '../services/chat-models.service';
import { ApiOperation } from '@nestjs/swagger';
import { ApiOkResponse } from '@nestjs/swagger';
import { ListChatModelsResponseDto } from '../dto/chat-model/list-chat-models.dto';

@Controller('chat-models')
export class ChatModelsController {
  constructor(private chatModelsService: ChatModelsService) {}

  @Get()
  @ApiOperation({ summary: 'List chat models' })
  @ApiOkResponse({ type: ListChatModelsResponseDto })
  async listChatModels(): Promise<ListChatModelsResponseDto> {
    const chatModels = await this.chatModelsService.listChatModels();
    return new ListChatModelsResponseDto({ chatModels });
  }
}
