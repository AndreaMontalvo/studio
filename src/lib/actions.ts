
'use server';

import fs from 'fs/promises';
import path from 'path';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {ChatConfig, ChatMessage} from './types';
import {ChatConfigSchema, chatConfigSchema} from './schemas';
import crypto from 'crypto';
import { simulatedResponses } from './simulated-responses';
import { simulatedResponsesEs } from './simulated-responses-es';

const dataDir = path.join(process.cwd(), 'src', 'data', 'chats');
const historyDir = path.join(process.cwd(), 'src', 'data', 'history');
const CHAT_LIMIT = 10;

async function ensureDir(dirPath: string) {
  await fs.mkdir(dirPath, {recursive: true});
}

export async function getChats(): Promise<ChatConfig[]> {
  await ensureDir(dataDir);
  try {
    const files = await fs.readdir(dataDir);
    const chatFiles = files.filter(file => file.endsWith('.json'));

    const chats = await Promise.all(
      chatFiles.map(async file => {
        const filePath = path.join(dataDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content) as ChatConfig;
      })
    );

    return chats.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Failed to get chats:', error);
    return [];
  }
}

export async function getChatById(id: string): Promise<ChatConfig | null> {
  await ensureDir(dataDir);
  const filePath = path.join(dataDir, `${id}.json`);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as ChatConfig;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    console.error(`Failed to get chat ${id}:`, error);
    return null;
  }
}

export async function saveChat(formData: ChatConfigSchema) {
  const validatedFields = chatConfigSchema.safeParse(formData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  await ensureDir(dataDir);

  let {id, ...data} = validatedFields.data;
  let isNew = !id;

  if (isNew) {
    const chats = await getChats();
    if (chats.length >= CHAT_LIMIT) {
      return {
        error: 'Chat limit reached. Please delete a chat to create a new one.',
      };
    }
    id = crypto.randomUUID();
  }

  const chatData: ChatConfig = {
    id: id!,
    ...data,
    createdAt: isNew
      ? new Date().toISOString()
      : (await getChatById(id!))?.createdAt || new Date().toISOString(),
  };

  const filePath = path.join(dataDir, `${id}.json`);

  try {
    await fs.writeFile(filePath, JSON.stringify(chatData, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Failed to save chat ${id}:`, error);
    return {error: 'Failed to save chat.'};
  }

  revalidatePath('/');
  if (isNew) {
    revalidatePath('/chats/new');
  } else {
    revalidatePath(`/chats/${id}/edit`);
  }
  redirect(`/`);
}

export async function deleteChat(formData: FormData, revalidate: boolean = true) {
  const id = formData.get('id') as string;
  if (!id) return;

  const filePath = path.join(dataDir, `${id}.json`);
  try {
    await fs.unlink(filePath);
    // Also delete history
    const historyPath = path.join(historyDir, `${id}.json`);
    await fs.unlink(historyPath).catch(err => {
      // Ignore if history file doesn't exist
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw err;
      }
    });
  } catch (error) {
    console.error(`Failed to delete chat ${id}:`, error);
    // Handle error (e.g., show a toast)
  }
  if (revalidate) {
    revalidatePath('/');
  }
}

export async function duplicateChat(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return { error: "No chat ID provided for duplication."};

  const chats = await getChats();
  if (chats.length >= CHAT_LIMIT) {
    return {
      error: 'Chat limit reached. Please delete a chat to duplicate one.',
    };
  }

  const originalChat = await getChatById(id);
  if (!originalChat) return { error: "Original chat not found."};

  const newId = crypto.randomUUID();
  const newChat: ChatConfig = {
    ...originalChat,
    id: newId,
    name: `${originalChat.name} (Copy)`,
    createdAt: new Date().toISOString(),
  };

  const filePath = path.join(dataDir, `${newId}.json`);
  try {
    await fs.writeFile(filePath, JSON.stringify(newChat, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Failed to duplicate chat ${id}:`, error);
    return { error: `Failed to duplicate chat.` };
  }
  revalidatePath('/');
  return { success: true };
}

export async function getChatHistory(chatId: string): Promise<ChatMessage[]> {
  await ensureDir(historyDir);
  const filePath = path.join(historyDir, `${chatId}.json`);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const history = JSON.parse(content);
    // Ensure it returns an array even if the file is empty or malformed
    return Array.isArray(history) ? history : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []; // No history yet, return empty array
    }
    console.error(`Failed to get history for chat ${chatId}:`, error);
    return []; // Return empty array on other errors too
  }
}

export async function getMessageCount(chatId: string): Promise<number> {
  const history = await getChatHistory(chatId);
  return history.filter(m => m.sender === 'user').length;
}

export async function saveChatHistory(chatId: string, messages: ChatMessage[]) {
  await ensureDir(historyDir);
  const filePath = path.join(historyDir, `${chatId}.json`);
  try {
    await fs.writeFile(filePath, JSON.stringify(messages, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Failed to save history for chat ${chatId}:`, error);
  }
}

export async function streamAiResponse(
  chatId: string,
  currentMessages: ChatMessage[]
): Promise<ChatMessage | null> {
  const chatConfig = await getChatById(chatId);
  if (!chatConfig) {
    console.error('Chat configuration not found.');
    return {
        id: crypto.randomUUID(),
        sender: 'bot',
        text: "Sorry, I can't find this chat's configuration.",
    }
  }

  // Save the user's message to history before generating a response.
  await saveChatHistory(chatId, currentMessages);

  const responses = chatConfig.language === 'es' ? simulatedResponsesEs : simulatedResponses;
  const responseText = responses[Math.floor(Math.random() * responses.length)];

  const newBotMessage: ChatMessage = {
    id: crypto.randomUUID(),
    sender: 'bot',
    text: responseText,
  };

  return newBotMessage;
}
