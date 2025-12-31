import ChatRoom from "@/components/chat/ChatRoom";
import { ISearchChatRoomResDto } from "@/interface/chat/interfaceChat";
import { apiSearchChatRoom } from "@/service/chat/apiChat";
import { getUser } from "@/utils/mem/userUtil";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

interface IProps {
  params: IParams;
}

interface IParams {
  roomId: number;
}

const page = async (params: IProps) => {
  // 동적 세그멘트
  const segument = await params.params;
  // 채팅방번호
  const roomId = segument.roomId;
  // 유저정보 조회
  const user = await getUser();

  const queryClient = new QueryClient();

  const res = await queryClient.prefetchQuery<ISearchChatRoomResDto>({
    queryKey: ["apiSearchChatRoom", roomId],
    queryFn: async () => apiSearchChatRoom(roomId),
    staleTime: Infinity,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ChatRoom user={user} roomId={roomId} />
    </HydrationBoundary>
  );
};

export default page;
