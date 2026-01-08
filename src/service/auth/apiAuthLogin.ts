import {
  IAuthLoginReqDto,
  TAuthLoginResDto,
} from "@/interface/auth/interfaceAuthLogin";
import { api } from "@/lib/fetchExtended";
import { IApiResponse } from "./../../interface/common/interfaceApiResponse";

/**
 * 로그인 인증을 요청한다
 * @param {IAuthLoginReqDto} params 로그인 인증 요청 DTO
 * @returns {Promise<TAuthLoginResDto>} 로그인 인증 요청 결과
 */
export const getAuthLogin = async (
  params: IAuthLoginReqDto
): Promise<TAuthLoginResDto> => {
  const res = await api.post(
    `${process.env.NEXT_PUBLIC_JCHAT_API_URL}/auth/login`,
    params
  );

  return res.json();
};

/**
 * 로그인여부체크
 * @returns {Promise<IApiResponse<boolean>>} 0: 로그인 -1: 비로그인
 */
export const apiIsLogin = async (): Promise<IApiResponse<boolean>> => {
  const res = await api.get(
    `${process.env.NEXT_PUBLIC_JCHAT_API_URL}/auth/isLogin`
  );

  return res.json();
};
