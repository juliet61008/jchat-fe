// lib/fetchExtended.ts

import { ITokenDto } from "@/interface/auth/interfaceAuthLogin";
import { IApiResponse } from "@/interface/common/interfaceApiResponse";
import { checkAuth, saveTokenServerAction } from "@/utils/auth/authUtil";

interface FetchOptions extends RequestInit {
  skipRefresh?: boolean;
}

export async function fetchExtended(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const isServer = typeof window === "undefined";
  const baseURL = process.env.NEXT_PUBLIC_JCHAT_API_URL;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.headers) {
    const existingHeaders = new Headers(options.headers);
    existingHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  }

  // 토큰 정보 get
  const authResult = await checkAuth();
  const accessToken = authResult.accessToken;

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const { skipRefresh, ...fetchOptions } = options;

  const response = await fetch(`${url}`, {
    ...fetchOptions,
    headers,
  });

  // 클라이언트에서만 자동 갱신
  if (!isServer && response.status === 401 && !skipRefresh) {
    console.log("Token expired, attempting refresh...");

    const refreshToken = authResult.refreshToken;

    if (!refreshToken) {
      console.error("No refresh token, redirecting to login...");
      window.location.href = "/mem/login";
      throw new Error("Authentication required");
    }

    const refreshRes = await fetch(`${baseURL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (refreshRes.ok) {
      const refreshData: IApiResponse<ITokenDto> = await refreshRes.json();

      if (refreshData.code !== 0) {
        console.error("Refresh response invalid");
        window.location.href = "/mem/login";
        throw new Error("Token refresh failed");
      }

      const newAccessToken = refreshData.data?.accessToken;
      const newRefreshToken = refreshData.data?.refreshToken;

      if (!newAccessToken) {
        throw new Error("No access token in refresh response");
      }

      await saveTokenServerAction(newAccessToken, newRefreshToken);

      // 재귀 호출
      return fetchExtended(url, {
        ...options,
        skipRefresh: true,
      });
    } else {
      console.error("Refresh failed");
      window.location.href = "/mem/login";
      throw new Error("Authentication required");
    }
  }

  return response;
}

export const api = {
  get: (url: string, options?: FetchOptions) =>
    fetchExtended(url, { ...options, method: "GET" }),

  post: (url: string, body?: any, options?: FetchOptions) =>
    fetchExtended(url, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: (url: string, body?: any, options?: FetchOptions) =>
    fetchExtended(url, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: (url: string, body?: any, options?: FetchOptions) =>
    fetchExtended(url, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: (url: string, options?: FetchOptions) =>
    fetchExtended(url, { ...options, method: "DELETE" }),
};
