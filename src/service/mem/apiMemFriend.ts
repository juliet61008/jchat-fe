import { ISearchUserListResDto } from "@/interface/mem/interfaceMemFriend";

/**
 * 유저 리스트 조회
 * @returns
 */
export const apiSearchUserList = async (): Promise<ISearchUserListResDto[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_JCHAT_API_URL}/mem/friend/searchUserList`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return res.json();
};
