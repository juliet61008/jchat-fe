"use client";

import { logoutServerAction } from "@/utils/auth/authUtil";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Logout = () => {
  const router = useRouter();

  const queryClient = useQueryClient();

  const processing = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_JCHAT_API_URL}/auth/logout`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    const fetchRes = await res.json();

    if (fetchRes.code !== 0) {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["isLogin"] });
    }

    await logoutServerAction();

    if (res != null) router.replace("/");
  };

  useEffect(() => {
    processing();
  }, []);

  return <div></div>;
};

export default Logout;
