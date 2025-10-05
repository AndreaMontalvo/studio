"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { ChatConfigSchema } from "@/lib/schemas";
import { chatConfigSchema } from "@/lib/schemas";
import type { ChatConfig } from "@/lib/types";
import { saveChat } from "@/lib/actions";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save } from "lucide-react";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";

interface ChatFormProps {
  chat?: ChatConfig | null;
}

const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "ja", label: "Japanese" },
];

export function ChatForm({ chat }: ChatFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<ChatConfigSchema>({
    resolver: zodResolver(chatConfigSchema),
    defaultValues: chat || {
      name: "",
      persistentPrompt: "You are a helpful and friendly assistant.",
      welcomeMessage: "Welcome! How can I help you today?",
      finalMessage: "Thank you for chatting. The conversation has now ended.",
      waitingMessage: "Please wait while I formulate a response...",
      messageLimit: 10,
      characterLimit: 280,
      animationSpeed: 50,
      language: "en",
    },
  });

  function onSubmit(data: ChatConfigSchema) {
    startTransition(async () => {
      const result = await saveChat(data);
      if (result?.errors) {
        // This part is for server-side validation errors, though most should be caught client-side.
        toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Please check the form for errors.",
        });
      } else {
        toast({
          title: "Success!",
          description: `Chat configuration "${data.name}" has been saved.`,
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {chat?.id && <input type="hidden" {...form.register("id")} value={chat.id} />}

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Define the core identity of your chat application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Customer Support Bot" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prompts & Messages</CardTitle>
            <CardDescription>Set the conversational boundaries and messages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="persistentPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Persistent Prompt</FormLabel>
                  <FormControl>
                    <Textarea placeholder="You are a helpful assistant..." {...field} rows={4} />
                  </FormControl>
                  <FormDescription>This system-level prompt guides the AI's behavior throughout the conversation.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="welcomeMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Welcome Message</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Welcome! How can I help you today?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="waitingMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waiting Message</FormLabel>
                    <FormControl>
                      <Textarea placeholder="One moment please..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="finalMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Final Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Thank you for chatting. The conversation has now ended." {...field} />
                  </FormControl>
                  <FormDescription>Shown when the message limit is reached.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Fine-tune the chat behavior and limits.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-x-6 gap-y-8">
            <FormField
              control={form.control}
              name="messageLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message Limit</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>Max number of user messages per session.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="characterLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Character Limit</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>Max characters per user message.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="animationSpeed"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Animation Speed (ms/char)</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                        <Slider
                            min={0}
                            max={200}
                            step={10}
                            onValueChange={(value) => field.onChange(value[0])}
                            value={[field.value]}
                        />
                        <span className="text-sm font-medium w-12 text-center shrink-0">{field.value}ms</span>
                    </div>
                  </FormControl>
                  <FormDescription>Delay per character for typing animation. 0 for instant.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <div className="flex justify-end sticky bottom-0 py-4 bg-background/80 backdrop-blur-sm">
            <Button type="submit" disabled={isPending} size="lg">
                <Save className="mr-2" />
                {isPending ? "Saving..." : "Save Configuration"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
