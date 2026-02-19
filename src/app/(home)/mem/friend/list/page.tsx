import FriendList from '@/components/mem/FriendList';
import { IApiResponse } from '@/interface/common/interfaceApiResponse';
import { apiIsLogin } from '@/service/auth/apiAuthLogin';
import { apiSearchFriendList } from '@/service/mem/apiMemFriend';
import { getUser } from '@/utils/mem/userUtil';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { redirect } from 'next/navigation';

const page = async () => {
  // 서버에서 데이터 prefetch
  const queryClient = new QueryClient();

  const user = await getUser();

  const isLogin = await queryClient.fetchQuery<IApiResponse<boolean>>({
    queryKey: ['isLogin'],
    queryFn: apiIsLogin,
  });

  if (!isLogin || isLogin.code !== 0 || !isLogin.data) {
    redirect('/mem/login');
  }

  await queryClient.prefetchQuery({
    queryKey: [`friendList_${user.userNo}`],
    queryFn: () => apiSearchFriendList(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FriendList user={user} />
    </HydrationBoundary>
  );
};

export default page;
