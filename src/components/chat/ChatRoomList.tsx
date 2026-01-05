"use client";

import ChatRoomCard from "@/components/chat/ChatRoomCard";
import BackHeader from "@/components/common/BackHeader";
import Loading from "@/components/common/Loading";
import {
  ISearchChatRoomListResData,
  TSearchChatRoomListResDto,
} from "@/interface/chat/interfaceChat";
import { apiSearchChatRoomList } from "@/service/chat/apiChat";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

/**
 * 채팅방 클라이언트 컴포넌트
 * @returns
 */
const ChatRoomList = () => {
  const router = useRouter();

  const {
    data: chatRoomListData,
    isFetching: isChatRoomListFetching,
    isLoading: isChatRoomListLoading,
  } = useQuery<TSearchChatRoomListResDto, Error, ISearchChatRoomListResData[]>({
    queryKey: ["chatRoomList"],
    queryFn: apiSearchChatRoomList,
    staleTime: Infinity,
    select: (res) => {
      if (res.code !== 0) throw new Error();

      return res.data;
    },
  });

  /**
   * 채팅방 클릭
   */
  const handleRoomClick = (roomId: number) => {
    router.push(`/chat/room/${roomId}`);
  };

  return (
    <>
      <Loading isLoading={isChatRoomListFetching || isChatRoomListLoading} />
      <div className="flex items-center justify-center min-h-screen bg-background p-0 md:p-4">
        <div className="flex flex-col w-full h-[100dvh] md:h-[600px] md:max-w-md md:rounded-lg md:border md:shadow-lg bg-card overflow-hidden">
          <BackHeader title={`채팅방(${chatRoomListData?.length || 0})`} />
          <div className="flex-1 overflow-y-auto scrollbar-smooth">
            {chatRoomListData && chatRoomListData.length > 0 ? (
              chatRoomListData.map((roomObj, roomIdx) => (
                <ChatRoomCard
                  key={roomIdx}
                  data={roomObj}
                  onClick={() => handleRoomClick(roomObj.roomId)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <p>채팅방이 없습니다</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatRoomList;
