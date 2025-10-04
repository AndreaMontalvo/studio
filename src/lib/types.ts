export interface ChatConfig {
  id: string;
  name: string;
  persistentPrompt: string;
  welcomeMessage: string;
  finalMessage: string;
  waitingMessage: string;
  messageLimit: number;
  characterLimit: number;
  animationSpeed: number; // in ms per character
  language: string;
  createdAt: string; // ISO string
}

export interface ChatMessage {
    id: string;
    sender: "user" | "bot";
    text: string;
}
