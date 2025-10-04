'use server';

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ChatRequestSchema = z.object({
  history: z.array(
    z.object({
      sender: z.enum(['user', 'bot']),
      text: z.string(),
    })
  ),
  chatConfig: z.object({
    persistentPrompt: z.string(),
    language: z.string(),
  }),
});

export const generateResponse = ai.defineFlow(
  {
    name: 'generateResponse',
    inputSchema: ChatRequestSchema,
    outputSchema: z.object({
      text: z.string(),
    }),
  },
  async ({history, chatConfig}) => {
    const llmHistory = history.map(msg => ({
      role: msg.sender,
      content: [{text: msg.text}],
    }));

    const {output} = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: `Please continue the conversation. The user's preferred language is ${chatConfig.language}.`,
      system: chatConfig.persistentPrompt,
      history: llmHistory,
    });

    return {text: output!.text!};
  }
);
