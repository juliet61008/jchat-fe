/**
 * jwt 디코딩
 * @param token
 * @returns
 */
export const parseJwt = (token: string) => {
  console.log("token", token);
  if (!token) return null;

  // 서버 컴포넌트
  if (typeof window === "undefined") {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(base64, "base64").toString());
  }
  // 클라이언트 컴포넌트
  else {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }
};
