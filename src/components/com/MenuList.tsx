'use client';

import MenuCard from '@/components/com/MenuCard';
import Loading from '@/components/common/Loading';
import { IComMenuListSearchResData } from '@/interface/com/interfaceComMenu';
import { useComMenuStore } from '@/store/comMenuStore';
import { useEffect, useState } from 'react';

/**
 * 메뉴리스트 클라이언트 컴포넌트
 */

const MenuList = () => {
  const [menus, setMenus] = useState<IComMenuListSearchResData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { getData } = useComMenuStore();

  useEffect(() => {
    let isMounted = true; // cleanup을 위한 flag

    const fetchMenus = async () => {
      try {
        const res = await getData([2, 3]);

        // 컴포넌트가 unmount되지 않았을 때만 상태 업데이트
        if (isMounted) {
          setMenus(res);
        }
      } catch (error) {
        console.error('메뉴 조회 실패:', error);
        if (isMounted) {
          // 에러 상태 처리
          setMenus([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMenus();

    // cleanup
    return () => {
      isMounted = false;
    };
  }, [getData]);

  return (
    <>
      <Loading isLoading={isLoading} />
      <div className="h-screen flex flex-col bg-background">
        {/* 헤더 */}
        <div className="flex-shrink-0 border-b bg-card">
          <div className="px-5 py-4">
            <h1 className="text-xl font-bold">메뉴</h1>
          </div>
        </div>

        {/* 메뉴 리스트 */}
        <div className="flex-1 overflow-y-auto">
          {menus.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">등록된 메뉴가 없습니다</div>
          ) : (
            menus.map((menu) => <MenuCard key={menu.menuId} menu={menu} />)
          )}
        </div>
      </div>
    </>
  );
};

export default MenuList;
