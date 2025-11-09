export type AppState = 'welcome' | 'chat' | 'video' | 'tictactoe';

export type ConversationState = 'speaking' | 'idle' | 'connecting';

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}