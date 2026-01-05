import { IApiResponse } from "@/interface/common/interfaceApiResponse";

/**
 * 회원가입 요청 DTO
 */
export interface IRegisterUserReqDto {
  id: string; // 아이디
  password: string; // 비밀번호
  name: string; // 이름
  birth: number | undefined; // 생년월일
  emailId: string; // 이메일아이디
  emailDomain: string; //
}

/**
 * 회원가입 응답 DATA
 */
export interface IRegisterUserResData {
  id: string; // 아이디
  succYn: "Y" | "N"; // 성공여부
}

/**
 * 회원가입 응답 DTO
 */
export type TRegisterUserResDto = IApiResponse<IRegisterUserResData>;
