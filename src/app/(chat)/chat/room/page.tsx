/**
 * 채팅방 리스트 서버컴포넌트
 */

import ChatRoomList from "@/components/chat/ChatRoomList";
import { TSearchChatRoomListResDto } from "@/interface/chat/interfaceChat";
import { apiSearchChatRoomList } from "@/service/chat/apiChat";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

const page = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery<TSearchChatRoomListResDto>({
    queryKey: ["chatRoomList"],
    queryFn: apiSearchChatRoomList,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ChatRoomList />
    </HydrationBoundary>
  );
};

export default page;
