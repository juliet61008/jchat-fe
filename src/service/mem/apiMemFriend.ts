import {
  IMergeFriendReqDto,
  IMergeFriendResDto,
  ISearchFriendResDto,
} from "@/interface/mem/interfaceMemFriend";
import { api } from "@/lib/fetchExtended";

/**
 * 유저 리스트 조회
 * @returns
 */
export const apiSearchFriendList = async (): Promise<ISearchFriendResDto> => {
  const res = await api.get(
    `${process.env.NEXT_PUBLIC_JCHAT_API_URL}/mem/friend/list`,
    {
      method: "GET",
    }
  );

  return res.json();
};

/**
 * 유저 관계 추가
 * @returns
 */
export const apiInsertFriend = async (
  params: IMergeFriendReqDto
): Promise<IMergeFriendResDto> => {
  const res = await api.post(
    `${process.env.NEXT_PUBLIC_JCHAT_API_URL}/mem/friend/insert`,
    params
  );

  return res.json();
};
