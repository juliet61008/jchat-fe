// app/ws-test/page.tsx (App Router)
// 또는 pages/ws-test.tsx (Pages Router)
// 파일 최상단에:
"use client";

import { useStomp } from "@/hooks/common/useStomp";
import { useEffect, useState } from "react";

type WsMessage = { text: string; at?: string };

export default function WsTestPage() {
  const [received, setReceived] = useState<WsMessage[]>([]);

  const { connected, connecting, error, publish, subscribe } = useStomp({
    // 순수 WebSocket이면 brokerURL 사용:
    brokerURL: "ws://localhost:8080/ws",

    // SockJS 서버라면 brokerURL 주석 처리하고 아래 옵션 사용:
    // sockJsUrl: "http://localhost:8080/ws",

    // reconnectDelay: 5000,
    // heartbeatIncoming: 10000,
    // heartbeatOutgoing: 10000,
    // debug: true, // 필요시 꺼도 됨
  });

  useEffect(() => {
    // 구독 등록
    const unsubscribe = subscribe<WsMessage>("/topic/wsTest", (data, raw) => {
      console.log("📩 받음:", raw.body);
      if (data) {
        setReceived((prev) => [...prev, data]);
      } else {
        // JSON 파싱 실패 시 raw 처리
        setReceived((prev) => [...prev, { text: raw.body }]);
      }
    });

    // 언마운트 시 구독 해제
    return () => {
      unsubscribe();
    };
  }, [subscribe]);

  const sendMessage = () => {
    publish("/app/wsTest", {
      text: "Hello from client",
      at: new Date().toISOString(),
    });
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>STOMP WebSocket 테스트</h2>
      <div>
        상태:{" "}
        {connecting ? "연결중..." : connected ? "✅ 연결됨" : "❌ 연결 끊김"}
      </div>
      {error && <div style={{ color: "red" }}>에러: {error}</div>}

      <button onClick={sendMessage} disabled={!connected}>
        서버로 전송
      </button>

      <h3>수신 메시지</h3>
      <ul>
        {received.map((m, i) => (
          <li key={i}>
            {m.text} {m.at ? `(${m.at})` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
