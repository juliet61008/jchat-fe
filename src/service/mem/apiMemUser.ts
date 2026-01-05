import {
  IRegisterUserReqDto,
  TRegisterUserResDto,
} from "@/interface/mem/interfaceMemUser";

/**
 * 회원가입을 요청한다
 * @param {IRegisterUserReqDto} params 회원가입 요청 DTO
 * @returns {Promise<TRegisterUserResDto>} 회원가입 응답
 */
export const registerUser = async (
  params: IRegisterUserReqDto
): Promise<TRegisterUserResDto> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_JCHAT_API_URL}/mem/user/registerUser`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    }
  );

  return res.json();
};
