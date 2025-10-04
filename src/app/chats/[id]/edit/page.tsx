import { Header } from "@/components/header";
import { ChatForm } from "@/components/chat-form";
import { getChatById } from "@/lib/actions";
import { notFound } from "next/navigation";

interface EditChatPageProps {
    params: {
        id: string;
    };
}

export default async function EditChatPage({ params }: EditChatPageProps) {
  const chat = await getChatById(params.id);

  if (!chat) {
    notFound();
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="mb-8 max-w-3xl mx-auto">
          <h1 className="text-3xl font-headline font-bold">Edit Chat</h1>
          <p className="text-muted-foreground mt-2">Editing configuration for "{chat.name}".</p>
        </div>
        <div className="max-w-3xl mx-auto">
          <ChatForm chat={chat} />
        </div>
      </main>
    </div>
  );
}
