"use client";

import BackHeader from "@/components/common/BackHeader";
import Loading from "@/components/common/Loading";
import UserCard from "@/components/mem/UserCard";
import { ISearchFriendListResDto } from "@/interface/mem/interfaceMemFriend";
import { apiSearchFriendList } from "@/service/mem/apiMemFriend";
import { useQuery } from "@tanstack/react-query";

const UserList = () => {
  const { data, isLoading, isFetching } = useQuery<ISearchFriendListResDto[]>({
    queryKey: ["rcmUserList"],
    queryFn: () => apiSearchFriendList(),
    refetchOnMount: "always",
    staleTime: 5 * 60 * 1000,
  });
  console.log("data", data);

  return (
    <>
      <Loading isLoading={isFetching || isLoading} />
      <div className="flex items-center justify-center min-h-screen bg-background p-0 md:p-4">
        <div className="flex flex-col w-full h-[100dvh] md:h-[600px] md:max-w-md md:rounded-lg md:border md:shadow-lg bg-card overflow-hidden">
          <BackHeader title="사용자 목록" />

          <div className="flex-1 overflow-y-auto scrollbar-smooth">
            {data &&
              data.length > 0 &&
              data.map((obj, idx) => (
                <UserCard
                  key={idx}
                  userId={obj.id}
                  nickname={obj.name}
                  onAddFriend={() => {}}
                  onOpenChat={() => {}}
                />
              ))}
            {/* <UserCard
              userId="2"
              nickname="테스트유저2"
              onAddFriend={() => {}}
              onOpenChat={() => {}}
            /> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserList;
