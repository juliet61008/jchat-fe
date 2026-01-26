import { IComMenuListSearchResData } from '@/interface/com/interfaceComMenu';
import { apiSearchComMenuList } from '@/service/com/apiComMenu';
import { getUser } from '@/utils/mem/userUtil';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IComMenuStore {
  data: IComMenuListSearchResData[];
  isLoading: boolean;
  hasLoaded: boolean;
  getData: (depth?: number[]) => Promise<IComMenuListSearchResData[]>;
  setData: (arr: IComMenuListSearchResData[]) => void;
  firstFetch: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useComMenuStore = create<IComMenuStore>()(
  persist(
    (set, get) => ({
      data: [],
      isLoading: false,
      hasLoaded: false,

      getData: async (depth?: number[]) => {
        const user = await getUser();
        const { data: menus } = get();
        const menuArr: IComMenuListSearchResData[] = [];

        const roleIds: number[] = user?.roleIdList?.split('|').map((id) => parseInt(id, 10)) ?? [];

        if (!user || roleIds.length === 0) {
          roleIds.push(1);
        }

        if (!menus) return [];

        const menuIdSet: Set<number> = new Set<number>();

        roleIds.forEach((roleId) => {
          menus.forEach((menuObj) => {
            if (menuObj.roleId === roleId) {
              menuIdSet.add(menuObj.menuId);
            }
          });
        });

        for (const menuId of menuIdSet) {
          const menu = menus.find((obj) => obj.menuId === menuId);
          if (menu) {
            menuArr.push(menu);
          }
        }

        if (depth) {
          return buildMenuTree(menuArr.filter((obj) => depth.includes(obj.menuDepth)));
        }

        return buildMenuTree(menuArr);
      },

      setData: (arr) => set({ data: arr }),

      firstFetch: async () => {
        const { isLoading, hasLoaded } = get();

        if (isLoading || hasLoaded) {
          return;
        }

        try {
          set({ isLoading: true });

          const res = await apiSearchComMenuList();

          if (res.code === 0) {
            set({ data: res.data, isLoading: false, hasLoaded: true });
          } else {
            set({ isLoading: false, hasLoaded: false });
          }
        } catch {
          set({ isLoading: false, hasLoaded: false });
        }
      },

      refreshData: async () => {
        const { isLoading } = get();
        if (isLoading) return;

        try {
          set({ isLoading: true, hasLoaded: false });
          const res = await apiSearchComMenuList();

          if (res.code === 0) {
            set({ data: res.data, isLoading: false, hasLoaded: true });
          } else {
            set({ isLoading: false, hasLoaded: false });
          }
        } catch (error) {
          console.error(error);
          set({ isLoading: false, hasLoaded: false });
        }
      },
    }),
    {
      name: 'com-menu-storage', // localStorage 키
      partialize: (state) => ({
        // isLoading은 제외하고 저장
        data: state.data,
        hasLoaded: state.hasLoaded,
      }),
    }
  )
);

/**
 * flat한 menu 배열 -> 계층형 트리로 전환
 * - parentMenuId 기준으로 계층 구성 (depth 무관)
 * - parentMenuId가 0이거나 부모를 찾을 수 없으면 루트로 처리
 */
const buildMenuTree = (menuArr: IComMenuListSearchResData[]): IComMenuListSearchResData[] => {
  if (!menuArr || menuArr.length === 0) return [];

  const menuMap = new Map<number, IComMenuListSearchResData>();

  // 1. Map 생성
  menuArr.forEach((menu) => {
    menuMap.set(menu.menuId, { ...menu, children: [] });
  });

  // 2. 부모-자식 관계 연결
  const rootMenus: IComMenuListSearchResData[] = [];

  menuMap.forEach((menu) => {
    // parentMenuId가 0이거나 없으면 루트
    if (!menu.parentMenuId || menu.parentMenuId === 0) {
      rootMenus.push(menu);
    } else {
      // 부모 찾기
      const parent = menuMap.get(menu.parentMenuId);

      if (parent && parent.children) {
        // 부모가 있으면 children에 추가
        parent.children.push(menu);
      } else {
        // 부모가 없으면 루트로 처리 (데이터 정합성 오류 대응)
        console.warn(
          `Parent menu (${menu.parentMenuId}) not found for menu (${menu.menuId}). Treating as root.`
        );
        rootMenus.push(menu);
      }
    }
  });

  // 3. menuOrder 기준 정렬 (재귀)
  const sortByOrder = (menus: IComMenuListSearchResData[]): IComMenuListSearchResData[] => {
    return menus
      .sort((a, b) => a.menuOrder - b.menuOrder)
      .map((menu) => ({
        ...menu,
        children: menu.children && menu.children.length > 0 ? sortByOrder(menu.children) : [],
      }));
  };

  return sortByOrder(rootMenus);
};
