export enum ChatModelKey {
  // Enum values correspond to the field "key" in db
  GPT_4O = 'gpt-4o',
  GPT_4O_MINI = 'gpt-4o-mini',
  GEMINI_1_5_FLASH = 'gemini-1.5-flash',
}

export const DefaultChatModel = ChatModelKey.GPT_4O;
