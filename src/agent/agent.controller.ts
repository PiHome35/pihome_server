import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GeminiLangchainService } from './gemini/gemini-langchain.service';
import { AgentQueryDto } from './dto/agent-query.dto';
import { AgentResponseDto } from './dto/agent-response.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('Agent')
@Controller('agent')
export class AgentController {
  constructor(private readonly geminiLangchainService: GeminiLangchainService) {}

  @Public()
  @Post('process')
  @ApiOperation({
    summary: 'Process a message using the AI agent',
    description: 'Processes a message using LangChain tools including a calculator.',
  })
  @ApiResponse({
    status: 200,
    description: 'Message processed successfully',
    type: AgentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request format',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error during processing',
  })
  async processMessage(@Body() query: AgentQueryDto): Promise<AgentResponseDto> {
    console.log('Processing message:', query.message);
    const response = await this.geminiLangchainService.processMessage(query.message);
    return { response };
  }

  @Public()
  @Post('ask')
  @ApiOperation({
    summary: 'Ask a direct question to Gemini',
    description: 'Sends a question directly to Gemini AI through LangChain',
  })
  @ApiResponse({
    status: 200,
    description: 'Question answered successfully',
    type: AgentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request format',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error during processing',
  })
  async askQuestion(@Body() query: AgentQueryDto): Promise<AgentResponseDto> {
    console.log('Asking question:', query.message);
    const response = await this.geminiLangchainService.askQuestion(query.message);
    return { response };
  }
}
