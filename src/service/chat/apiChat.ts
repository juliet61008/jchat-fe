import {
  ISearchChatRoomListResDto,
  TSearchChatRoomDtlResDto,
} from "@/interface/chat/interfaceChat";

import { api } from "@/lib/fetchExtended";

/**
 * 채팅방 리스트 정보 조회
 */
export const apiSearchChatRoomList =
  async (): Promise<ISearchChatRoomListResDto> => {
    const res = await api.get(
      `${process.env.NEXT_PUBLIC_JCHAT_API_URL}/chat/room`
    );
    return res.json();
  };

/**
 * 채팅방 디테일 정보 조회
 * @param roomId
 * @returns
 */
export const apiSearchChatRoomDtl = async (
  roomId: number
): Promise<TSearchChatRoomDtlResDto> => {
  const res = await api.get(
    `${process.env.NEXT_PUBLIC_JCHAT_API_URL}/chat/room/${roomId}`,
    {
      method: "GET",
    }
  );

  return res.json();
};
