export enum ModelAIName {
  // Enum values correspond to the field "key" in db
  DEEP_SEEK = 'deepseek/deepseek-r1:free',
  META_LLAMA = 'meta-llama/llama-3.1-405b-instruct:free',
  GEMINI_FLASH = 'gemini-1.5-flash-latest',
  GEMINI_FLASH_8B = 'gemini-1.5-flash-8b-001',
  GEMINI_PRO = 'gemini-1.5-pro-latest',
  OPENAI_GPT_4O_MINI = 'openai/gpt-4o-mini',
  LLAMA_3_3_70B = 'meta-llama/llama-3.3-70b-instruct',
}

export const DefaultModelAIName = ModelAIName.GEMINI_FLASH;
