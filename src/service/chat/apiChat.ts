import { TSearchChatRoomResDto } from "@/interface/chat/interfaceChat";
import { api } from "@/lib/fetchExtended";

/**
 * 채팅방 정보 조회
 * @param roomId
 * @returns
 */
export const apiSearchChatRoom = async (
  roomId: number
): Promise<TSearchChatRoomResDto> => {
  const res = await api.get(
    `${process.env.NEXT_PUBLIC_JCHAT_API_URL}/chat/room/${roomId}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return res.json();
};
