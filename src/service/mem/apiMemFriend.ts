import { ISearchFriendListResDto } from "@/interface/mem/interfaceMemFriend";
import { api } from "@/lib/fetchExtended";

/**
 * 유저 리스트 조회
 * @returns
 */
export const apiSearchFriendList = async (): Promise<
  ISearchFriendListResDto[]
> => {
  const res = await api.get(
    `${process.env.NEXT_PUBLIC_JCHAT_API_URL}/mem/friend/list`,
    {
      method: "GET",
    }
  );

  return res.json();
};
