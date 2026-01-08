import { IApiResponse } from "@/interface/common/interfaceApiResponse";

// 토큰 DTO
export interface ITokenDto {
  accessToken: string; // accessToken
  refreshToken: string; // refreshToken
}

// 유저정보 DTO
export interface IUserInfoDto {
  userNo: number; // 유저번호
  id: string; // 아이디
  name: string; // 이름
  birth: number; // 생년월일
  email: string; // 이메일
}

// 로그인 인증 요청 DTO
export interface IAuthLoginReqDto {
  id: string; // 아이디
  password: string; // 패스워드
}

// 로그인 인증 응답 Data
export interface IAuthLoginResDtoData extends ITokenDto {
  userInfoDto: IUserInfoDto; // 유저정보DTO
}

// 로그인 인증 응답 DTO
export type TAuthLoginResDto = IApiResponse<IAuthLoginResDtoData>;
