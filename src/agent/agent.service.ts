import { Injectable } from '@nestjs/common';
import { SpotifyTool } from './tools/spotify.tool';
import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';
import { ModelAIName } from './constants/model';
import { HumanMessage } from '@langchain/core/messages';
import { Tool } from '@langchain/core/tools';
import { NoteTool } from './tools/note.tool';
import { StateGraph } from '@langchain/langgraph';
import { BaseMessage, AIMessage } from '@langchain/core/messages';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { Annotation, messagesStateReducer } from '@langchain/langgraph';

@Injectable()
export class AgentService {
  constructor(
    private spotifyTool: SpotifyTool,
    private noteTool: NoteTool,
    private configService: ConfigService,
  ) {}

  private checkpointer = new MemorySaver();
  private agent: ReturnType<typeof createReactAgent>;
  private tools: Tool[] = [];
  private createAgentModelGemini(familyId: string, modelGeminiName: ModelAIName): ReturnType<typeof createReactAgent> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    const model = new ChatGoogleGenerativeAI({
      modelName: modelGeminiName,
      maxOutputTokens: 2048,
      temperature: 0.7,
      apiKey: apiKey,
      streaming: false,
    });

    const tools = [
      this.spotifyTool.setFamilyId(familyId).playTrack,
      this.spotifyTool.setFamilyId(familyId).getFirstTrackUri,
      this.spotifyTool.setFamilyId(familyId).playBackControl,
      this.noteTool.setFamilyId(familyId).searchNotes,
      this.noteTool.setFamilyId(familyId).saveNote,
    ];
    const agent = createReactAgent({
      llm: model,
      tools: this.tools,
      checkpointSaver: this.checkpointer,
    });
    return agent;
  }

  private createAgentModelFromOpenRouter(familyId: string, modelName: string): ReturnType<typeof createReactAgent> {
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    const model = new ChatOpenAI({
      modelName: 'openai/gpt-4o-mini',
      openAIApiKey: apiKey,
      temperature: 0.8,
      maxTokens: 2048,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
      },
    });
    const tools = [
      this.spotifyTool.setFamilyId(familyId).playTrack,
      this.spotifyTool.setFamilyId(familyId).getFirstTrackUri,
      this.spotifyTool.setFamilyId(familyId).playBackControl,
      this.noteTool.setFamilyId(familyId).searchNotes,
      this.noteTool.setFamilyId(familyId).saveNote,
    ];
    const agent = createReactAgent({
      llm: model,
      tools: [],
      checkpointSaver: this.checkpointer,
    });
    return agent;
  }

  private initializeAgent(familyId: string, modelName: string) {
    if (
      modelName === ModelAIName.GEMINI_FLASH ||
      modelName === ModelAIName.GEMINI_PRO ||
      modelName === ModelAIName.GEMINI_FLASH_8B
    ) {
      this.agent = this.createAgentModelGemini(familyId, modelName);
    } else {
      this.agent = this.createAgentModelFromOpenRouter(familyId, modelName);
    }
  }

  async processMessage(input: string, familyId: string, chatId: string, modelName: ModelAIName): Promise<string> {
    console.log('processMessage', input, familyId, modelName);
    this.initializeAgent(familyId, modelName);
    const result = await this.agent.invoke(
      {
        messages: [new HumanMessage(input)],
      },
      { configurable: { thread_id: chatId } },
    );
    console.log('result: ', result);

    const response = result.messages;
    console.log(`result.messages`, result.messages.at(-1)?.content);
    return result.messages.at(-1)?.content;
  }

  private createAgentWithLangGraph(familyId: string, modelName: string) {
    // Define state annotation for the graph
    const StateAnnotation = Annotation.Root({
      messages: Annotation<BaseMessage[]>({
        reducer: messagesStateReducer,
      }),
    });

    // Initialize OpenRouter model
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    const model = new ChatOpenAI({
      // modelName: 'meta-llama/llama-3.3-70b-instruct',
      // modelName: 'openai/gpt-4o-mini',
      // modelName: 'deepseek/deepseek-r1',
      modelName: 'deepseek/deepseek-chat',
      openAIApiKey: apiKey,
      temperature: 0.8,
      maxTokens: 2048,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
      },
    });

    // Initialize tools
    const tools = [
      this.spotifyTool.setFamilyId(familyId).playTrack,
      this.spotifyTool.setFamilyId(familyId).getFirstTrackUri,
      this.spotifyTool.setFamilyId(familyId).playBackControl,
      this.noteTool.setFamilyId(familyId).searchNotes,
      this.noteTool.setFamilyId(familyId).saveNote,
    ];

    const toolNode = new ToolNode(tools);
    const modelWithTools = model.bindTools(tools);

    // Define the function that determines whether to continue
    function shouldContinue(state: typeof StateAnnotation.State) {
      const messages = state.messages;
      const lastMessage = messages[messages.length - 1] as AIMessage;

      if (lastMessage.tool_calls?.length) {
        return 'tools';
      }
      return '__end__';
    }

    // Define the model call function
    async function callModel(state: typeof StateAnnotation.State) {
      const messages = state.messages;
      const response = await modelWithTools.invoke(messages);
      // const response = await model.invoke(messages);
      return { messages: [response] };
    }

    // Create and compile the graph
    const workflow = new StateGraph(StateAnnotation)
      .addNode('agent', callModel)
      .addNode('tools', toolNode)
      .addEdge('__start__', 'agent')
      .addConditionalEdges('agent', shouldContinue)
      .addEdge('tools', 'agent');

    // Compile with memory checkpointer
    const app = workflow.compile({ checkpointer: this.checkpointer });
    return app;
  }

  // New method to process messages using LangGraph
  async processMessageWithLangGraph(
    input: string,
    familyId: string,
    chatId: string,
    modelName: string,
  ): Promise<string> {
    try {
      const agent = this.createAgentWithLangGraph(familyId, modelName);
      const finalState = await agent.invoke(
        { messages: [new HumanMessage(input)] },
        { configurable: { thread_id: chatId } },
      );

      // Get the last message content
      const lastMessage = finalState.messages[finalState.messages.length - 1];
      console.log('lastMessage', lastMessage);
      return lastMessage.content as string;
    } catch (error) {
      console.error('Error processing message with LangGraph:', error);
      throw new Error('Failed to process message with AI agent');
    }
  }
}
