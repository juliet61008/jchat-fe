'use client';

import { IComMenuListSearchResData } from '@/interface/com/interfaceComMenu';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  menu: IComMenuListSearchResData;
  isLast?: boolean;
}

const MenuCard = (props: Props) => {
  const { menu, isLast = false } = props;
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = menu.children && menu.children.length > 0;
  const router = useRouter();

  const isFolder = menu.menuCd === '01';
  const isUrl = menu.menuCd === '02';

  const handleClick = () => {
    if (isFolder) {
      setIsExpanded(!isExpanded);
      return;
    }
    if (isUrl && menu.menuUrl) {
      router.push(menu.menuUrl);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        className="flex items-center justify-between px-5 py-4 hover:bg-muted/40 active:bg-muted/60 transition-colors cursor-pointer"
        style={{
          paddingLeft: `${20 + (menu.menuDepth - 1) * 20}px`,
        }}
      >
        <span
          className={`
            ${menu.menuDepth === 1 ? 'font-semibold' : 'font-medium'}
            ${menu.menuDepth === 3 ? 'text-muted-foreground text-sm' : ''}
          `}
        >
          {menu.menuName}
        </span>

        {isFolder && hasChildren && (
          <ChevronDown
            size={16}
            className={`text-muted-foreground transition-transform duration-200 ${
              isExpanded ? '' : '-rotate-90'
            }`}
          />
        )}
      </div>

      {hasChildren && isExpanded && (
        <>
          {menu.children!.map((childMenu, index) => (
            <MenuCard
              key={childMenu.menuId}
              menu={childMenu}
              isLast={index === menu.children!.length - 1}
            />
          ))}
        </>
      )}

      {/* 1뎁스만 구분선 */}
      {menu.menuDepth === 2 && !isLast && <div className="h-px bg-border mx-5" />}
    </>
  );
};

export default MenuCard;
