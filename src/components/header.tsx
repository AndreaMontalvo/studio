
'use client';

import Link from 'next/link';
import { Bot, Settings } from 'lucide-react';
import { useAppComponent } from '@/context/app-context';
import { SettingsPanel } from './settings-panel';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from './ui/button';


export function Header() {
  const { appName } = useAppComponent();
  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-headline text-xl font-bold">
          <Bot className="h-7 w-7 text-primary" />
          <span>{appName}</span>
        </Link>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SettingsPanel />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
