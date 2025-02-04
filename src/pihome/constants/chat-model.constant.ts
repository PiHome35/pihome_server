export enum ChatModelKey {
  // Enum values correspond to the field "key" in db
  GPT_4O = 'gpt-4o',
  GPT_4O_MINI = 'gpt-4o-mini',
  GEMINI_1_5_FLASH = 'gemini-1.5-flash',
  GEMINI_1_5_PRO = 'gemini-1.5-pro',
  DEEPSEEK_R1 = 'deepseek-r1',
  LLAMA_3_3_70B_INSTRUCT = 'llama-3.3-70b-instruct',
}

export const DefaultChatModel = ChatModelKey.GEMINI_1_5_PRO;
