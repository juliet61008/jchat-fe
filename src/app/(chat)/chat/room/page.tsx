/**
 * 채팅방 리스트 서버컴포넌트
 */

import ChatRoomList from '@/components/chat/ChatRoomList';
import { TSearchChatRoomListResDto } from '@/interface/chat/interfaceChat';
import { IApiResponse } from '@/interface/common/interfaceApiResponse';
import { apiIsLogin } from '@/service/auth/apiAuthLogin';
import { apiSearchChatRoomList } from '@/service/chat/apiChat';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { redirect } from 'next/navigation';

const page = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery<TSearchChatRoomListResDto>({
    queryKey: ['chatRoomList'],
    queryFn: apiSearchChatRoomList,
  });

  const isLogin = await queryClient.fetchQuery<IApiResponse<boolean>>({
    queryKey: ['isLogin'],
    queryFn: apiIsLogin,
  });

  if (!isLogin || isLogin.code !== 0 || !isLogin.data) {
    redirect('/mem/login');
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ChatRoomList />
    </HydrationBoundary>
  );
};

export default page;
