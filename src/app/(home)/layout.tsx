import Image from "next/image";
import Link from "next/link";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="main"
              width={120}
              height={40}
              className="cursor-pointer"
            />
          </Link>
        </div>
      </header>

      {/* 메인 */}
      <main className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* 사이드바 */}
          <aside className="w-64 hidden lg:block">
            {/* <SidebarProvider>
              <AppSidebar />
            </SidebarProvider> */}
          </aside>

          {/* 콘텐츠 영역 */}
          <div className="flex-1">{children}</div>
        </div>
      </main>

      {/* 푸터 (선택) */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
          © 2025 jChat. All rights reserved.
        </div>
      </footer>
    </>
  );
}
