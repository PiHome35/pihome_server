import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { Tool } from '@langchain/core/tools';
import { AgentExecutor, createStructuredChatAgent } from 'langchain/agents';
import { pull } from 'langchain/hub';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { CalculatorTool } from '../tools/calculator.tool';
import { NoteTool } from '../tools/note.tool';
import { BaseMessage } from '@langchain/core/messages';

@Injectable()
export class GeminiLangchainService {
  private model: ChatGoogleGenerativeAI;
  private tools: Tool[] = [];
  private agent: AgentExecutor;

  constructor(
    private configService: ConfigService,
    private noteTool: NoteTool,
  ) {
    this.initializeModel();
    this.registerTools();
    this.setupAgent();
  }

  private initializeModel() {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    this.model = new ChatGoogleGenerativeAI({
      modelName: 'gemini-1.5-pro',
      apiKey,
      maxOutputTokens: 2048,
    });
  }

  private registerTools() {
    this.tools.push(new CalculatorTool());
    this.tools.push(this.noteTool);
  }

  private async setupAgent() {
    const prompt = await pull<ChatPromptTemplate>('hwchase17/structured-chat-agent');
    const agent = await createStructuredChatAgent({
      llm: this.model,
      tools: this.tools,
      prompt,
    });
    this.agent = new AgentExecutor({
      agent,
      tools: this.tools,
    });
  }

  async processMessage(message: string): Promise<string> {
    try {
      console.log('🤔 Agent received message:', message);
      const result = await this.agent.invoke({
        input: message,
        callbacks: [
          {
            handleToolStart(tool: { tool: string }): Promise<void> {
              console.log('🛠️ Starting tool:', tool.tool);
              return Promise.resolve();
            },
            handleToolEnd(output: { output: string }): Promise<void> {
              console.log('📝 Tool output:', output);
              return Promise.resolve();
            },
            handleAgentAction(action: { tool: string; toolInput: string; log: string }): Promise<void> {
              console.log('🔍 Agent action:', {
                tool: action.tool,
                input: action.toolInput,
                log: action.log,
              });
              return Promise.resolve();
            },
            handleLLMStart() {
              console.log('🧠 Agent is thinking...');
              return Promise.resolve();
            },
            handleLLMNewToken(token: string) {
              process.stdout.write(token);
              return Promise.resolve();
            },
            handleLLMEnd() {
              console.log('\n💭 Agent finished thinking');
              return Promise.resolve();
            },
          },
        ],
      });

      console.log('🎯 Final response:', result.output);
      return result.output;
    } catch (error) {
      console.error('❌ Error processing message:', error);
      throw new Error('Failed to process message with agent');
    }
  }

  async askQuestion(question: string): Promise<string> {
    try {
      const response = await this.model.invoke(question);
      const messages = Array.isArray(response) ? response : [response];
      return messages.map((msg: BaseMessage) => this.messageToString(msg)).join('\n');
    } catch (error) {
      console.error('Error asking question:', error);
      throw new Error('Failed to get response from Gemini');
    }
  }

  private messageToString(message: BaseMessage): string {
    return message.content.toString();
  }

  getTools(): Tool[] {
    return this.tools;
  }
}
