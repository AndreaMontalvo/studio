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

interface ChatCardProps {
  chat: ChatConfig & { messageCount: number };
  index: number;
}

export function ChatCard({ chat, index }: ChatCardProps) {
  const isCompleted = chat.messageCount >= chat.messageLimit;

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 relative">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 overflow-hidden">
            <CardTitle className="font-headline truncate" title={chat.name}>{chat.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              {isCompleted ? (
                <Badge variant="secondary">Completed</Badge>
              ) : (
                <Badge>In Progress</Badge>
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
                  <span>Edit</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  const formData = new FormData();
                  formData.append("id", chat.id);
                  duplicateChat(formData);
                }}
              >
                <Copy className="mr-2" />
                <span>Duplicate</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="mr-2" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your chat configuration.
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
                      Delete
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
            Run Chat
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
