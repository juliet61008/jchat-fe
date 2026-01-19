import { IApiResponse } from '@/interface/common/interfaceApiResponse';

/**
 * other 유저 공통
 */
export interface IComOtherUser {
  userNo: number; // 친구 회원번호
  id: string; // 친구 아이디
  name: string; // 친구 이름
  aliasNm: string; // 친구 별칭
  birth: number; // 친구생일
  friendYn: 'Y' | 'N'; // 친구여부
  likeYn: 'Y' | 'N'; // 즐겨찾기 여부
  blockYn: 'Y' | 'N'; // 친구차단 여부
  progileImgUrl: string; // 대표프로필이미지
}

/**
 * 친구목록조회 RES DATA
 */
export interface ISearchFriendResData {
  myUserNo?: number;
  friendList: IComOtherUser[];
}

/**
 * 친구목록조회 RES DTO
 */
export type TSearchFriendResDto = IApiResponse<ISearchFriendResData>;

/**
 * 친구추가 요청 DTO
 */
export interface IMergeFriendReqDto {
  relationUserNo: number; // 친구관계번호
  likeYn?: 'Y' | 'N'; // 즐겨찾기여부
  blockYn?: 'Y' | 'N'; // 차단여부
  aliasNm?: string; // 별칭
}

/**
 * 유저관계변경 응답 DTO Data
 */
export interface IMergeFriendResData {
  succYn: 'Y' | 'N'; // 성공여부
}

/**
 * 유저관계변경 응답 DTO Data
 */
export type TMergeFriendResDto = IApiResponse<IMergeFriendResData>;
