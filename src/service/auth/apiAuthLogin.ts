import {
  IAuthLoginReqDto,
  TAuthLoginResDto,
} from "@/interface/auth/interfaceAuthLogin";

/**
 * 로그인 인증을 요청한다
 * @param {IAuthLoginReqDto} params 로그인 인증 요청 DTO
 * @returns {Promise<TAuthLoginResDto>} 로그인 인증 요청 결과
 */
export const getAuthLogin = async (
  params: IAuthLoginReqDto
): Promise<TAuthLoginResDto> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_JCHAT_API_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(params),
    }
  );

  return res.json();
};
