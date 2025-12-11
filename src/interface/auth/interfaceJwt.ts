// jwt 페이로드
export interface IJwtPayLoad {
  id: string;
  name: string;
  email: string;
  birth: number;
  exp: number;
  iat: number;
  sub: string;
}
