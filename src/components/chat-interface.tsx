
"use client";

import { useState, useEffect, useRef } from "react";
import type { ChatConfig } from "@/lib/types";
import { simulatedResponses } from "@/lib/simulated-responses";
import { simulatedResponsesEs } from "@/lib/simulated-responses-es";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TypingAnimation } from "./typing-animation";

interface ChatMessage {
    id: string;
    sender: "user" | "bot";
    text: string;
}

export function ChatInterface({ chatConfig }: { chatConfig: ChatConfig }) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState("");
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [messagesSent, setMessagesSent] = useState(0);
    const scrollAreaViewportRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (chatConfig.welcomeMessage) {
            setMessages([{ id: 'initial-welcome', sender: "bot", text: chatConfig.welcomeMessage }]);
        }
    }, [chatConfig.welcomeMessage]);

    useEffect(() => {
        if (scrollAreaViewportRef.current) {
            scrollAreaViewportRef.current.scrollTop = scrollAreaViewportRef.current.scrollHeight;
        }
    }, [messages, isBotTyping]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = userInput.trim();
        if (!trimmedInput || isBotTyping || messagesSent >= chatConfig.messageLimit) return;

        const newUserMessage: ChatMessage = { id: crypto.randomUUID(), sender: "user", text: trimmedInput };
        setMessages((prev) => [...prev, newUserMessage]);
        setUserInput("");
        const newMessagesSent = messagesSent + 1;
        setMessagesSent(newMessagesSent);
        
        setIsBotTyping(true);

        const finalMessage = chatConfig.finalMessage;
        const messageLimit = chatConfig.messageLimit;

        // Show "thinking" indicator
        setTimeout(() => {
            if (newMessagesSent >= messageLimit) {
                // If message limit is reached, show final message
                setIsBotTyping(false);
                setMessages((prev) => [...prev, { id: crypto.randomUUID(), sender: "bot", text: finalMessage }]);
                return;
            }

            const responses = chatConfig.language === 'es' ? simulatedResponsesEs : simulatedResponses;
            const botResponseText = responses[Math.floor(Math.random() * responses.length)];
            const words = botResponseText.split(/\s+/);
            const botMessageId = crypto.randomUUID();

            // Add an empty message for the bot to start typing into
            setMessages((prev) => [...prev, { id: botMessageId, sender: "bot", text: "" }]);
            setIsBotTyping(false);
            
            let currentWordIndex = 0;
            
            function typeWord() {
                if (currentWordIndex < words.length) {
                    const nextWord = words[currentWordIndex];
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === botMessageId
                                ? { ...msg, text: msg.text ? `${msg.text} ${nextWord}` : nextWord }
                                : msg
                        )
                    );
                    currentWordIndex++;
                    typingTimeoutRef.current = setTimeout(typeWord, chatConfig.animationSpeed);
                }
            }
            
            typeWord();

        }, 1000); // Initial "thinking" delay
    };

    const isChatEnded = messagesSent >= chatConfig.messageLimit;

    return (
        <div className="flex flex-col h-full max-h-[90dvh] w-full max-w-2xl bg-card rounded-lg border shadow-2xl">
            <div className="p-4 border-b flex items-center gap-4">
                <Avatar>
                    <AvatarFallback>{chatConfig.name.charAt(0).toUpperCase()}</AvatarFallback>
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
                    {messages.map((msg, index) => (
                        <div key={msg.id} className={cn("flex items-end gap-2", msg.sender === 'user' ? 'justify-end' : 'justify-start')}>
                            {msg.sender === 'bot' && <Avatar className="h-8 w-8"><AvatarFallback>B</AvatarFallback></Avatar>}
                            <div className={cn("max-w-[80%] rounded-lg px-4 py-2 shadow-sm", msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                <p className="text-sm break-words whitespace-pre-wrap">{msg.text}</p>
                            </div>
                            {msg.sender === 'user' && <Avatar className="h-8 w-8"><AvatarFallback>U</AvatarFallback></Avatar>}
                        </div>
                    ))}
                    {isBotTyping && (
                         <div className="flex items-end gap-2 justify-start">
                            <Avatar className="h-8 w-8"><AvatarFallback>B</AvatarFallback></Avatar>
                            <div className="bg-muted rounded-lg px-4 py-3 shadow-sm">
                                <TypingAnimation />
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
            <div className="p-4 border-t bg-background/50 rounded-b-lg">
                <form onSubmit={handleSendMessage} className="flex items-start gap-2">
                    <Textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={isChatEnded ? "Conversation has ended." : "Type your message..."}
                        className="flex-1 resize-none"
                        maxLength={chatConfig.characterLimit}
                        disabled={isBotTyping || isChatEnded}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                        rows={1}
                    />
                    <Button type="submit" size="icon" disabled={isBotTyping || isChatEnded || !userInput.trim()}>
                        <Send />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-2 text-right">
                    {userInput.length} / {chatConfig.characterLimit} | Messages: {messagesSent} / {chatConfig.messageLimit}
                </p>
            </div>
        </div>
    );
}
