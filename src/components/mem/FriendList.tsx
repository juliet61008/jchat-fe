"use client";

import BackHeader from "@/components/common/BackHeader";
import Loading from "@/components/common/Loading";
import UserCard from "@/components/mem/UserCard";
import { IJwtPayLoad } from "@/interface/auth/interfaceJwt";
import {
  IMergeFriendReqDto,
  ISearchFriendResDto,
} from "@/interface/mem/interfaceMemFriend";
import {
  apiInsertFriend,
  apiSearchFriendList,
} from "@/service/mem/apiMemFriend";
import { useMutation, useQuery } from "@tanstack/react-query";

interface Props {
  user: IJwtPayLoad;
}

const FriendList = (props: Props) => {
  const { user } = props;

  // ============ useQuery ============ //
  const { data, isLoading, isFetching } = useQuery<ISearchFriendResDto>({
    queryKey: [`friendList_${user.userNo}`],
    queryFn: () => apiSearchFriendList(),
    refetchOnMount: "always",
    staleTime: 5 * 60 * 1000,
  });
  // ============ useQuery ============ //

  // ============ useMutation ============ //
  const mergeFriendMutation = useMutation({
    mutationFn: apiInsertFriend,
    onSuccess: () => {
      alert("성공");
    },
    onError: () => {
      alert("실패");
    },
  });
  // ============ useMutation ============ //

  /**
   * 친구추가 버튼 클릭
   */
  const addFriendBtnClick = (userNo: number): void => {
    const params: IMergeFriendReqDto = {
      relationUserNo: userNo,
    };

    mergeFriendMutation.mutate(params);
  };

  /**
   * 차단상태변경 버튼 클릭
   */
  const blockFriendBtnClick = (userNo: number, blockYn: "Y" | "N") => {
    console.log("test");
    const params: IMergeFriendReqDto = {
      relationUserNo: userNo,
      blockYn: blockYn,
    };

    mergeFriendMutation.mutate(params);
  };

  return (
    <>
      <Loading isLoading={isFetching || isLoading} />
      <div className="flex items-center justify-center min-h-screen bg-background p-0 md:p-4">
        <div className="flex flex-col w-full h-[100dvh] md:h-[600px] md:max-w-md md:rounded-lg md:border md:shadow-lg bg-card overflow-hidden">
          <BackHeader title="사용자 목록" />

          <div className="flex-1 overflow-y-auto scrollbar-smooth">
            {data &&
              data.friendList &&
              data.friendList.length > 0 &&
              data.friendList.map((obj, idx) => (
                <UserCard
                  key={idx}
                  data={obj}
                  onAddFriend={addFriendBtnClick}
                  onOpenChat={() => {}}
                  blockFriendBtnClick={blockFriendBtnClick}
                />
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default FriendList;
