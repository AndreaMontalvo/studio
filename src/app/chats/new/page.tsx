
'use client';

import { Header } from "@/components/header";
import { ChatForm } from "@/components/chat-form";
import { useAppComponent } from "@/context/app-context";

export default function NewChatPage() {
  const { t } = useAppComponent();
  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="mb-8 max-w-3xl mx-auto">
          <h1 className="text-3xl font-headline font-bold">{t('newChat')}</h1>
          <p className="text-muted-foreground mt-2">{t('newChatDesc')}</p>
        </div>
        <div className="max-w-3xl mx-auto">
          <ChatForm />
        </div>
      </main>
    </div>
  );
}
