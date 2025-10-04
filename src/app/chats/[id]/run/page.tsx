import { ChatInterface } from "@/components/chat-interface";
import { getChatById, getChatHistory } from "@/lib/actions";
import { notFound } from "next/navigation";

interface RunChatPageProps {
    params: {
        id: string;
    };
}

export default async function RunChatPage({ params }: RunChatPageProps) {
  const chat = await getChatById(params.id);

  if (!chat) {
    notFound();
  }

  const initialHistory = await getChatHistory(params.id);

  return <ChatInterface chatConfig={chat} initialHistory={initialHistory} />;
}
