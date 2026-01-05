import {
  IMergeFriendReqDto,
  TMergeFriendResDto,
  TSearchFriendResDto,
} from "@/interface/mem/interfaceMemFriend";
import { api } from "@/lib/fetchExtended";

/**
 * 유저 리스트 조회
 * @returns
 */
export const apiSearchFriendList = async (): Promise<TSearchFriendResDto> => {
  const res = await api.get(
    `${process.env.NEXT_PUBLIC_JCHAT_API_URL}/mem/friend/list`,
    {
      method: "GET",
    }
  );

  return res.json();
};

/**
 * 유저 관계 변경
 * @returns
 */
export const apiMergeFriend = async (
  params: IMergeFriendReqDto
): Promise<TMergeFriendResDto> => {
  const res = await api.post(
    `${process.env.NEXT_PUBLIC_JCHAT_API_URL}/mem/friend/merge`,
    params
  );

  return res.json();
};
