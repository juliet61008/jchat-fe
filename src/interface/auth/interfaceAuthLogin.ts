// 로그인 인증 요청 DTO
export interface IAuthLoginReqDto {
  id: string; // 아이디
  password: string; // 패스워드
}

// 로그인 인증 응답 DTO
export interface IAuthLoginResDto {
  id: string; // 아이디
  name: string; // 이름
  birth: number; // 생년월일
}
