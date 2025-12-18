import UserList from "@/components/mem/UserList";
import { apiSearchFriendList } from "@/service/mem/apiMemFriend";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

const page = async () => {
  // 서버에서 데이터 prefetch
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["rcmUserList"],
    queryFn: () => apiSearchFriendList(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserList />
    </HydrationBoundary>
  );
};

export default page;
