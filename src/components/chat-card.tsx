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
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { deleteChat, duplicateChat } from "@/lib/actions";

interface ChatCardProps {
  chat: ChatConfig;
  index: number;
}

export function ChatCard({ chat, index }: ChatCardProps) {
  const cardImages = PlaceHolderImages.filter(img => img.id.startsWith('card-'));
  const placeholderImage = cardImages.length > 0 ? cardImages[index % cardImages.length] : undefined;

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="font-headline truncate" title={chat.name}>{chat.name}</CardTitle>
            <CardDescription>
              Created on {new Date(chat.createdAt).toLocaleDateString()}
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
      <CardContent className="flex-grow">
        {placeholderImage && (
          <div className="aspect-[4/3] overflow-hidden rounded-lg">
            <Image
              src={placeholderImage.imageUrl}
              alt={placeholderImage.description}
              width={400}
              height={300}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              data-ai-hint={placeholderImage.imageHint}
            />
          </div>
        )}
      </CardContent>
      <CardFooter>
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
