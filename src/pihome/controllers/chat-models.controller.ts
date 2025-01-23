import { Controller, Get, UseGuards } from '@nestjs/common';
import { ChatModelsService } from '../services/chat-models.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiOkResponse } from '@nestjs/swagger';
import { ListChatModelsResponseDto } from '../dto/chat-model/list-chat-models.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('chat-models')
@ApiTags('Chat Models')
@UseGuards(JwtAuthGuard)
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
