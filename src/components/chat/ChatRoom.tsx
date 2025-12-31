// components/chat/ChatRoom.tsx
"use client";

import Loading from "@/components/common/Loading";
import { IJwtPayLoad } from "@/interface/auth/interfaceJwt";
import {
  IChatRoomMsg,
  ISearchChatRoomResDto,
  ISendMsgReqDto,
  ISendMsgResDto,
} from "@/interface/chat/interfaceChat";
import { apiSearchChatRoom } from "@/service/chat/apiChat";
import { Client } from "@stomp/stompjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { randomUUID } from "crypto";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  user: IJwtPayLoad;
  roomId: number;
}

const ChatRoom = (props: Props) => {
  const { user, roomId } = props;

  // const [messages, setMessages] = useState<IChatRoomMsg[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // 소켓 연결
  const [connected, setConnected] = useState(false);
  // 클라이언트
  const clientRef = useRef<Client | null>(null);
  const queryClient = useQueryClient();

  /**
   * api 호출부
   */

  // 메시지 (클라이언트에서만 fetch, 실시간)
  const { data: apiSearchChatRoomData, isLoading: apiSearchChatRoomLoading } =
    useQuery<ISearchChatRoomResDto>({
      queryKey: ["apiSearchChatRoom", roomId],
      queryFn: () => apiSearchChatRoom(roomId),
      staleTime: Infinity,
    });

  /**
   * 함수 선언부
   */

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /**
   * 전송
   */
  const handleSend = () => {
    if (inputValue.trim()) {
      // 낙관적 업데이트 위한 매칭용 임시데이터
      const tempId = `${user.sub}_${Date.now()}_${randomUUID}`;

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
          roomName: apiSearchChatRoomData?.chatRoom.roomName ?? "",
          msgContent: inputValue,
        };

        queryClient.setQueryData(
          ["apiSearchChatRoom", roomId],
          (old: ISearchChatRoomResDto) => ({
            ...old,
            chatRoomMsgList: [...(old?.chatRoomMsgList ?? []), newMessage],
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

  useEffect(() => {
    if (!apiSearchChatRoomLoading) {
      messagesEndRef.current?.scrollIntoView();
    }
  }, [apiSearchChatRoomLoading]);

  // WebSocket으로 받은 메시지를 React Query 캐시에 추가
  // useEffect(() => {
  //   const handleNewMessage = (newMsg: Message) => {
  //     queryClient.setQueryData(
  //       ["apiSearchChatRoom", roomId],
  //       (old: any) => ({
  //         ...old,
  //         chatRoomMsgList: [...(old?.chatRoomMsgList ?? []), newMsg]
  //       })
  //     );
  //   };

  //   socket.on('message', handleNewMessage);
  //   return () => socket.off('message', handleNewMessage);
  // }, [roomId, queryClient]);

  // 주석이유 : 받을때도 내려감
  // useEffect(() => {
  //   scrollToBottom();
  // }, [apiSearchChatRoomData]);

  useEffect(() => {
    console.log("apiSearchChatRoomData", apiSearchChatRoomData);
  }, [apiSearchChatRoomData]);

  useEffect(() => {
    const stompClient = new Client({
      brokerURL: "ws://localhost:8080/ws",
      heartbeatIncoming: 10000, // 10초마다 서버에서 받기
      heartbeatOutgoing: 10000, // 10초마다 서버로 보내기
      reconnectDelay: 5000, // 재연결 시도
      onConnect: () => {
        setConnected(true); // 콜백 안이라 괜찮음
        queryClient.setQueryData(
          ["apiSearchChatRoom", roomId],
          (old: ISearchChatRoomResDto) => ({
            ...old,
            chatRoomMsgList: [
              ...(old?.chatRoomMsgList ?? []),
              // {
              //   roomId: roomId,
              //   msgId: `T${randomUUID}`,
              //   sndName: "알림",
              //   msgContent: "연결됨",
              // },
            ],
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

            queryClient.setQueryData<ISearchChatRoomResDto>(
              ["apiSearchChatRoom", roomId],
              (old) => {
                if (!old) return old;

                const oldList = old.chatRoomMsgList ?? [];

                // tempId 교체
                if (res.tempId) {
                  const tempIdx = oldList.findIndex(
                    (msg) => msg.msgId === res.tempId
                  );
                  if (tempIdx !== -1) {
                    const newList = [...oldList];
                    newList[tempIdx] = res.chatRoomMsg;
                    return { ...old, chatRoomMsgList: newList };
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
                  chatRoomMsgList: [...oldList, res.chatRoomMsg],
                };
              }
            );
          }

          isProcessing = false;
        };

        stompClient.subscribe(`/topic/chat/send/${roomId}`, (message) => {
          const res: ISendMsgResDto = JSON.parse(message.body);
          // 새 매새지 user가 본인이면
          if (res.chatRoomMsg.sndUserNo === user.userNo) {
            // 스크롤 바닥으로 보내기
            scrollToBottom();
          }

          // 메세지큐 데이터 삽입
          messageQueue.push(res);
          processQueue();
        });
      },
      onDisconnect: () => {
        console.log("연결 끊김");
        setConnected(false);
      },
      onStompError: (frame) => {
        console.error("에러:", frame);
      },
      // 비정상적인 close
      onWebSocketClose: () => {
        // 연결상태
        setConnected(false);
        // 네트워크 끊김 시에만 재연결 시도
        console.log("연결 끊김, 5초 후 재연결 시도...");
        if (stompClient.state !== 0) {
          // 상태 확인
          setTimeout(() => stompClient.activate(), 5000);
        }
      },
    });

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      stompClient.deactivate();
    };
  }, [roomId, queryClient]);

  return (
    <>
      <Loading isLoading={apiSearchChatRoomLoading} text="채팅방 불러오는중" />
      <div className="flex items-center justify-center min-h-screen bg-background p-0 md:p-4">
        <div className="flex flex-col w-full h-[100dvh] md:h-[600px] md:max-w-md md:rounded-lg md:border md:shadow-lg bg-card overflow-hidden">
          {/* 헤더 */}
          <div className="border-b bg-card px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="font-semibold text-lg">
                {apiSearchChatRoomData?.chatRoom.roomName ||
                  ((apiSearchChatRoomData?.chatRoomUserList.length ?? 0) > 3
                    ? apiSearchChatRoomData?.chatRoomUserList
                        .filter((obj, idx) => idx < 2)
                        .map((obj) => obj.name)
                        .join(",") +
                      ` 외 ${
                        (apiSearchChatRoomData?.chatRoomUserList.length ?? 3) -
                        3
                      } 명`
                    : apiSearchChatRoomData?.chatRoomUserList
                        .map((obj) => obj.name)
                        .join(", "))}
              </h2>
              <p className="text-sm text-muted-foreground">
                {apiSearchChatRoomData?.chatRoomUserList.length}명
              </p>
            </div>
          </div>

          {/* 메시지 목록 - 부드러운 스크롤바 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 scrollbar-smooth">
            {apiSearchChatRoomData &&
              apiSearchChatRoomData.chatRoomMsgList &&
              apiSearchChatRoomData.chatRoomMsgList.map(
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
