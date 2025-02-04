import { Injectable } from '@nestjs/common';
import { SpotifyTool } from './tools/spotify.tool';
import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';
import { ModelAIName } from './constants/model';
import { AIMessageChunk, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { Tool } from '@langchain/core/tools';
import { NoteTool } from './tools/note.tool';
import { StateGraph, END } from '@langchain/langgraph';
import { BaseMessage, AIMessage } from '@langchain/core/messages';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { Annotation, messagesStateReducer } from '@langchain/langgraph';
import type { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import * as crypto from 'crypto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { Runnable, RunnableConfig } from '@langchain/core/runnables';

interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

@Injectable()
export class AgentService {
  private currentModel: ModelAIName | null = null;

  constructor(
    private spotifyTool: SpotifyTool,
    private noteTool: NoteTool,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private checkpointer = new MemorySaver();
  private agent: ReturnType<typeof createReactAgent>;
  private tools: Tool[] = [];

  private generateCacheKey(input: string, familyId: string, modelName: string): string {
    const data = `${input}-${familyId}-${modelName}`;
    return crypto.createHash('md5').update(data).digest('hex');
  }

  private initializeModelByName(modelName: ModelAIName) {
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    const geminiApiKey = this.configService.get<string>('GEMINI_API_KEY');

    switch (modelName) {
      case ModelAIName.GEMINI_FLASH:
      case ModelAIName.GEMINI_PRO:
      case ModelAIName.GEMINI_FLASH_8B:
        return new ChatGoogleGenerativeAI({
          modelName: modelName,
          maxOutputTokens: 2048,
          temperature: 0.7,
          apiKey: geminiApiKey,
          streaming: false,
        });
      default:
        return new ChatOpenAI({
          modelName: modelName,
          openAIApiKey: apiKey,
          temperature: 0.8,
          maxTokens: 2048,
          configuration: {
            baseURL: 'https://openrouter.ai/api/v1',
          },
        });
    }
  }

  private createAgentModelGemini(
    familyId: string,
    userId: string,
    modelGeminiName: ModelAIName,
  ): ReturnType<typeof createReactAgent> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    const model = new ChatGoogleGenerativeAI({
      modelName: modelGeminiName,
      maxOutputTokens: 2048,
      temperature: 0.7,
      apiKey: apiKey,
      streaming: false,
    });

    const spotifyTools = this.spotifyTool.getAllTools(familyId);
    const noteTools = this.noteTool.getAllTools(familyId, userId);
    const tools = [...spotifyTools, ...noteTools];

    const agent = createReactAgent({
      llm: model,
      tools: tools,
      checkpointSaver: this.checkpointer,
    });
    return agent;
  }

  private createAgentModelFromOpenRouter(
    familyId: string,
    userId: string,
    modelName: string,
  ): ReturnType<typeof createReactAgent> {
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    const model = new ChatOpenAI({
      modelName: modelName,
      openAIApiKey: apiKey,
      temperature: 0.8,
      maxTokens: 2048,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
      },
    });
    const spotifyTools = this.spotifyTool.getAllTools(familyId);
    const noteTools = this.noteTool.getAllTools(familyId, userId);
    const tools = [...spotifyTools, ...noteTools];
    // ];
    const agent = createReactAgent({
      llm: model,
      tools: tools,
      checkpointSaver: this.checkpointer,
    });
    return agent;
  }

  private resetAgentState() {
    console.log('Resetting agent state...');
    this.checkpointer = new MemorySaver();
    this.agent = undefined;
    this.tools = [];
  }

  private shouldResetState(newModel: ModelAIName): boolean {
    if (this.currentModel !== newModel) {
      console.log(`Model changed from ${this.currentModel} to ${newModel}`);
      this.currentModel = newModel;
      return true;
    }
    return false;
  }

  private initializeAgent(familyId: string, userId: string, modelName: string) {
    if (this.shouldResetState(modelName as ModelAIName)) {
      this.resetAgentState();
    }

    if (
      modelName === ModelAIName.GEMINI_FLASH ||
      modelName === ModelAIName.GEMINI_PRO ||
      modelName === ModelAIName.GEMINI_FLASH_8B
    ) {
      this.agent = this.createAgentModelGemini(familyId, userId, modelName);
    } else {
      this.agent = this.createAgentModelFromOpenRouter(familyId, userId, modelName);
    }
  }

  async processMessage(
    input: string,
    familyId: string,
    userId: string,
    chatId: string,
    modelName: ModelAIName,
  ): Promise<string> {
    console.log('processMessage', input, familyId, modelName);
    this.initializeAgent(familyId, userId, modelName);
    const result = await this.agent.invoke(
      {
        messages: [new HumanMessage(input)],
      },
      { configurable: { thread_id: chatId } },
    );

    const response = result.messages.at(-1)?.content;
    return response;
  }

  private async createAgentWithLangGraph(familyId: string, userId: string, modelName: ModelAIName) {
    const systemPrompt = `You are an AI assistant for a smart home system, specifically designed to control smart speakers. Your primary functions include:

1. Audio Control:
  - Manage volume levels
  - Handle mute/unmute commands
  - Control audio playback (play, pause, skip)

2. Music Services:
  - Interface with Spotify and other music services
  - Handle playlist management
  - Process music recommendations

3. Communication Style:
  - Provide clear, concise responses
  - Confirm actions related to audio control
  - Use natural, conversational language
  - Keep responses brief and focused on speaker-related tasks
  
4. Note Taking:
  - Save notes and reminders
  - Search for notes by category or content
  - Update existing notes
  - Create new notes with tags and categories
  - create new categories/tags if not exist

5. Error Handling:
  - Clearly communicate when actions cannot be completed
  - Suggest alternatives when requested actions are not possible
  - Provide troubleshooting steps when appropriate

Remember: Focus on speaker-related functions and maintain a helpful, efficient communication style.`;

    const StateAnnotation = Annotation.Root({
      messages: Annotation<BaseMessage[]>({
        reducer: messagesStateReducer,
        default: () => [new SystemMessage(systemPrompt)],
      }),
      currentModel: Annotation<string>({
        reducer: (x, y) => y ?? x,
        default: () => modelName,
      }),
    });

    const model = this.initializeModelByName(modelName);
    const spotifyTools = this.spotifyTool.getAllTools(familyId);
    const noteTools = this.noteTool.getAllTools(familyId, userId);
    const tools = [...spotifyTools, ...noteTools];
    const toolNode = new ToolNode(tools);
    const modelWithTools = model.bindTools(tools);

    function shouldContinue(state: typeof StateAnnotation.State) {
      const messages = state.messages;
      const lastMessage = messages[messages.length - 1] as AIMessage;

      if (lastMessage.tool_calls?.length) {
        return 'tools';
      }
      return '__end__';
    }

    async function callModel(state: typeof StateAnnotation.State) {
      try {
        const messages = state.messages;
        const currentModel = state.currentModel;

        if (currentModel !== modelName) {
          console.log(`Switching model from ${currentModel} to ${modelName} within conversation`);
        }

        // Handle tool responses in the message history
        const lastMessage = messages[messages.length - 1];
        let messagesToSend = messages;

        if (lastMessage instanceof AIMessage && lastMessage.additional_kwargs?.tool_calls) {
          // Remove the last message with tool calls to prevent duplicate tool execution
          messagesToSend = messages.slice(0, -1);
        }

        const response = await modelWithTools.invoke(messagesToSend);

        // Validate response before returning
        if (!response) {
          throw new Error('Model returned empty response');
        }

        return {
          messages: [response],
          currentModel: modelName,
        };
      } catch (error) {
        console.error('Error in callModel:', error);
        // Return a graceful error message as an AIMessage
        return {
          messages: [
            new AIMessage(
              'I apologize, but I encountered an error processing your request. Could you please rephrase or try again?',
            ),
          ],
          currentModel: modelName,
        };
      }
    }

    const workflow = new StateGraph(StateAnnotation)
      .addNode('agent', callModel)
      .addNode('tools', toolNode)
      .addEdge('__start__', 'agent')
      .addConditionalEdges('agent', shouldContinue)
      .addEdge('tools', 'agent');

    const app = workflow.compile({ checkpointer: this.checkpointer });
    return app;
  }

  async processMessageWithLangGraph(
    input: string,
    familyId: string,
    userId: string,
    chatId: string,
    modelName: ModelAIName,
  ): Promise<string> {
    try {
      const agent = await this.createAgentWithLangGraph(familyId, userId, modelName);

      if (!agent) {
        throw new Error('Failed to initialize AI agent');
      }

      console.log('Invoking agent with input:', input);

      const finalState = await agent.invoke(
        {
          messages: [new HumanMessage(input)],
          currentModel: modelName,
        },
        { configurable: { thread_id: chatId } },
      );

      console.log('Agent response state:', {
        messageCount: finalState.messages.length,
        lastMessageType: finalState.messages[finalState.messages.length - 1]?.constructor.name,
      });

      const lastMessage = finalState.messages[finalState.messages.length - 1];

      if (!lastMessage) {
        throw new Error('No messages in final state');
      }

      const response = lastMessage.content;

      if (typeof response !== 'string') {
        console.warn('Unexpected response type:', response);
        return 'I apologize, but I received an unexpected response format. Please try again.';
      }

      const encoder = new TextEncoder();
      const decoder = new TextDecoder('utf-8');
      const encodedResponse = encoder.encode(response);
      const utf8Response = decoder.decode(encodedResponse);

      return utf8Response;
    } catch (error) {
      console.error('Error processing message with LangGraph:', error);
      return 'I apologize, but I encountered an error. Please try again or rephrase your request.';
    }
  }

  private logTokenUsage(stage: string, usage: TokenUsage | undefined) {
    if (usage) {
      console.log(`📊 Token Usage - ${stage}:`, {
        prompt: usage.prompt_tokens,
        completion: usage.completion_tokens,
        total: usage.total_tokens,
      });
    }
  }

  private async createLangGraphMultiAgent(familyId: string, modelName: ModelAIName) {
    console.log('🚀 Initializing Multi-Agent System...');

    const AgentState = Annotation.Root({
      messages: Annotation<BaseMessage[]>({
        reducer: (x, y) => x.concat(y),
      }),
      sender: Annotation<string>({
        reducer: (x, y) => y ?? x ?? 'user',
        default: () => 'user',
      }),
    });

    const model = this.initializeModelByName(modelName);

    const routerPrompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are an intelligent assistant that routes requests to specialized agents or responds directly.

        For these specific types of requests, route to the appropriate agent:
        - "MusicAgent" - for music related requests (playing, pausing, searching songs)
        - "NoteAgent" - for note taking related requests (saving or searching notes)
        
        For general queries, greetings, or conversations that don't require tools:
        - Respond with "DirectResponse:" followed by your answer
        
        Examples:
        User: "Play some rock music"
        Assistant: "MusicAgent"
        
        User: "Save a note about my meeting"
        Assistant: "NoteAgent"
        
        User: "Hi, how are you?"
        Assistant: "DirectResponse: Hello! I'm doing well, thank you for asking. How can I help you today?"
        
        User: "What's the weather like?"
        Assistant: "DirectResponse: I apologize, but I don't have access to real-time weather information. You might want to check a weather app or website for accurate weather data."`,
      ],
      ['human', '{input}'],
    ]);

    const routerAgent = routerPrompt.pipe(this.initializeModelByName(ModelAIName.GEMINI_PRO));

    const musicPrompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are a music assistant that helps with Spotify playback control.
        Use the available tools to help users with their music requests.
        Available tools: playTrack, getFirstTrackUri, playBackControl
        
        When you complete a task, include "FINAL ANSWER:" before your final response.`,
      ],
      ['human', '{input}'],
    ]);

    const musicAgent = musicPrompt.pipe(
      model.bind({
        tools: this.spotifyTool.getAllTools(familyId),
      }),
    );

    // Create Note Agent with proper prompt handling
    const notePrompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are a note-taking assistant.
        Use the available tools to help users manage their notes.
        Available tools: searchNotes, saveNote, getAllTags, getAllCategories, searchAllNotes
        you need to extract the category and tags from the user's input and use it to call the appropriate tool.
        When you complete a task, include "FINAL ANSWER:" before your final response.`,
      ],
      ['human', '{input}'],
    ]);

    const noteAgent = notePrompt.pipe(
      model.bind({
        tools: this.spotifyTool.getAllTools(familyId),
      }),
    );

    // Create Tool Node
    const toolNode = new ToolNode(this.spotifyTool.getAllTools(familyId));

    // Create a reference to logTokenUsage for use in closures
    const logTokenUsage = this.logTokenUsage;

    // Update routing logic with better validation and proper token logging
    async function routeToAgent(state: typeof AgentState.State) {
      const messages = state.messages;
      const lastMessage = messages[messages.length - 1];

      console.log('🔄 Router Agent Processing:', {
        lastMessage: lastMessage.content,
      });

      const response = await routerAgent.invoke({
        input: lastMessage.content,
      });

      logTokenUsage('Router Agent', (response as any).llmOutput?.tokenUsage);

      const responseContent = response.content.toString().trim();

      // Check if it's a direct response
      if (responseContent.startsWith('DirectResponse:')) {
        console.log('💬 Direct Response:', {
          response: responseContent.substring('DirectResponse:'.length).trim(),
        });

        // Return the direct response with FINAL ANSWER prefix to end the workflow
        return {
          messages: [...messages, new AIMessage(`${responseContent.substring('DirectResponse:'.length).trim()}`)],
          sender: 'end',
        };
      }

      // Handle agent routing as before
      let agentName = responseContent;
      if (!['MusicAgent', 'NoteAgent'].includes(agentName)) {
        console.log('⚠️ Invalid agent name received:', agentName);
        agentName = 'NoteAgent';
      }

      console.log('🎯 Router Decision:', {
        routedTo: agentName,
        reason: `Routing request to ${agentName}`,
      });

      return { messages: messages, sender: agentName };
    }

    function router(state: typeof AgentState.State) {
      const messages = state.messages;
      const lastMessage = messages[messages.length - 1] as AIMessage;
      const currentSender = state.sender;

      let routingDecision: string;

      if (lastMessage?.tool_calls && lastMessage.tool_calls.length > 0) {
        routingDecision = 'call_tool';
      } else if (typeof lastMessage.content === 'string' && lastMessage.content.includes('FINAL ANSWER')) {
        routingDecision = 'end';
      } else {
        // Ensure we return to the correct agent
        routingDecision = currentSender === 'MusicAgent' || currentSender === 'NoteAgent' ? currentSender : 'NoteAgent';
      }

      console.log('🔀 Routing Decision:', {
        from: currentSender,
        to: routingDecision,
        hasToolCalls: !!lastMessage?.tool_calls?.length,
      });

      return routingDecision;
    }

    // Update musicNode with proper token logging
    async function musicNode(state: typeof AgentState.State) {
      const messages = state.messages;
      const lastMessage = messages[messages.length - 1];

      console.log('🎵 Music Agent Processing:', {
        messages: messages.map((m) => m.content),
      });

      const response = await musicAgent.invoke({
        input: lastMessage.content,
      });

      // Log music agent token usage with the captured function
      logTokenUsage('Music Agent', (response as any).llmOutput?.tokenUsage);

      console.log('🎵 Music Agent Response:', {
        response: response.content,
        hasToolCalls: !!response.tool_calls?.length,
        tools: response.tool_calls?.map((t) => t.name),
      });

      return { messages: [...messages, response], sender: 'MusicAgent' };
    }

    // Update noteNode with proper token logging
    async function noteNode(state: typeof AgentState.State) {
      const messages = state.messages;
      const lastMessage = messages[messages.length - 1];

      console.log('📝 Note Agent Processing:', {
        messages: messages.map((m) => m.content),
      });

      const response = await noteAgent.invoke({
        input: lastMessage.content,
      });

      // Log note agent token usage with the captured function
      logTokenUsage('Note Agent', (response as any).llmOutput?.tokenUsage);

      console.log('📝 Note Agent Response:', {
        response: response.content,
        hasToolCalls: !!response.tool_calls?.length,
        tools: response.tool_calls?.map((t) => t.name),
      });

      return { messages: [...messages, response], sender: 'NoteAgent' };
    }

    // Update tool node to maintain message history
    const wrappedToolNode = async (state: typeof AgentState.State) => {
      console.log('🛠️ Executing Tools:', {
        agent: state.sender,
        message: state.messages[state.messages.length - 1].content,
      });

      const result = await toolNode.invoke(state);

      return {
        messages: [...state.messages, ...result.messages],
        sender: state.sender,
      };
    };

    // Create and compile the graph with explicit edges
    const workflow = new StateGraph(AgentState)
      .addNode('router', routeToAgent)
      .addNode('MusicAgent', musicNode)
      .addNode('NoteAgent', noteNode)
      .addNode('call_tool', wrappedToolNode)
      .addEdge('__start__', 'router');

    // Add conditional edges with explicit mapping
    workflow.addConditionalEdges(
      'router',
      (state) => {
        const sender = state.sender;
        console.log('Router edge condition:', { sender });
        if (sender === 'end') {
          return END;
        }
        return sender === 'MusicAgent' ? 'MusicAgent' : 'NoteAgent';
      },
      {
        MusicAgent: 'MusicAgent',
        NoteAgent: 'NoteAgent',
        [END]: END,
      },
    );

    // Add conditional edges from agents with explicit conditions
    workflow.addConditionalEdges(
      'MusicAgent',
      (state) => {
        const decision = router(state);
        console.log('Music agent edge condition:', { decision });
        return decision;
      },
      {
        MusicAgent: 'MusicAgent',
        call_tool: 'call_tool',
        end: END,
      },
    );

    workflow.addConditionalEdges(
      'NoteAgent',
      (state) => {
        const decision = router(state);
        console.log('Note agent edge condition:', { decision });
        return decision;
      },
      {
        NoteAgent: 'NoteAgent',
        call_tool: 'call_tool',
        end: END,
      },
    );

    // Add edges from tool back to agents with validation
    workflow.addConditionalEdges(
      'call_tool',
      (state) => {
        const sender = state.sender;
        console.log('Tool edge condition:', { sender });
        return sender === 'MusicAgent' ? 'MusicAgent' : 'NoteAgent';
      },
      {
        MusicAgent: 'MusicAgent',
        NoteAgent: 'NoteAgent',
      },
    );

    console.log('✨ Multi-Agent System Initialized');
    return workflow.compile({ checkpointer: this.checkpointer });
  }

  async processMessageWithMultiAgent(
    input: string,
    familyId: string,
    chatId: string,
    modelName: ModelAIName,
  ): Promise<string> {
    try {
      console.log('📥 New Message Received:', {
        input,
        familyId,
        modelName,
      });

      const totalTokens = {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      };

      const agent = await this.createLangGraphMultiAgent(familyId, modelName);

      if (!agent) {
        throw new Error('Failed to initialize multi-agent system');
      }

      console.log('🏃 Starting Multi-Agent Workflow');

      const finalState = await agent.invoke(
        {
          messages: [new HumanMessage(input)],
          sender: 'user',
        },
        { configurable: { thread_id: chatId } },
      );

      const lastMessage = finalState.messages[finalState.messages.length - 1];
      const response = lastMessage?.content as string;

      if (!response) {
        throw new Error('No response generated from multi-agent system');
      }

      // Calculate and log total token usage for this request
      console.log('📊 Total Token Usage:', {
        prompt: totalTokens.prompt_tokens,
        completion: totalTokens.completion_tokens,
        total: totalTokens.total_tokens,
      });

      console.log('📤 Workflow Complete:', {
        finalResponse: response,
        messageCount: finalState.messages.length,
      });

      return response;
    } catch (error) {
      console.error('❌ Error in Multi-Agent System:', error);
      throw new Error(`Failed to process message with multi-agent system: ${error.message}`);
    }
  }
}
