import { z } from 'zod';

export const chatConfigSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Application name is required.'),
  persistentPrompt: z.string().min(1, 'Persistent prompt is required.'),
  welcomeMessage: z.string().min(1, 'Welcome message is required.'),
  finalMessage: z.string().min(1, 'Final message is required.'),
  waitingMessage: z.string().min(1, 'Waiting message is required.'),
  messageLimit: z.coerce.number().min(1, 'Message limit must be at least 1.'),
  characterLimit: z.coerce.number().min(10, 'Character limit must be at least 10.'),
  animationSpeed: z.coerce.number().min(0, 'Animation speed cannot be negative.'),
  language: z.string().min(1, 'Language is required.'),
});

export type ChatConfigSchema = z.infer<typeof chatConfigSchema>;
