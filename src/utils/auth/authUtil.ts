"use server";

import {
  IAuthLoginReqDto,
  TAuthLoginResDto,
} from "@/interface/auth/interfaceAuthLogin";
import { getAuthLogin } from "@/service/auth/apiAuthLogin";
import { cookies } from "next/headers";

/**
 * 로그인 서버액션 호출
 * 역할: node 서버에 cookie 저장 위한 단계
 */
export const loginServerAction = async (
  getAuthLoginReqDto: IAuthLoginReqDto
): Promise<TAuthLoginResDto> => {
  const res = await getAuthLogin(getAuthLoginReqDto);
  if (res.code !== 0) return res;

  const { accessToken, refreshToken } = res.data;

  (await cookies()).set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NEXT_PUBLIC_COOKIE_SECURE === "true",
    sameSite: (process.env.NEXT_PUBLIC_COOKIE_SAME_SITE || "lax") as
      | "lax"
      | "none",
    path: "/",
    maxAge: Number(process.env.NEXT_PUBLIC_ACCESS_TOKEN_VALIDITY ?? 0) / 1000,
  });

  (await cookies()).set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NEXT_PUBLIC_COOKIE_SECURE === "true",
    sameSite: (process.env.NEXT_PUBLIC_COOKIE_SAME_SITE || "lax") as
      | "lax"
      | "none",
    path: "/",
    maxAge: Number(process.env.NEXT_PUBLIC_REFRESH_TOKEN_VALIDITY ?? 0) / 1000,
  });

  return res;
};

// 로그아웃 서버액션
export const logoutServerAction = async () => {
  (await cookies()).delete("accessToken");
  (await cookies()).delete("refreshToken");

  (await cookies()).set("accessToken", "", {
    httpOnly: true,
    secure: process.env.NEXT_PUBLIC_COOKIE_SECURE === "true",
    sameSite: (process.env.NEXT_PUBLIC_COOKIE_SAME_SITE || "lax") as
      | "lax"
      | "none",
    path: "/",
    maxAge: 0,
  });

  (await cookies()).set("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NEXT_PUBLIC_COOKIE_SECURE === "true",
    sameSite: (process.env.NEXT_PUBLIC_COOKIE_SAME_SITE || "lax") as
      | "lax"
      | "none",
    path: "/",
    maxAge: 0,
  });
};

// 쿠키 확인용 Server Action
export const checkAuth = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  return {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    accessToken: accessToken || null,
    refreshToken: refreshToken || null,
  };
};

// 토큰 쿠키저장 서버액션
export const saveTokenServerAction = async (
  accessToken: string,
  refreshToken: string
) => {
  const accessTokenMaxAge = calculateMaxAge(accessToken);
  const refreshTokenMaxAge = calculateMaxAge(refreshToken);

  (await cookies()).set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NEXT_PUBLIC_COOKIE_SECURE === "true",
    sameSite: (process.env.NEXT_PUBLIC_COOKIE_SAME_SITE || "lax") as
      | "lax"
      | "none",
    path: "/",
    maxAge: accessTokenMaxAge,
  });

  (await cookies()).set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NEXT_PUBLIC_COOKIE_SECURE === "true",
    sameSite: (process.env.NEXT_PUBLIC_COOKIE_SAME_SITE || "lax") as
      | "lax"
      | "none",
    path: "/",
    maxAge: refreshTokenMaxAge,
  });
};

/**
 * maxAge 계산
 * @param token
 * @returns
 */
const calculateMaxAge = (token: string): number => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp;
    const now = Math.floor(Date.now() / 1000);
    const maxAge = exp - now;
    return maxAge > 0 ? maxAge : 0;
  } catch (error) {
    console.error("Failed to calculate maxAge:", error);
    return 3600;
  }
};
