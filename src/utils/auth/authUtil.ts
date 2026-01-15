"use server";

import {
  IAuthLoginReqDto,
  ITokenDto,
  TAuthLoginResDto,
} from "@/interface/auth/interfaceAuthLogin";
import { ICheckAuthRes } from "@/interface/auth/interfaceJwt";
import { IApiResponse } from "@/interface/common/interfaceApiResponse";
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
export const checkAuth = async (): Promise<ICheckAuthRes> => {
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
 * 토큰검증 5분전
 * @param token
 * @returns
 */
export const isTokenValid = async (token: string): Promise<boolean> => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 - 60 * 5 * 1000 > Date.now();
  } catch {
    return false;
  }
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

/**
 * 갱신
 */
export const tokenRefreshServerAction = async (tokenData: any) => {
  const refreshRes = await fetch(
    `${process.env.NEXT_PUBLIC_JCHAT_API_URL}/auth/refreshToken`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenData?.refreshToken}`,
      },
    }
  );

  if (refreshRes.ok) {
    const refreshData: IApiResponse<ITokenDto> = await refreshRes.json();
    console.log("refreshData", refreshData);
    if (refreshData.code !== 0) {
      console.error("Refresh response invalid", refreshData);
    }

    const newAccessToken = refreshData.data?.accessToken;
    const newRefreshToken = refreshData.data?.refreshToken;

    if (!newAccessToken) {
      throw new Error("No access token in refresh response");
    }

    await saveTokenServerAction(newAccessToken, newRefreshToken);
  }
};
