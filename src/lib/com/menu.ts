import { apiSearchComMenuList } from '@/service/com/apiComMenu';
import { getUser } from '@/utils/mem/userUtil';

let menuCache: any;

/**
 * 메뉴 호출
 * @returns
 */
const cacheMenus = async () => {
  if (menuCache) {
    return menuCache;
  }

  const res = await apiSearchComMenuList();

  if (res.code === 0) {
    menuCache = res.data;

    return res.data;
  }

  return null;
};

/**
 * getter
 */
export const getMenus = async (depth?: number[]) => {
  const user = await getUser();

  // 유저 롤권한 목록
  const roleIds: string[] = user.roleIdList.split('|');

  // 유저정보 없거나 roleIds 비어있는 경우
  if (!user || roleIds.length === 0) {
    roleIds.push('1');
  }

  // 전체롤권한별 메뉴리스트 조회
  const comMenuListRes = await apiSearchComMenuList();

  // 메뉴 정상 응답 X
  if (comMenuListRes.code !== 0) throw new Error('Failed To Generate MenuList');

  // 메뉴리스트 데이터
  const comMenuListData = comMenuListRes.data;

  // 메뉴 아이디 셋 (중복제거)
  const menuIdSet: Set<number> = new Set<number>();

  // 롤 권한 기준 반복
  roleIds.forEach((obj, idx) => {
    const roleId = roleIds[idx];
    // TODO 개발중
    // comMenuListData.forEach(menuObj => {
    //   if (menuObj.roleId === roleId) {

    //   }

    // })
  });
};

/**
 * 캐시 refresh
 */
export const refreshMenus = async () => {
  menuCache = null;
};
