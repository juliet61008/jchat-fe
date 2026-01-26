'use client';

import MenuCard from '@/components/com/MenuCard';
import { IComMenuListSearchResData } from '@/interface/com/interfaceComMenu';
import { useComMenuStore } from '@/store/comMenuStore';
import { useEffect, useState } from 'react';

/**
 * 메뉴리스트 클라이언트 컴포넌트
 */

const MenuList = () => {
  const [menus, setMenus] = useState<IComMenuListSearchResData[]>([]);

  const { getData } = useComMenuStore();

  useEffect(() => {
    const process = async () => {
      const res = await getData([2, 3]);
      setMenus(res);
    };

    process();
  }, []);

  return (
    menus && (
      <div className="justify-center min-h-sreen">
        {menus.map((menu) => (
          <MenuCard key={menu.menuId} menu={menu} />
        ))}
      </div>
    )
  );
};

export default MenuList;
