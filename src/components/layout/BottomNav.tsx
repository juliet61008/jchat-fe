// components/layout/BottomNav.tsx
'use client';

import { cacheMenus, getMenus } from '@/lib/com/menu';
import { useQuery } from '@tanstack/react-query';
import { Menu, MessageSquare, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function BottomNav() {
  const pathname = usePathname();
  const tabs = [
    { href: '/mem/friend/list', icon: Users, label: '친구' },
    { href: '/chat/room', icon: MessageSquare, label: '채팅' },
    { href: '/com/menu', icon: Menu, label: '메뉴' },
  ];

  const { data: menus } = useQuery({
    queryKey: ['menus'],
    queryFn: async () => await cacheMenus(),
  });

  const { data: menuList } = useQuery({
    queryKey: ['BottomNavMenus'],
    queryFn: async () => {
      if (!menus) return;
      return await getMenus(menus, [1]);
    },
    enabled: !!menus,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    console.log('menuList', menuList);
  }, [menuList]);

  return (
    <>
      {menuList && menuList.length > 0 && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t safe-bottom">
          <div className="flex items-center justify-around h-16">
            {menuList.map((menu) => {
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
