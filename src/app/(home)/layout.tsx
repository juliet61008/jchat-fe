import LoginUserHead from "@/components/mem/LoginUserHead";
import { apiIsLogin } from "@/service/auth/apiAuthLogin";
import { getUser } from "@/utils/mem/userUtil";
import { Menu, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 서버에서 초기 유저 정보 파싱
  const initialUser = await getUser();
  const initialIsLogin = await apiIsLogin();

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white">
      {/* 헤더 - 모바일 네비게이션 */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          {/* 메뉴 아이콘 */}
          <button className="p-2 -ml-2">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          {/* 로그인상태 컴포넌트 */}
          <LoginUserHead
            initialUser={initialUser}
            initialIsLogin={initialIsLogin}
          />
          {/* 로고 */}
          <Link href="/">
            <Image
              src="/logo.png"
              alt="jChat"
              width={80}
              height={26}
              className="cursor-pointer"
            />
          </Link>
          {/* 프로필 아이콘 */}
          <button className="p-2 -mr-2">
            <User className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-y-auto scrollbar-hide">{children}</main>

      {/* 푸터 */}
      <footer className="border-t py-3 bg-gray-50 safe-bottom">
        <div className="text-center text-xs text-gray-500">© 2025 jChat</div>
      </footer>
    </div>
  );
}
