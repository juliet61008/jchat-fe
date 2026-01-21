import { IJwtPayLoad } from '@/interface/auth/interfaceJwt';

const toNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

export const parseJwt = (token: string): IJwtPayLoad | null => {
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    let decoded: any;

    if (typeof window === 'undefined') {
      decoded = JSON.parse(Buffer.from(base64, 'base64').toString());
    } else {
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      decoded = JSON.parse(jsonPayload);
    }

    return {
      userNo: toNumber(decoded.sub),
      id: String(decoded.id),
      name: String(decoded.name || ''),
      email: String(decoded.email || ''),
      birth: toNumber(decoded.birth ?? ''),
      roleIdList: String(decoded.roleIdList || ''),
      exp: toNumber(decoded.exp),
      iat: toNumber(decoded.iat),
      sub: toNumber(decoded.sub),
    } as IJwtPayLoad;
  } catch (e) {
    console.error('JWT 파싱 에러:', e);
    return null;
  }
};
