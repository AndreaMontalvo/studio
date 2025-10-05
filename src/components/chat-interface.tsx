
'use client';

import {useState, useEffect, useRef, useTransition} from 'react';
import type {ChatConfig, ChatMessage} from '@/lib/types';
import {cn} from '@/lib/utils';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {Send, Home, ArrowLeft} from 'lucide-react';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import Link from 'next/link';
import { saveChatHistory } from '@/lib/actions';
import { simulatedResponses } from '@/lib/simulated-responses';
import { simulatedResponsesEs } from '@/lib/simulated-responses-es';
import { TypingAnimation } from './typing-animation';

const translations = {
  en: {
    conversationEnded: 'Conversation has ended.',
    returnToChatList: 'Return to Chat List',
  },
  es: {
    conversationEnded: 'La conversación ha terminado.',
    returnToChatList: 'Volver a la lista de chats',
  },
} as const;

interface ChatInterfaceProps {
  chatConfig: ChatConfig;
  initialHistory: ChatMessage[];
}

export function ChatInterface({
  chatConfig,
  initialHistory,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialHistory);
  const [userInput, setUserInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  const lang = chatConfig.language === 'es' ? 'es' : 'en';
  const t = translations[lang];

  useEffect(() => {
    // If there's no history and there's a welcome message, add it.
    if (initialHistory.length === 0 && chatConfig.welcomeMessage) {
      const welcomeMessage: ChatMessage = {
        id: 'initial-welcome',
        sender: 'bot',
        text: chatConfig.welcomeMessage,
      };
      setMessages([welcomeMessage]);
    }
  }, [chatConfig.welcomeMessage, initialHistory.length]);

  useEffect(() => {
    if (scrollAreaViewportRef.current) {
      scrollAreaViewportRef.current.scrollTop =
        scrollAreaViewportRef.current.scrollHeight;
    }
  }, [messages, isBotTyping]);

  const messagesSent = messages.filter(m => m.sender === 'user').length;
  const isChatEnded = messagesSent >= chatConfig.messageLimit;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = userInput.trim();
    if (!trimmedInput || isBotTyping || isChatEnded) return;

    const newUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: trimmedInput,
    };
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setUserInput('');
    saveChatHistory(chatConfig.id, newMessages);


    startTransition(async () => {
      setIsBotTyping(true);
      
      const responses = chatConfig.language === 'es' ? simulatedResponsesEs : simulatedResponses;
      const responseText = responses[Math.floor(Math.random() * responses.length)];

      const botResponse: ChatMessage = {
          id: crypto.randomUUID(),
          sender: 'bot',
          text: responseText,
      };
      
      // Ensure the waiting message is shown for at least 3 seconds.
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setIsBotTyping(false);

      if (botResponse) {
        const words = botResponse.text.split(/\s+/);
        const botMessageId = botResponse.id;

        setMessages(prev => [
          ...prev,
          {id: botMessageId, sender: 'bot', text: ''},
        ]);
        saveChatHistory(chatConfig.id, [...newMessages, botResponse]);


        let currentWordIndex = 0;
        const typeWord = () => {
          if (currentWordIndex < words.length) {
            const nextWord = words[currentWordIndex];
            setMessages(prev =>
              prev.map(msg =>
                msg.id === botMessageId
                  ? {...msg, text: msg.text ? `${msg.text} ${nextWord}` : nextWord}
                  : msg
              )
            );
            currentWordIndex++;
            setTimeout(typeWord, 50); 
          } else {
            // After typing is done, ensure the full message is set correctly
             setMessages(prev =>
                prev.map(msg =>
                  msg.id === botMessageId ? {...msg, text: botResponse.text} : msg
                )
              );

            const userMessagesCount = newMessages.filter(m => m.sender === 'user').length;
            if (userMessagesCount >= chatConfig.messageLimit) {
              const finalMessage = {id: crypto.randomUUID(), sender: 'bot' as const, text: chatConfig.finalMessage};
              setMessages(prev => [
                ...prev,
                finalMessage,
              ]);
              saveChatHistory(chatConfig.id, [...newMessages, botResponse, finalMessage]);
            }
          }
        };
        setTimeout(typeWord, 50);
      }
    });
  };

  return (
    <div className="flex flex-col h-full max-h-[90dvh] w-full max-w-2xl bg-card rounded-lg border shadow-2xl">
      <div className="p-4 border-b flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
            <Link href="/">
                <ArrowLeft />
                <span className="sr-only">Back to chat list</span>
            </Link>
        </Button>
        <Avatar>
          <AvatarFallback>
            {chatConfig.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-bold text-lg font-headline">{chatConfig.name}</h2>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <p className="text-sm text-muted-foreground">Online</p>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1" viewportRef={scrollAreaViewportRef}>
        <div className="p-4 space-y-6">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={cn(
                'flex items-end gap-2',
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.sender === 'bot' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>B</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-lg px-4 py-2 shadow-sm',
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p className="text-sm break-words whitespace-pre-wrap">
                  {msg.text}
                </p>
              </div>
              {msg.sender === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isBotTyping && (
            <div className="flex items-end gap-2 justify-start">
              <Avatar className="h-8 w-8">
                <AvatarFallback>B</AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg px-4 py-3 shadow-sm flex items-center gap-2">
                <p className="text-sm italic text-muted-foreground">{chatConfig.waitingMessage}</p>
                <TypingAnimation />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-background/50 rounded-b-lg">
        {isChatEnded ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="text-sm text-muted-foreground">
              {t.conversationEnded}
            </p>
            <Button asChild>
              <Link href="/">
                <Home className="mr-2" />
                {t.returnToChatList}
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSendMessage} className="flex items-start gap-2">
              <Textarea
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                placeholder={'Type your message...'}
                className="flex-1 resize-none"
                maxLength={chatConfig.characterLimit}
                disabled={isBotTyping || isPending}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                rows={1}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isBotTyping || isPending || !userInput.trim()}
              >
                <Send />
                <span className="sr-only">Send</span>
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2 text-right">
              {userInput.length} / {chatConfig.characterLimit} | Messages:{' '}
              {messagesSent} / {chatConfig.messageLimit}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
