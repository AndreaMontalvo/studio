import { getChats } from "@/lib/actions";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ChatCard } from "@/components/chat-card";
import { Card, CardContent } from "@/components/ui/card";
import { TumbleweedIcon } from "@/components/tumbleweed-icon";

export default async function Home() {
  const chats = await getChats();

  return (
    <div className="flex flex-col w-full">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-headline font-bold">My Chats</h1>
          <Button asChild>
            <Link href="/chats/new">
              <Plus className="mr-2" />
              Create New Chat
            </Link>
          </Button>
        </div>

        {chats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {chats.map((chat, index) => (
              <ChatCard key={chat.id} chat={chat} index={index} />
            ))}
          </div>
        ) : (
          <Card className="w-full border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <TumbleweedIcon className="w-24 h-24 text-muted-foreground mb-6" />
              <h2 className="text-2xl font-headline font-semibold mb-2">No Chats Found</h2>
              <p className="text-muted-foreground mb-6">Get started by creating your first chat configuration.</p>
              <Button asChild size="lg">
                <Link href="/chats/new">
                  <Plus className="mr-2" />
                  Create Your First Chat
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
