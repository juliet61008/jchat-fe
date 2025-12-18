/**
 * other 유저 공통
 */
export interface IComOtherUser {
  userNo: number; // 친구 회원번호
  id: string; // 친구 아이디
  name: string; // 친구 이름
  aliasNm: string; // 친구 별칭
  birth: number; // 친구생일
  likeYn: "Y" | "N"; // 즐겨찾기 여부
  blockYn: "Y" | "N"; // 친구차단 여부
}

/**
 * 친구목록조회 RES DTO
 */
export interface ISearchFriendListResDto {
  myUserNo?: number;
  friendList: IComOtherUser[];
}
