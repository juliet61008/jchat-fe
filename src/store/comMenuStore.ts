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
          return menuArr.filter((obj) => depth.includes(obj.menuDepth));
        }

        return menuArr;
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
