import FriendList from "@/components/mem/FriendList";
import { apiSearchFriendList } from "@/service/mem/apiMemFriend";
import { getUser } from "@/utils/mem/userUtil";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

const page = async () => {
  // 서버에서 데이터 prefetch
  const queryClient = new QueryClient();

  const user = await getUser();

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
