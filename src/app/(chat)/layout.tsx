// app/(chat)/layout.tsx
'use client';

import BottomNav from '@/components/layout/BottomNav';
import { Menu, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* PC에서만 보이는 헤더 */}
      <div className="hidden md:block">
        <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white">
          <header className="sticky top-0 z-50 bg-white border-b">
            <div className="flex items-center justify-between px-4 py-3">
              <button className="p-2 -ml-2">
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              <Link href="/">
                <Image
                  src="/logo.png"
                  alt="jChat"
                  width={80}
                  height={26}
                  className="cursor-pointer"
                />
              </Link>
              <button className="p-2 -mr-2">
                <User className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto scrollbar-hide">{children}</main>
          <footer className="border-t py-3 bg-gray-50 safe-bottom">
            <div className="text-center text-xs text-gray-500">© 2025 jChat</div>
          </footer>
        </div>
      </div>

      {/* 모바일에서만 보이는 전체 화면 */}
      <div className="md:hidden">
        {children}
        <BottomNav />
      </div>
    </>
  );
}
