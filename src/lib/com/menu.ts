import { IComMenuListSearchResData } from '@/interface/com/interfaceComMenu';
import { apiSearchComMenuList } from '@/service/com/apiComMenu';
import { getUser } from '@/utils/mem/userUtil';

let menuCache: IComMenuListSearchResData[] | null = null;

/**
 * 메뉴 호출
 * @returns
 */
export const cacheMenus = async () => {
  if (menuCache) {
    return menuCache;
  }

  const res = await apiSearchComMenuList();

  if (res.code === 0) {
    menuCache = res.data;
    return res.data;
  }

  menuCache = null;
  return null;
};

/**
 * getter
 */
export const getMenus = async (
  menus: IComMenuListSearchResData[],
  depth?: number[]
): Promise<IComMenuListSearchResData[]> => {
  const user = await getUser();

  const menuArr: IComMenuListSearchResData[] = [];

  // 유저 롤권한 목록
  const roleIds: number[] = user?.roleIdList?.split('|').map((id) => parseInt(id, 10)) ?? [];

  // 유저정보 없거나 roleIds 비어있는 경우
  if (!user || roleIds.length === 0) {
    // 비회원 롤 삽입
    roleIds.push(1);
  }

  if (!menus) return [];

  // 메뉴 아이디 셋 (중복제거)
  const menuIdSet: Set<number> = new Set<number>();

  // 롤 권한 기준 반복
  roleIds.forEach((obj, idx) => {
    const roleId = roleIds[idx];

    // 메뉴 리스트 기준 반복
    menus.forEach((menuObj) => {
      if (menuObj.roleId === roleId) {
        menuIdSet.add(menuObj.menuId);
      }
    });
  });
  for (const menuId of menuIdSet) {
    const menu: IComMenuListSearchResData = menus.find((obj) => obj.menuId === menuId)!;
    if (menu) {
      menuArr.push(menu);
      menuIdSet.delete(menuId);
    }
  }
  // 뎁스설정한 경우
  if (depth) {
    return menuArr.filter((obj) => depth.includes(obj.menuDepth));
  }

  return menuArr;
};

/**
 * 캐시 refresh
 */
export const refreshMenus = async () => {
  menuCache = null;
};
