'use client';

import MenuCard from '@/components/com/MenuCard';
import Loading from '@/components/common/Loading';
import { IComMenuListSearchResData } from '@/interface/com/interfaceComMenu';
import { IApiResponse } from '@/interface/common/interfaceApiResponse';
import { apiIsLogin } from '@/service/auth/apiAuthLogin';
import { useComMenuStore } from '@/store/comMenuStore';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * 메뉴리스트 클라이언트 컴포넌트
 */

const MenuList = () => {
  const [menus, setMenus] = useState<IComMenuListSearchResData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { getData } = useComMenuStore();

  const router = useRouter();

  const { data: isLogin } = useQuery<IApiResponse<boolean>, Error, boolean>({
    queryKey: ['isLogin'],
    queryFn: apiIsLogin,
    select: (res) => {
      if (res.code !== 0) return false;
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5분
    refetchOnMount: 'always', // 컴포넌트 마운트 시 항상 재조회
    refetchOnWindowFocus: true, // 탭 전환시 조회
  });

  const handleLogoutBtnClick = () => {
    router.replace('/mem/logout');
  };

  const handleLoginBtnClick = () => {
    router.replace('/mem/login');
  };

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
      <div className="h-full flex flex-col bg-background">
        {/* 헤더 */}
        <div className="flex-shrink-0 border-b bg-card">
          <div className="px-5 py-4">
            <h1 className="text-xl font-bold">메뉴</h1>
          </div>
        </div>

        {/* 메뉴 리스트 - 로그아웃 버튼(약 52px) + BottomNav(64px) 높이만큼 pb 확보 */}
        <div className="flex-1 overflow-y-auto pb-32">
          {menus.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">등록된 메뉴가 없습니다</div>
          ) : (
            menus.map((menu) => <MenuCard key={menu.menuId} menu={menu} />)
          )}
        </div>

        {/* 로그아웃 버튼 - BottomNav(bottom-16=64px) 바로 위에 fixed 고정 */}
        <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto border-t bg-card px-5 py-3 flex justify-end">
          {isLogin ? (
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
              onClick={handleLogoutBtnClick}
            >
              로그아웃
            </button>
          ) : (
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
              onClick={handleLoginBtnClick}
            >
              로그인
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default MenuList;
