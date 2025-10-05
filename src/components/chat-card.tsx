
"use client";

import type { ChatConfig } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Bot, Edit, Copy, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteChat, duplicateChat } from "@/lib/actions";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAppComponent } from "@/context/app-context";

interface ChatCardProps {
  chat: ChatConfig & { messageCount: number };
  index: number;
}

export function ChatCard({ chat, index }: ChatCardProps) {
  const { t } = useAppComponent();
  const isCompleted = chat.messageCount >= chat.messageLimit;
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleDuplicate = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", chat.id);
      const result = await duplicateChat(formData);
      if (result?.error) {
        toast({
          variant: "destructive",
          title: t('couldNotDuplicate'),
          description: result.error,
        });
      } else {
        toast({
          title: t('success'),
          description: t('successDuplicate', { chatName: chat.name }),
        });
      }
    });
  };

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 relative">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 overflow-hidden">
            <CardTitle className="font-headline truncate" title={chat.name}>{chat.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              {isCompleted ? (
                <Badge variant="secondary">{t('completed')}</Badge>
              ) : (
                <Badge>{t('inProgress')}</Badge>
              )}
               <span>{chat.messageCount} / {chat.messageLimit} msgs</span>
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="-mr-2 -mt-2 shrink-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/chats/${chat.id}/edit`}>
                  <Edit className="mr-2" />
                  <span>{t('edit')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  handleDuplicate();
                }}
                disabled={isPending}
              >
                <Copy className="mr-2" />
                <span>{isPending ? t('duplicating') : t('duplicate')}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="mr-2" />
                      <span>{t('delete')}</span>
                    </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('confirmDeleteDesc')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        const formData = new FormData();
                        formData.append("id", chat.id);
                        deleteChat(formData);
                      }}
                      variant="destructive"
                    >
                      {t('delete')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pb-20">
        <p className="text-sm text-muted-foreground line-clamp-3">{chat.persistentPrompt}</p>
      </CardContent>
      <CardFooter className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-card to-transparent">
        <Button asChild className="w-full">
          <Link href={`/chats/${chat.id}/run`} target="_blank" rel="noopener noreferrer">
            <Bot className="mr-2" />
            {t('runChat')}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
