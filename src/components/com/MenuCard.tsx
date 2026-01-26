'use client';

import { IComMenuListSearchResData } from '@/interface/com/interfaceComMenu';

interface Props {
  menu: IComMenuListSearchResData;
}

/**
 * 메뉴 카드
 * @returns
 */
const MenuCard = (props: Props) => {
  const { menu } = props;

  return (
    <div>
      <div className="flex">
        <div>순서 {menu.sortPath}</div>
        <div>아이디 {menu.menuId}</div>
        <div>이름 {menu.menuName}</div>
      </div>

      {menu.children &&
        menu.children.map((childMenu) => <MenuCard key={childMenu.menuId} menu={childMenu} />)}
    </div>
  );
};

export default MenuCard;
