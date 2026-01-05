/**
 * 채팅방 리스트 서버컴포넌트
 */

import { apiSearchChatRoomList } from "@/service/chat/apiChat";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

const page = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: [`chatRoomList`],
    queryFn: apiSearchChatRoomList,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* 클라이언트컴포넌트영역 */}
      <></>
    </HydrationBoundary>
  );
};

export default page;
