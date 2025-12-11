// app/api/auth/user/route.ts
import { parseJwt } from "@/utils/auth/jwtUtil";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const GET = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json(null);
  }

  const payload = parseJwt(token);
  return NextResponse.json(payload);
};
