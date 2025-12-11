"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Logout = () => {
  const router = useRouter();

  const processing = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_JCHAT_API_URL}/auth/logout`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (res != null) router.replace("/");
  };

  useEffect(() => {
    processing();
  }, []);

  return <div></div>;
};

export default Logout;
