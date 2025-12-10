// hooks/useStomp.ts
import {
  Client,
  IMessage,
  StompHeaders,
  StompSubscription,
} from "@stomp/stompjs";
import { useCallback, useEffect, useRef, useState } from "react";
// SockJS를 쓰는 경우에만 설치/임포트 필요: npm i sockjs-client
// import SockJS from "sockjs-client";

export type SubscribeHandler<T = any> = (data: T, raw: IMessage) => void;

export interface UseStompOptions {
  /** ws://localhost:8080/ws 처럼 브로커 URL (SockJS 미사용 시) */
  brokerURL?: string;
  /** SockJS 엔드포인트 (예: http://localhost:8080/ws) */
  sockJsUrl?: string;
  /** STOMP 커넥트 헤더 */
  connectHeaders?: StompHeaders;
  /** 재연결 지연(ms) 기본: 5초 */
  reconnectDelay?: number;
  /** 하트비트 설정(ms). 기본값 예시 */
  heartbeatIncoming?: number;
  heartbeatOutgoing?: number;
  /** 디버그 로그 출력 여부 */
  debug?: boolean;
}

export interface UseStompReturn {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  /** JSON publish (연결 전에는 큐에 저장 후 연결 시 자동 전송) */
  publish: (destination: string, body: unknown, headers?: StompHeaders) => void;
  /** 동적 구독: unsubscribe 함수를 반환 */
  subscribe: <T = any>(
    destination: string,
    handler: SubscribeHandler<T>,
    headers?: StompHeaders
  ) => () => void;
  /** 강제 연결 종료(재연결도 멈춤) */
  disconnect: () => void;
  /** STOMP Client (필요시 직접 접근) */
  client: Client | null;
}

export function useStomp({
  brokerURL,
  sockJsUrl,
  connectHeaders,
  reconnectDelay = 5000,
  heartbeatIncoming = 10000,
  heartbeatOutgoing = 10000,
  debug = false,
}: UseStompOptions): UseStompReturn {
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef<boolean>(false);

  // 연결 전에 등록된 구독/발행을 처리하기 위한 큐
  const pendingSubsRef = useRef<
    Array<{
      destination: string;
      headers?: StompHeaders;
      handler: SubscribeHandler<any>;
    }>
  >([]);
  const activeSubsRef = useRef<StompSubscription[]>([]);
  const pendingPublishesRef = useRef<
    Array<{ destination: string; body: string; headers?: StompHeaders }>
  >([]);

  const logDebug = useCallback(
    (msg: string) => {
      if (debug) console.log(`[STOMP] ${msg}`);
    },
    [debug]
  );

  // 연결 생성 & 수명 관리
  useEffect(() => {
    mountedRef.current = true;

    // SSR 안전: 브라우저에서만
    if (typeof window === "undefined") {
      logDebug("SSR에서 실행 방지");
      return;
    }

    // 이미 활성화된 클라이언트가 있다면 정리
    if (clientRef.current?.active) {
      logDebug("기존 클라이언트 정리");
      clientRef.current.deactivate();
      clientRef.current = null;
    }

    const client = new Client({
      brokerURL: sockJsUrl ? undefined : brokerURL,
      // SockJS를 쓰는 경우
      // webSocketFactory: sockJsUrl ? () => new SockJS(sockJsUrl!) : undefined,
      reconnectDelay,
      heartbeatIncoming,
      heartbeatOutgoing,
      connectHeaders,

      debug: (str: string) => {
        if (debug) console.log("[STOMP DEBUG]", str);
      },

      onConnect: () => {
        if (!mountedRef.current) return;
        logDebug("✅ STOMP 연결됨");
        setConnected(true);
        setConnecting(false);
        setError(null);

        // 미리 등록된 구독 처리
        pendingSubsRef.current.forEach((sub) => {
          const s = client.subscribe(
            sub.destination,
            (msg) => {
              // JSON 파싱
              let data: any = null;
              try {
                data = JSON.parse(msg.body);
              } catch (e) {
                console.error("JSON parse error:", e, msg.body);
              }
              sub.handler(data, msg);
            },
            sub.headers
          );
          activeSubsRef.current.push(s);
        });
        pendingSubsRef.current = [];

        // 대기 중인 publish 전송
        pendingPublishesRef.current.forEach(
          ({ destination, body, headers }) => {
            client.publish({
              destination,
              body,
              headers: {
                "content-type": "application/json",
                ...headers,
              },
            });
          }
        );
        pendingPublishesRef.current = [];
      },

      onStompError: (frame) => {
        console.error("STOMP error frame:", frame);
        setError("STOMP error");
      },

      onDisconnect: () => {
        if (!mountedRef.current) return;
        logDebug("❌ STOMP 연결 끊김");
        setConnected(false);
      },

      onWebSocketClose: () => {
        if (!mountedRef.current) return;
        logDebug("🔌 WebSocket closed");
        setConnected(false);
        setConnecting(false);
      },
    });

    setConnecting(true);
    client.activate();
    clientRef.current = client;

    return () => {
      mountedRef.current = false;
      // 구독 해제
      activeSubsRef.current.forEach((s) => {
        try {
          s.unsubscribe();
        } catch (e) {
          // noop
        }
      });
      activeSubsRef.current = [];

      // 연결 종료
      if (clientRef.current?.active) {
        clientRef.current.deactivate();
      }
      clientRef.current = null;
      setConnected(false);
      setConnecting(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    brokerURL,
    sockJsUrl,
    reconnectDelay,
    heartbeatIncoming,
    heartbeatOutgoing,
    debug,
    JSON.stringify(connectHeaders || {}),
  ]);

  const subscribe = useCallback(
    <T = any>(
      destination: string,
      handler: SubscribeHandler<T>,
      headers?: StompHeaders
    ) => {
      const client = clientRef.current;

      if (client && client.active && client.connected) {
        const sub = client.subscribe(
          destination,
          (msg) => {
            let data: T | null = null;
            try {
              data = JSON.parse(msg.body) as T;
            } catch (e) {
              console.error("JSON parse error:", e, msg.body);
            }
            handler(data as T, msg);
          },
          headers
        );
        activeSubsRef.current.push(sub);

        // 구독 해제 함수 반환
        return () => {
          try {
            sub.unsubscribe();
          } catch {}
          activeSubsRef.current = activeSubsRef.current.filter(
            (s) => s.id !== sub.id
          );
        };
      } else {
        // 아직 연결 전이면, pending에 저장
        pendingSubsRef.current.push({ destination, headers, handler });
        // 연결되면 자동 구독되므로, 해제 핸들러는 연결 후에 구성되며
        // 여기서는 no-op을 반환
        return () => {
          // 연결 전에 해제하고 싶다면 pending에서 제거
          pendingSubsRef.current = pendingSubsRef.current.filter(
            (x) => !(x.destination === destination && x.handler === handler)
          );
        };
      }
    },
    []
  );

  const publish = useCallback(
    (destination: string, body: unknown, headers?: StompHeaders) => {
      const client = clientRef.current;
      const payload = JSON.stringify(body);
      const hdrs = { "content-type": "application/json", ...headers };

      if (client && client.active && client.connected) {
        client.publish({ destination, body: payload, headers: hdrs });
      } else {
        pendingPublishesRef.current.push({
          destination,
          body: payload,
          headers: hdrs,
        });
      }
    },
    []
  );

  const disconnect = useCallback(() => {
    if (clientRef.current?.active) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
    setConnected(false);
    setConnecting(false);
  }, []);

  return {
    connected,
    connecting,
    error,
    publish,
    subscribe,
    disconnect,
    client: clientRef.current,
  };
}
