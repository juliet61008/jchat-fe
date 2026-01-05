"use client";

import BackHeader from "@/components/common/BackHeader";
import Loading from "@/components/common/Loading";
import UserCard from "@/components/mem/UserCard";
import { IJwtPayLoad } from "@/interface/auth/interfaceJwt";
import {
  IMergeFriendReqDto,
  ISearchFriendResData,
  TSearchFriendResDto,
} from "@/interface/mem/interfaceMemFriend";
import {
  apiMergeFriend,
  apiSearchFriendList,
} from "@/service/mem/apiMemFriend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface Props {
  user: IJwtPayLoad;
}

const FriendList = (props: Props) => {
  const { user } = props;

  // 목록 표출
  const [tab, setTab] = useState<"friend" | "block">("friend");

  // 메뉴 목록
  const [menuProps, setMenuProps] = useState([
    {
      value: "block",
      name: "차단 목록",
      function: () => {
        onChangeTabBlock();
      },
    },
  ]);

  /**
   * 차단목록으로 변경
   */
  const onChangeTabBlock = () => {
    setTab("block");
    setMenuProps([
      {
        value: "friend",
        name: "친구 목록",
        function: () => {
          onChangeTabFriend();
        },
      },
    ]);
  };

  /**
   * 친구목록으로 변경
   */
  const onChangeTabFriend = () => {
    setTab("friend");
    setMenuProps([
      {
        value: "block",
        name: "차단 목록",
        function: () => {
          onChangeTabBlock();
        },
      },
    ]);
  };

  // queryClient
  const queryClient = useQueryClient();

  // ============ useQuery ============ //
  const { data, isLoading, isFetching } = useQuery<
    TSearchFriendResDto,
    Error,
    ISearchFriendResData
  >({
    queryKey: [`friendList_${user.userNo}`],
    queryFn: () => apiSearchFriendList(),
    refetchOnMount: "always",
    staleTime: 5 * 60 * 1000,
    select: (res) => {
      if (res.code !== 0) {
        throw new Error("에러남");
      }

      return res.data;
    },
  });
  // ============ useQuery ============ //

  // ============ useMutation ============ //
  const mergeFriendMutation = useMutation({
    mutationFn: apiMergeFriend,
    onSuccess: (res) => {
      if (res.code !== 0) {
        throw new Error();
      }

      const data = res.data;

      if (data.succYn === "Y") {
        queryClient.invalidateQueries({
          queryKey: [`friendList_${user.userNo}`],
        });
      } else {
        alert("실패");
      }
    },
    onError: () => {
      alert("통신오류");
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
    const params: IMergeFriendReqDto = {
      relationUserNo: userNo,
      blockYn: blockYn,
    };

    mergeFriendMutation.mutate(params);
  };

  /**
   * 즐겨찾기상태변경 버튼 클릭
   */
  const likeFriendBtnClick = (userNo: number, likeYn: "Y" | "N") => {
    const params: IMergeFriendReqDto = {
      relationUserNo: userNo,
      likeYn: likeYn,
    };

    mergeFriendMutation.mutate(params);
  };

  return (
    <>
      <Loading isLoading={isFetching || isLoading} />

      <div className="flex items-center justify-center min-h-screen bg-background p-0 md:p-4">
        <div className="flex flex-col w-full h-[100dvh] md:h-[600px] md:max-w-md md:rounded-lg md:border md:shadow-lg bg-card overflow-hidden">
          <BackHeader
            title={
              tab === "friend"
                ? `친구목록(${
                    data?.friendList?.filter((obj) => obj.blockYn === "N")
                      .length
                  })`
                : `차단목록(${
                    data?.friendList?.filter((obj) => obj.blockYn === "Y")
                      .length
                  })`
            }
            menu
            menuProps={menuProps}
          />
          <div className="flex-1 overflow-y-auto scrollbar-smooth">
            {tab === "friend" ? (
              <>
                {data &&
                  data.friendList.filter((obj) => obj.blockYn === "N") &&
                  data.friendList.filter((obj) => obj.blockYn === "N").length >
                    0 &&
                  data.friendList
                    .filter((obj) => obj.blockYn === "N")
                    .map((obj, idx) => (
                      <UserCard
                        key={idx}
                        data={obj}
                        onOpenChat={() => {}}
                        onAddFriend={addFriendBtnClick}
                        blockFriendBtnClick={blockFriendBtnClick}
                        likeFriendBtnClick={likeFriendBtnClick}
                      />
                    ))}
              </>
            ) : (
              <>
                {data &&
                  data.friendList.filter((obj) => obj.blockYn === "Y") &&
                  data.friendList.filter((obj) => obj.blockYn === "Y").length >
                    0 &&
                  data.friendList
                    .filter((obj) => obj.blockYn === "Y")
                    .map((obj, idx) => (
                      <UserCard
                        key={idx}
                        data={obj}
                        onAddFriend={addFriendBtnClick}
                        onOpenChat={() => {}}
                        blockFriendBtnClick={blockFriendBtnClick}
                        likeFriendBtnClick={likeFriendBtnClick}
                      />
                    ))}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FriendList;
