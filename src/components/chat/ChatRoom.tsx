// components/chat/ChatRoom.tsx
"use client";

import Loading from "@/components/common/Loading";
import { IJwtPayLoad } from "@/interface/auth/interfaceJwt";
import {
  IChatRoomMsg,
  ISearchChatRoomDtlResDto,
  ISendMsgReqDto,
  ISendMsgResDto,
  TSearchChatRoomDtlResDto,
} from "@/interface/chat/interfaceChat";
import { apiSearchChatRoomDtl } from "@/service/chat/apiChat";
import { checkAuth } from "@/utils/auth/authUtil";
import { Client } from "@stomp/stompjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  user: IJwtPayLoad;
  roomId: number;
}

const ChatRoom = (props: Props) => {
  const { user, roomId } = props;

  // 메세지 input
  const [inputValue, setInputValue] = useState("");
  // 소켓 연결
  const [connected, setConnected] = useState(false);
  // 첫 마운트시 로딩 추가 (reactQuery의 Loading과 같이 사용)
  const [isFstMountedLoading, setIsFstMountedLoading] = useState<boolean>(true);

  // 바닥의 div (바닥으로 보내기용) ref
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // 바닥치고있는지 여부 검사하는 ref
  const msgBoxRef = useRef<HTMLDivElement>(null);
  // 첫마운트 검사 ref
  const isFstMountedRef = useRef<boolean>(false);

  // STOMP 클라이언트
  const clientRef = useRef<Client | null>(null);
  // userQueryClient
  const queryClient = useQueryClient();

  /**
   * api 호출부
   */
  const { data: tokenData, refetch: refetchTokenData } = useQuery({
    queryKey: ["tokenData", user.userNo],
    queryFn: checkAuth,
    enabled: !!user.userNo,
  });

  // 메시지 (클라이언트에서만 fetch, 실시간)
  const {
    data: apiSearchChatRoomDtlData,
    isLoading: apiSearchChatRoomDtlLoading,
  } = useQuery<TSearchChatRoomDtlResDto, Error, ISearchChatRoomDtlResDto>({
    queryKey: ["apiSearchChatRoomDtl", roomId],
    queryFn: () => apiSearchChatRoomDtl(roomId),
    select: (res) => {
      if (res.code !== 0) throw new Error();

      return res.data;
    },
    staleTime: Infinity,
  });

  /**
   * 함수 선언부
   */

  /**
   * 바텀으로 이동
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /**
   * 바닥 치고 있는지 검사
   * @returns
   */
  const checkIfBottom = () => {
    const container = msgBoxRef.current;
    if (!container) return false;

    const { scrollTop, scrollHeight, clientHeight } = container;
    // 바닥에 정확히 도달
    const isAtBottom = scrollTop + clientHeight >= scrollHeight;
    console.log("======================");
    console.log("scrollTop", scrollTop);
    console.log("clientHeight", clientHeight);
    console.log("scrollTop + clientHeight", scrollTop + clientHeight);
    console.log("scrollHeight", scrollHeight);
    console.log("isAtBottom", isAtBottom);
    console.log("======================");

    // 또는 바닥에서 50px 이내
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;

    return isAtBottom; // 또는 isNearBottom
  };

  /**
   * 전송
   */
  const handleSend = () => {
    console.log("타나");
    if (inputValue.trim()) {
      // 낙관적 업데이트 위한 매칭용 임시데이터
      const tempId = `${user.sub}_${Date.now()}_${self.crypto.randomUUID()}`;

      const newMessage: IChatRoomMsg = {
        roomId: roomId,
        msgId: tempId,
        sndUserNo: user.sub,
        sndName: user.name,
        msgTypCd: "01",
        msgContent: inputValue.trim(),
        mineYn: "Y",
        delYn: "N",
        createTm: Date.now().toString(),
      };

      if (clientRef.current && clientRef?.current?.connected && inputValue) {
        const chatSendParams: ISendMsgReqDto = {
          tempId: tempId,
          roomId: roomId,
          roomName: apiSearchChatRoomDtlData?.chatRoom.roomName ?? "",
          msgContent: inputValue,
          accessToken: tokenData?.accessToken ?? "",
          refreshToken: tokenData?.refreshToken ?? "",
        };

        queryClient.setQueryData(
          ["apiSearchChatRoomDtl", roomId],
          (old: TSearchChatRoomDtlResDto) => ({
            ...old,
            data: {
              ...old.data,
              chatRoomMsgList: [
                ...(old.data.chatRoomMsgList ?? []),
                newMessage,
              ],
            },
          })
        );

        // ref에서 가져옴
        clientRef.current.publish({
          destination: `/app/chat/send/${roomId}`,
          body: JSON.stringify(chatSendParams),
        });

        setInputValue("");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 첫번째 loading 끝나면 바닥으로 바로 보내기
  useEffect(() => {
    let loadingInterval: any;

    if (!apiSearchChatRoomDtlLoading && !isFstMountedRef.current) {
      // 첫번째 마운트 true로 변경
      isFstMountedRef.current = true;
      // 바닥으로 바로 보내기
      messagesEndRef.current?.scrollIntoView();

      // 로딩 종료
      loadingInterval = setTimeout(() => {
        setIsFstMountedLoading(false);
      }, 0);
    }

    return () => clearInterval(loadingInterval);
  }, [apiSearchChatRoomDtlLoading]);

  // 아래로내리기
  useEffect(() => {
    // 마지막 메세지 본인 여부
    const lastMsgMineYn =
      apiSearchChatRoomDtlData?.chatRoomMsgList.at(-1)?.mineYn === "Y";

    const isBottom = checkIfBottom();

    console.log("isBottom", isBottom);

    if (lastMsgMineYn) {
      scrollToBottom();
    }
  }, [apiSearchChatRoomDtlData]);

  useEffect(() => {
    if (!tokenData?.accessToken) return;

    // 구독 참조 저장
    let subscriptionRef: any = null;

    const stompClient = new Client({
      brokerURL: `${process.env.NEXT_PUBLIC_JCHAT_WS_URL}/ws`,
      connectHeaders: {
        Authorization: `Bearer ${tokenData.accessToken}`,
      },
      heartbeatIncoming: 10000, // 10초마다 서버에서 받기
      heartbeatOutgoing: 10000, // 10초마다 서버로 보내기
      reconnectDelay: 5000, // 재연결 시도
      debug: (str) => {
        // console.log("🔍 STOMP Debug:", str);
      },
      beforeConnect: () => {},
      onConnect: (frame) => {
        // console.log("✅ 연결 성공", frame);
        // console.log("서버 버전:", frame.headers.version);
        // console.log("서버 정보:", frame.headers.server);
        setConnected(true); // 콜백 안이라 괜찮음
        queryClient.setQueryData(
          ["apiSearchChatRoomDtl", roomId],
          (old: TSearchChatRoomDtlResDto) => ({
            ...old,
            data: {
              ...old.data,
              chatRoomMsgList: [
                ...(old.data.chatRoomMsgList ?? []),
                // {
                //   roomId: roomId,
                //   msgId: `T${randomUUID}`,
                //   sndName: "알림",
                //   msgContent: "연결됨",
                // },
              ],
            },
          })
        );

        const messageQueue: ISendMsgResDto[] = [];
        let isProcessing = false;

        // queue 사용
        const processQueue = () => {
          if (isProcessing || messageQueue.length === 0) return;
          isProcessing = true;

          while (messageQueue.length > 0) {
            const res = messageQueue.shift()!;

            queryClient.setQueryData<TSearchChatRoomDtlResDto>(
              ["apiSearchChatRoomDtl", roomId],
              (old) => {
                if (!old) return old;

                const oldList = old.data.chatRoomMsgList ?? [];

                // tempId 교체
                if (res.tempId) {
                  const tempIdx = oldList.findIndex(
                    (msg) => msg.msgId === res.tempId
                  );

                  if (tempIdx !== -1) {
                    const newList = [...oldList];
                    newList[tempIdx] = res.chatRoomMsg;
                    return {
                      ...old,
                      data: { ...old.data, chatRoomMsgList: newList },
                    };
                  }
                }

                // 중복 체크
                if (
                  oldList.some((msg) => msg.msgId === res.chatRoomMsg.msgId)
                ) {
                  return old;
                }

                // 새 메시지 추가
                return {
                  ...old,
                  data: {
                    ...old.data,
                    chatRoomMsgList: [...oldList, res.chatRoomMsg],
                  },
                };
              }
            );
          }

          isProcessing = false;
        };

        subscriptionRef = stompClient.subscribe(
          `/topic/chat/send/${roomId}`,
          (message) => {
            const res: ISendMsgResDto = JSON.parse(message.body);

            // 새 매새지 user가 본인이면
            // if (res.chatRoomMsg.sndUserNo === user.userNo) {
            //   // 스크롤 바닥으로 보내기
            //   scrollToBottom();
            // }

            // 메세지큐 데이터 삽입
            messageQueue.push(res);
            processQueue();
          }
        );
      },
      onDisconnect: () => {
        console.log("연결 끊김");
        // 구독 해제
        setConnected(false);

        if (subscriptionRef) {
          subscriptionRef.unsubscribe();
          subscriptionRef = null;
        }
      },
      onStompError: (frame) => {
        setConnected(false);
        console.error("STOMP 에러:", frame);
        // const message = frame.body || frame.headers.message || "";
        // "401:" 로 시작하면 인증 에러
        // if (message.startsWith("401")) {
        //   console.log("Authentication failed");

        //   tokenRefreshServerAction(tokenData).then(() => {
        //     refetchTokenData();
        //     const test = queryClient.getQueryData([`tokenData`, user.userNo]);

        //     console.log("test", test);
        //   });

        //   // try {
        //   //     const newToken = await refreshToken();
        //   //     localStorage.setItem('accessToken', newToken);
        //   //     client.connectHeaders.Authorization = `Bearer ${newToken}`;
        //   //     client.activate();
        //   // } catch (error) {
        //   //     window.location.href = '/login';
        //   // }
        // }
        // console.error("에러 command:", frame.command);
        // console.error("에러 headers:", frame.headers);
        // console.error("에러 body:", frame.body);
      },
      // 비정상적인 close
      onWebSocketClose: (event) => {
        // console.error("onWebSocketClose", event);
        // console.error("에러 타입:", event.type);
        setConnected(false);

        // 정상적인 종료(clean close)인 경우 재연결 안 함
        // if (event?.code === 1000) {
        //   console.log("정상 종료, 재연결 안 함");
        //   return;
        // }

        // 비정상 종료만 재연결
        // console.log("비정상 종료, 5초 후 재연결 시도...");
        // setTimeout(() => {
        //   if (clientRef.current?.connected === false) {
        //     stompClient.activate();
        //   }
        // }, 5000);
      },
    });

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      // 구독 해제
      if (subscriptionRef) {
        subscriptionRef.unsubscribe();
        subscriptionRef = null;
      }

      // 연결 해제
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [roomId, queryClient, tokenData]);

  useEffect(() => {
    console.log("tokenData", tokenData);
  }, [tokenData]);

  return (
    <>
      <Loading
        isLoading={apiSearchChatRoomDtlLoading || isFstMountedLoading}
        text="채팅방 불러오는중"
      />
      <div className="flex items-center justify-center min-h-screen bg-background p-0 md:p-4">
        <div className="flex flex-col w-full h-[100dvh] md:h-[600px] md:max-w-md md:rounded-lg md:border md:shadow-lg bg-card overflow-hidden">
          {/* 헤더 */}
          <div className="border-b bg-card px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="font-semibold text-lg">
                {apiSearchChatRoomDtlData?.chatRoom.roomName ||
                  ((apiSearchChatRoomDtlData?.chatRoomUserList.length ?? 0) > 3
                    ? apiSearchChatRoomDtlData?.chatRoomUserList
                        .filter((obj, idx) => idx < 2)
                        .map((obj) => obj.name)
                        .join(",") +
                      ` 외 ${
                        (apiSearchChatRoomDtlData?.chatRoomUserList.length ??
                          3) - 3
                      } 명`
                    : apiSearchChatRoomDtlData?.chatRoomUserList
                        .map((obj) => obj.name)
                        .join(", "))}
              </h2>
              <p className="text-sm text-muted-foreground">
                {apiSearchChatRoomDtlData?.chatRoomUserList.length}명
              </p>
            </div>
          </div>

          {/* 메시지 목록 - 부드러운 스크롤바 */}
          <div
            ref={msgBoxRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 scrollbar-smooth"
          >
            {apiSearchChatRoomDtlData &&
              apiSearchChatRoomDtlData.chatRoomMsgList &&
              apiSearchChatRoomDtlData.chatRoomMsgList.map(
                (rommMsgObj, rommMsgIdx) => (
                  <div
                    key={rommMsgIdx}
                    className={`flex ${
                      rommMsgObj.sndUserNo === user.sub
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-end gap-2 max-w-[70%] ${
                        rommMsgObj.sndUserNo === user.sub
                          ? "flex-row-reverse"
                          : "flex-row"
                      }`}
                    >
                      {!(rommMsgObj.sndUserNo === user.sub) && (
                        <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
                      )}
                      <div
                        className={`flex flex-col ${
                          rommMsgObj.sndUserNo === user.sub
                            ? "items-end"
                            : "items-start"
                        }`}
                      >
                        {!(rommMsgObj.sndUserNo === user.sub) && (
                          <span className="text-sm font-medium mb-1">
                            {rommMsgObj.sndName}
                          </span>
                        )}
                        <div
                          className={`px-3 py-2 rounded-lg ${
                            rommMsgObj.sndUserNo === user.sub
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          {rommMsgObj.msgContent}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground self-end mb-1">
                        {new Date(rommMsgObj.createTm).toLocaleTimeString(
                          "ko-KR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                  </div>
                )
              )}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력창 */}
          <div className="border-t bg-card p-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="메시지를 입력하세요"
                className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatRoom;
