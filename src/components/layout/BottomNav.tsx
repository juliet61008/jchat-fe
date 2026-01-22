// components/layout/BottomNav.tsx
'use client';

import { useMenu } from '@/hooks/com/useMenu';
import { IComMenuListSearchResData } from '@/interface/com/interfaceComMenu';
import { Menu, MessageSquare, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// 바텀 네비게이션 안보여줄 패스
const NO_SHOW_PATH_ARR = ['/chat/room/#{roomId}'];

export default function BottomNav() {
  const pathname = usePathname();

  /**
   * #{변수명} 을 정규식 그룹으로 변환
   */
  const isPathMatch = (currentPath: string, pattern: string): boolean => {
    const regexPattern = pattern
      .replace(/\//g, '\\/') // / 이스케이프
      .replace(/#\{[^}]+\}/g, '[^/]+'); // #{변수명} -> 임의 문자열

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(currentPath);
  };

  // 패스 정규식 검사 후 바텀네비게이션 show 여부
  const isShow = !NO_SHOW_PATH_ARR.some((path) => isPathMatch(pathname, path));

  const [menus, setMenus] = useState<IComMenuListSearchResData[]>([]);

  const menusHook = useMenu();

  useEffect(() => {
    const getMenus = async () => {
      const tmpMenus = await menusHook.getMenus([1]);

      if (tmpMenus) {
        setMenus(tmpMenus);
      }
    };
    getMenus();
  }, [menusHook]);

  return (
    <>
      {isShow && menus && menus.length > 0 && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t safe-bottom">
          <div className="flex items-center justify-around h-16">
            {menus.map((menu) => {
              const isActive = pathname.startsWith(menu.menuUrl);
              return (
                <Link
                  key={menu.menuId}
                  href={menu.menuUrl}
                  className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                    isActive ? 'text-primary' : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  {menu.menuId === 100100100 ? (
                    <>
                      <Menu className="w-6 h-6" />
                    </>
                  ) : menu.menuId === 200100100 ? (
                    <>
                      <Users className="w-6 h-6" />
                    </>
                  ) : (
                    menu.menuId === 300100100 && (
                      <>
                        <MessageSquare className="w-6 h-6" />
                      </>
                    )
                  )}
                  {/* <Icon className="w-6 h-6" /> */}
                  <span className="text-xs font-medium">{menu.menuName}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}
