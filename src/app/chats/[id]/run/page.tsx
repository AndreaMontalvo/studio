import { ChatInterface } from "@/components/chat-interface";
import { getChatById } from "@/lib/actions";
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

  return <ChatInterface chatConfig={chat} />;
}
