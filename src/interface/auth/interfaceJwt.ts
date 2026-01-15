// jwt 페이로드
export interface IJwtPayLoad {
  userNo: number;
  id: string;
  name: string;
  email: string;
  birth: number;
  exp: number;
  iat: number;
  sub: number;
}

/**
 * checkAuth 서버액션 응답
 */
export interface ICheckAuthRes {
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  accessToken: string | null;
  refreshToken: string | null;
}
