import { IJwtPayLoad } from "@/interface/auth/interfaceJwt";
import { parseJwt } from "./../auth/jwtUtil";
export const getUser = async (): Promise<IJwtPayLoad> => {
  if (typeof window === "undefined") {
    // 서버 컴포넌트에서 실행
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    return parseJwt(
      cookieStore.get("accessToken")?.value as string
    ) as IJwtPayLoad;
  } else {
    // 클라이언트 컴포넌트에서 실행
    // HttpOnly는 못 읽으니 API 호출
    const res = await fetch("/api/auth/user");
    return res.json();
  }
};
