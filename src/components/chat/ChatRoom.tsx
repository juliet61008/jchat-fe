// components/chat/ChatRoom.tsx
'use client';

import Loading from '@/components/common/Loading';
import { useToken } from '@/hooks/auth/useToken';
import { IJwtPayLoad } from '@/interface/auth/interfaceJwt';
import {
  IChatRoomMsg,
  IReadMsgReqDto,
  IReadMsgResDto,
  ISearchChatRoomDtlResDto,
  ISendMsgReqDto,
  ISendMsgResDto,
  TSearchChatRoomDtlResDto,
} from '@/interface/chat/interfaceChat';
import { apiSearchChatRoomDtl } from '@/service/chat/apiChat';
import { Client } from '@stomp/stompjs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface Props {
  user: IJwtPayLoad;
  roomId: number;
}

const ChatRoom = (props: Props) => {
  const { user, roomId } = props;

  const { tokenData, refreshTokenData } = useToken();

  // 메세지 input
  const [inputValue, setInputValue] = useState('');
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
  // 첫번째 클라이언트 생성 검사 ref
  const isFstClientRef = useRef<boolean>(true);

  // STOMP 클라이언트
  const clientRef = useRef<Client | null>(null);
  // userQueryClient
  const queryClient = useQueryClient();

  // 읽은 메시지 ID들을 모음
  const readQueueRef = useRef<Set<number>>(new Set());

  // TODO READ 쓰로틀로 개발중
  // const test = () => {
  //   if (clientRef.current) {
  //     const params = {};
  //     clientRef.current.publish({
  //       destination: `/app/chat/send/${roomId}`,
  //       body: JSON.stringify(params),
  //     });
  //   }
  // };

  // // throttle 테스트
  // const readLastMsgThrottled = useMemo(() =>
  //   throttle(test, 1000, {
  //     leading: true,
  //     trailing: true,
  //   }), []
  // );

  // 메시지 (클라이언트에서만 fetch, 실시간)
  const { data: apiSearchChatRoomDtlData, isLoading: apiSearchChatRoomDtlLoading } = useQuery<
    TSearchChatRoomDtlResDto,
    Error,
    ISearchChatRoomDtlResDto
  >({
    queryKey: ['apiSearchChatRoomDtl', roomId],
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
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

    // 또는 바닥에서 50px 이내
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    return isNearBottom; // 또는 isNearBottom
  };

  // 메세지발송 구독queue 처리
  const processQueue = (messageQueue: ISendMsgResDto[], process: { isProcessing: boolean }) => {
    if (process.isProcessing || messageQueue.length === 0) return;
    process.isProcessing = true;

    while (messageQueue.length > 0) {
      const res = messageQueue.shift()!;

      queryClient.setQueryData<TSearchChatRoomDtlResDto>(
        ['apiSearchChatRoomDtl', roomId],
        (old) => {
          if (!old) return old;

          const oldList = old.data.chatRoomMsgList ?? [];

          // tempId 로 찾기
          if (res.tempId) {
            const tempIdx = oldList.findIndex((msg) => msg.msgId === res.tempId);

            if (tempIdx !== -1) {
              const newList = [...oldList];
              newList[tempIdx] = res.chatRoomMsg;
              return {
                ...old,
                data: { ...old.data, chatRoomMsgList: newList },
              };
            }
          }

          if (clientRef.current) {
            // 메세지 읽음 처리 발행
            readQueueRef.current.add(res.chatRoomMsg.msgId as number);
          }

          // 중복 체크
          if (oldList.some((msg) => msg.msgId === res.chatRoomMsg.msgId)) {
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

    process.isProcessing = false;
  };

  /**
   * 클라이언트 생성
   * @returns
   */
  const generateClient = (accessToken?: string | null) => {
    const client = new Client({
      brokerURL: `${process.env.NEXT_PUBLIC_JCHAT_WS_URL}/ws`,
      connectHeaders: {
        Authorization: `Bearer ${accessToken || tokenData?.accessToken}`,
      },
      heartbeatIncoming: 10000, // 10초마다 서버에서 받기
      heartbeatOutgoing: 10000, // 10초마다 서버로 보내기
      // reconnectDelay: 5000, // 재연결 시도
      // beforeConnect: async () => {},
      onConnect: (frame) => {
        console.log('연결 성공', frame);

        setConnected(true); // 콜백 안이라 괜찮음
        queryClient.setQueryData(
          ['apiSearchChatRoomDtl', roomId],
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

        // 메세지 정렬할 queue
        const messageQueue: ISendMsgResDto[] = [];
        const process = { isProcessing: false };

        client.subscribe(`/topic/chat/send/${roomId}`, (message) => {
          const res: ISendMsgResDto = JSON.parse(message.body);

          // 메세지큐 데이터 삽입
          messageQueue.push(res);
          processQueue(messageQueue, process);
        });

        client.subscribe(`/topic/chat/read/${roomId}`, (message) => {
          const res: IReadMsgResDto = JSON.parse(message.body);
          console.log('읽음처리 구독 message : ', message.body);
          queryClient.setQueryData<TSearchChatRoomDtlResDto>(
            ['apiSearchChatRoomDtl', roomId],
            (old) => {
              if (!old) return old;

              const newChatRoomUserList = old.data.chatRoomUserList.map((obj) => ({
                ...obj,
                lastReadMsgId: obj.userNo === res.userNo ? res.lastReadMsgId : obj.lastReadMsgId,
              }));

              return { ...old, data: { ...old.data, chatRoomUserList: newChatRoomUserList } };
            }
          );
        });
      },
      onDisconnect: (event) => {
        console.log('연결 끊김', event);
        // 구독 해제
        setConnected(false);
      },
      onStompError: async (frame) => {
        console.error('STOMP 에러:', frame);

        setConnected(false);

        await client.deactivate();

        const message = frame.body || frame.headers.message || '';
        // "401:" 로 시작하면 인증 에러
        if (message.startsWith('401')) {
          await refreshTokenData();

          const newClient = generateClient(tokenData?.accessToken);

          newClient.activate();
        }
      },
      // 비정상적인 close
      onWebSocketClose: async (event) => {
        console.log('onWebSocketClose', event);
        setConnected(false);
        if (clientRef.current) {
          await clientRef.current.deactivate();
          clientRef.current.activate();
        }
      },
    });

    return client;
  };

  /**
   * 전송
   */
  const handleSend = () => {
    if (inputValue.trim()) {
      // 낙관적 업데이트 위한 매칭용 임시데이터
      const tempId = `${user.sub}_${Date.now()}_${self.crypto.randomUUID()}`;
      const trimmedContent = inputValue.trim();

      const newMessage: IChatRoomMsg = {
        roomId: roomId,
        msgId: tempId,
        sndUserNo: user.sub,
        sndName: user.name,
        msgTypCd: '01',
        msgContent: trimmedContent,
        mineYn: 'Y',
        delYn: 'N',
        createTm: Date.now().toString(),
      };

      if (clientRef.current && clientRef?.current?.connected && trimmedContent) {
        const chatSendParams: ISendMsgReqDto = {
          tempId: tempId,
          roomId: roomId,
          roomName: apiSearchChatRoomDtlData?.chatRoom.roomName ?? '',
          msgContent: trimmedContent,
        };

        // 1. 즉시 input 초기화 (사용자 경험 개선)
        setInputValue('');

        // 2. 낙관적 업데이트
        queryClient.setQueryData(
          ['apiSearchChatRoomDtl', roomId],
          (old: TSearchChatRoomDtlResDto) => ({
            ...old,
            data: {
              ...old.data,
              chatRoomMsgList: [...(old.data.chatRoomMsgList ?? []), newMessage],
            },
          })
        );

        // 3. 서버에 전송
        clientRef.current.publish({
          destination: `/app/chat/send/${roomId}`,
          body: JSON.stringify(chatSendParams),
        });
      }
    }
  };

  /**
   * 엔터키 이벤트
   * @param e
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 안읽은 수 계산을 메모이제이션 (O(n×m) -> O(n×m) 1회만)
  const unreadCountMap = useMemo(() => {
    if (!apiSearchChatRoomDtlData) return new Map<string | number, number>();

    const map = new Map<string | number, number>();
    const msgList = apiSearchChatRoomDtlData.chatRoomMsgList;
    const userList = apiSearchChatRoomDtlData.chatRoomUserList;

    msgList?.forEach((msg) => {
      const count = userList.filter((user) => {
        if (user.userNo === msg.sndUserNo) return false;
        return Number(msg.msgId) > (user.lastReadMsgId || 0);
      }).length;
      map.set(msg.msgId as string | number, count);
    });
    return map;
  }, [apiSearchChatRoomDtlData]);

  /**
   * 브라우저 백그라운드 감지
   * 포그라운드 돌아올 경우 재연결
   * */
  useEffect(() => {
    const visibilitychange = async () => {
      if (!document.hidden) {
        if (clientRef.current) {
          await clientRef.current.deactivate();
          clientRef.current.activate();
        }
      }
    };

    document.addEventListener('visibilitychange', visibilitychange);

    // 클린업
    return () => {
      document.removeEventListener('visibilitychange', visibilitychange);
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, []);

  // 메세지 발행 배치처리
  useEffect(() => {
    const interval = setInterval(() => {
      if (readQueueRef.current.size > 0) {
        // ID가 timestamp 기반이면 가장 큰 값
        const latestMessageId = Math.max(...Array.from(readQueueRef.current));

        const chatReadParams: IReadMsgReqDto = {
          roomId: roomId,
          lastReadMsgId: latestMessageId,
        };

        // 읽음처리 발행
        if (clientRef.current) {
          clientRef.current.publish({
            destination: `/app/chat/read/${roomId}`,
            body: JSON.stringify(chatReadParams),
          });

          // 읽음처리 queue 초기화
          readQueueRef.current.clear();
        }
      }
    }, 1000);

    // 클린업
    return () => clearInterval(interval);
  }, [roomId]);

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

  // 새 메세지 아래로내리기 (의존성 최적화)
  useEffect(() => {
    if (!apiSearchChatRoomDtlData?.chatRoomMsgList) return;

    // 마지막 메세지 본인 여부
    const lastMsg = apiSearchChatRoomDtlData.chatRoomMsgList.at(-1);
    const lastMsgMineYn = lastMsg?.mineYn === 'Y';

    // 바닥 치고 있었는지 여부
    const isBottom = checkIfBottom();

    if (lastMsgMineYn || isBottom) {
      scrollToBottom();
    }
  }, [apiSearchChatRoomDtlData?.chatRoomMsgList?.length]);

  // 클라이언트 시작
  useEffect(() => {
    if (!tokenData?.accessToken || !apiSearchChatRoomDtlData) return;

    if (!isFstClientRef.current) return;

    const client = generateClient();

    // clientRef (함수바깥에서 사용할거)
    clientRef.current = client;

    if (apiSearchChatRoomDtlData && apiSearchChatRoomDtlData.chatRoomMsgList) {
      const lastObj = apiSearchChatRoomDtlData.chatRoomMsgList.at(-1);
      if (lastObj) {
        readQueueRef.current.add(lastObj.msgId as number);
      }
    }

    // active
    client.activate();

    isFstClientRef.current = false;

    // 클린업
    return () => {
      // 연결 해제
      client.deactivate();
    };
  }, [roomId, queryClient, tokenData, apiSearchChatRoomDtlData]);

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
                        .join(',') +
                      ` 외 ${(apiSearchChatRoomDtlData?.chatRoomUserList.length ?? 3) - 3} 명`
                    : apiSearchChatRoomDtlData?.chatRoomUserList.map((obj) => obj.name).join(', '))}
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
              apiSearchChatRoomDtlData.chatRoomMsgList.map((roomMsgObj, roomMsgIdx) => {
                // 안읽은수 (메모이제이션된 Map에서 가져오기)
                const unreadCount = unreadCountMap.get(roomMsgObj.msgId as string | number) || 0;

                return (
                  <div
                    key={roomMsgIdx}
                    className={`flex ${
                      roomMsgObj.sndUserNo === user.sub ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`flex items-end gap-2 max-w-[70%] ${
                        roomMsgObj.sndUserNo === user.sub ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      {!(roomMsgObj.sndUserNo === user.sub) && (
                        <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
                      )}
                      <div
                        className={`flex flex-col ${
                          roomMsgObj.sndUserNo === user.sub ? 'items-end' : 'items-start'
                        }`}
                      >
                        {!(roomMsgObj.sndUserNo === user.sub) && (
                          <span className="text-sm font-medium mb-1">{roomMsgObj.sndName}</span>
                        )}
                        <div
                          className={`px-3 py-2 rounded-lg ${
                            roomMsgObj.sndUserNo === user.sub
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          {roomMsgObj.msgContent}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 self-end mb-1">
                        <span className="text-xs text-muted-foreground">
                          {unreadCount > 0 && (
                            <span className="text-xs font-semibold text-yellow-500 p-2">
                              {unreadCount}
                            </span>
                          )}
                          <span>
                            {new Date(roomMsgObj.createTm).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
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
