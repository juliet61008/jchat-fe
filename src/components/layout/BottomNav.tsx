// components/layout/BottomNav.tsx
'use client';

import { useMenu } from '@/hooks/com/useMenu';
import { IComMenuListSearchResData } from '@/interface/com/interfaceComMenu';
import { Menu, MessageSquare, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BottomNav() {
  const pathname = usePathname();

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
      {menus && menus.length > 0 && (
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
