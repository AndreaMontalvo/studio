
'use client';

import { Header } from "@/components/header";
import { ChatForm } from "@/components/chat-form";
import { getChatById } from "@/lib/actions";
import { notFound } from "next/navigation";
import { useAppComponent } from "@/context/app-context";
import { useEffect, useState } from "react";
import { ChatConfig } from "@/lib/types";

interface EditChatPageProps {
    params: {
        id: string;
    };
}

export default function EditChatPage({ params }: EditChatPageProps) {
  const [chat, setChat] = useState<ChatConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useAppComponent();

  useEffect(() => {
    getChatById(params.id).then(chatData => {
      if (!chatData) {
        notFound();
      } else {
        setChat(chatData);
      }
      setLoading(false);
    });
  }, [params.id]);


  if (loading) {
    return (
        <div className="flex flex-col w-full min-h-screen">
            <Header />
            <main className="flex-1 container mx-auto py-8 px-4">
                <div className="animate-pulse max-w-3xl mx-auto">
                    <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
            </main>
        </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="mb-8 max-w-3xl mx-auto">
          <h1 className="text-3xl font-headline font-bold">{t('editChat')}</h1>
          <p className="text-muted-foreground mt-2">{t('editChatDesc', { chatName: chat?.name || '' })}</p>
        </div>
        <div className="max-w-3xl mx-auto">
          <ChatForm chat={chat} />
        </div>
      </main>
    </div>
  );
}
