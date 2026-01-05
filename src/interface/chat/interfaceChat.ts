/**
 * 채팅 인터페이스
 */

import { IApiResponse } from "@/interface/common/interfaceApiResponse";

/**
 * 채팅방 조회 REQ DTO
 */
export interface ISearchChatRoomResData {
  roomId: number; // 채팅방번호
  chatRoom: IChatRoom; // 채팅방 기본 정보
  chatRoomUserList: IChatRoomUser[]; // 채팅방 유저 DTO
  chatRoomMsgList: IChatRoomMsg[]; // 채팅방 메세지 DTO
}

export type TSearchChatRoomResDto = IApiResponse<ISearchChatRoomResData>;

/**
 * 채팅방 기본 정보 REQ DTO
 */
export interface IChatRoom {
  roomId: number; // 채팅방 번호
  roomName: string; // 채팅방 이름
  delYn: "Y" | "N"; // 삭제 여부
  roomCd: string; // ??
}
/**
 * 채팅방 유저 DTO
 */
export interface IChatRoomUser {
  userNo: number; // 회원번호
  name: string; // 회원이름
  friendYn: "Y" | "N"; // 친구여부
  mineYn: "Y" | "N"; // 내정보여부
}

/**
 * 채팅방 메세지 DTO
 */
export interface IChatRoomMsg {
  roomId: number; // 채팅방번호
  msgId: number | string; // 메세지번호 > 낙관적업데이트 위한 임시번호(문자열) string 타입 추가
  sndUserNo: number; // 발신자 회원번호
  sndName: string; // 발신자 성함
  msgTypCd: string; // 코드
  msgContent: string; // 메세지 내용
  mineYn: "Y" | "N"; // 내정보여부
  delYn: "Y" | "N"; // 삭제여부
  createTm: string; // 생성시간
}

/**
 * 채팅 전송 REQ DTO
 */
export interface ISendMsgReqDto {
  tempId: string;
  roomId: number;
  roomName: string;
  msgContent: string;
}

/**
 * 채팅 전송 RES DTO
 */
export interface ISendMsgResDto {
  tempId: string; // 임시번호
  roomId: number;
  chatRoomMsg: IChatRoomMsg;
}
