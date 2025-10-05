
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
import { useAppComponent } from "@/context/app-context";

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
  const { t } = useAppComponent();

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
      if (result?.error) {
        toast({
          variant: "destructive",
          title: t('couldNotSave'),
          description: result.error,
        });
      } else if (result?.errors) {
        toast({
            variant: "destructive",
            title: t('validationError'),
            description: t('validationErrorDesc'),
        });
      } else {
        toast({
          title: t('success'),
          description: t('successSave', { chatName: data.name }),
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
            <CardTitle>{t('basicInfo')}</CardTitle>
            <CardDescription>{t('basicInfoDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('appName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('appNamePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('promptsAndMessages')}</CardTitle>
            <CardDescription>{t('promptsAndMessagesDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="persistentPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('persistentPrompt')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder="You are a helpful assistant..." {...field} rows={4} />
                  </FormControl>
                  <FormDescription>{t('persistentPromptDesc')}</FormDescription>
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
                    <FormLabel>{t('welcomeMessage')}</FormLabel>
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
                    <FormLabel>{t('waitingMessage')}</FormLabel>
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
                  <FormLabel>{t('finalMessage')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Thank you for chatting. The conversation has now ended." {...field} />
                  </FormControl>
                  <FormDescription>{t('finalMessageDesc')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('configuration')}</CardTitle>
            <CardDescription>{t('configurationDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-x-6 gap-y-8">
            <FormField
              control={form.control}
              name="messageLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('messageLimit')}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>{t('messageLimitDesc')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="characterLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('characterLimit')}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>{t('characterLimitDesc')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="animationSpeed"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>{t('typingSpeed')}</FormLabel>
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
                  <FormDescription>{t('typingSpeedDesc')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('language')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectLanguage')} />
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
                {isPending ? t('saving') : t('saveConfiguration')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
