import { IApiResponse } from '@/interface/common/interfaceApiResponse';

// 공통 메뉴 RES DATA
export interface IComMenuListSearchResData {
  roleId: number; // 롤권한 아이디
  menuId: number; // 메뉴 아이디
  parentMenuId: number; // 부모 메뉴 아이디
  menuCd: string; // 메뉴 코드 01:폴더/02:파일
  menuName: string; // 메뉴 이름
  menuUrl: string; // 메뉴 URL
  menuOrder: number; // 메뉴 순서
  menuDepth: number; // 메뉴 뎁스
  menuDesc: string; // 메뉴 설명
  sortPath: string; // 소팅
}

// 공통 메뉴 RES DTO
export type TComMenuListSearchResDto = IApiResponse<IComMenuListSearchResData[]>;
