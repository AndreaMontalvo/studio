import Link from 'next/link';
import { Bot } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-headline text-xl font-bold">
          <Bot className="h-7 w-7 text-primary" />
          <span>ChatForge</span>
        </Link>
      </div>
    </header>
  );
}
