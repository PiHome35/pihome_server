import { Injectable } from '@nestjs/common';
import { ChatModel } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ChatModelsService {
  constructor(private prisma: PrismaService) {}

  async listChatModels(): Promise<ChatModel[]> {
    return this.prisma.chatModel.findMany();
  }
}
