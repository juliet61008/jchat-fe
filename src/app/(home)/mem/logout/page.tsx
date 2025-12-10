import Loading from "@/components/common/Loading";
import { redirect } from "next/navigation";

const page = async () => {
  await fetch(`${process.env.NEXT_PUBLIC_JCHAT_API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  redirect("/");

  return <Loading isLoading={true} />;
};

export default page;
