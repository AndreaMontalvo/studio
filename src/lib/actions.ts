"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ChatConfig } from "./types";
import { ChatConfigSchema, chatConfigSchema } from "./schemas";
import crypto from "crypto";

const dataDir = path.join(process.cwd(), "src", "data", "chats");

async function ensureDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

export async function getChats(): Promise<ChatConfig[]> {
  await ensureDir();
  try {
    const files = await fs.readdir(dataDir);
    const chatFiles = files.filter((file) => file.endsWith(".json"));
    
    const chats = await Promise.all(
      chatFiles.map(async (file) => {
        const filePath = path.join(dataDir, file);
        const content = await fs.readFile(filePath, "utf-8");
        return JSON.parse(content) as ChatConfig;
      })
    );

    return chats.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Failed to get chats:", error);
    return [];
  }
}

export async function getChatById(id: string): Promise<ChatConfig | null> {
  await ensureDir();
  const filePath = path.join(dataDir, `${id}.json`);
  try {
    const content = await fs.readFile(filePath, "utf-8");
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
    // This should be handled client-side, but as a fallback:
    console.error("Form validation failed", validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  await ensureDir();

  let { id, ...data } = validatedFields.data;
  let isNew = !id;

  if (isNew) {
    id = crypto.randomUUID();
  }

  const chatData: ChatConfig = {
    id: id!,
    ...data,
    createdAt: isNew ? new Date().toISOString() : (await getChatById(id!))?.createdAt || new Date().toISOString(),
  };

  const filePath = path.join(dataDir, `${id}.json`);

  try {
    await fs.writeFile(filePath, JSON.stringify(chatData, null, 2), "utf-8");
  } catch (error) {
    console.error(`Failed to save chat ${id}:`, error);
    // Here you could use the toast system for errors
    return { message: "Failed to save chat." };
  }

  revalidatePath("/");
  if (isNew) {
      revalidatePath("/chats/new");
  } else {
      revalidatePath(`/chats/${id}/edit`);
  }
  redirect(`/`);
}


export async function deleteChat(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;
  
  const filePath = path.join(dataDir, `${id}.json`);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error(`Failed to delete chat ${id}:`, error);
    // Handle error (e.g., show a toast)
  }
  revalidatePath("/");
}

export async function duplicateChat(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const originalChat = await getChatById(id);
  if (!originalChat) return;

  const newId = crypto.randomUUID();
  const newChat: ChatConfig = {
    ...originalChat,
    id: newId,
    name: `${originalChat.name} (Copy)`,
    createdAt: new Date().toISOString(),
  };

  const filePath = path.join(dataDir, `${newId}.json`);
  try {
    await fs.writeFile(filePath, JSON.stringify(newChat, null, 2), "utf-8");
  } catch (error) {
    console.error(`Failed to duplicate chat ${id}:`, error);
    // Handle error
  }
  revalidatePath("/");
}
