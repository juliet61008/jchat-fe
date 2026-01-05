import { IApiResponse } from "@/interface/common/interfaceApiResponse";

// 공통 메뉴 RES DATA
export interface IComMenuListSearchResData {
  id: number; // 아이디
  parentId: number; // 부모 아이디
  menuName: string; // 메뉴 이름
  menuUrl: number; // 메뉴 URL
  menuOrder: string; // 메뉴 순서
  depth: string; // 뎁스
  description: string; // 메뉴 설명
  useYn: string; // 사용여부
}

// 공통 메뉴 RES DTO
export type TComMenuListSearchResDto = IApiResponse<IComMenuListSearchResData>;
