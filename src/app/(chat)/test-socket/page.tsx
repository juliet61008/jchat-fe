"use client";

import { Client } from "@stomp/stompjs";
import { useEffect, useRef, useState } from "react";

export default function TestSocketPage() {
  const [message, setMessage] = useState("");
  const [received, setReceived] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);

  const clientRef = useRef<Client | null>(null);
  useEffect(() => {
    const stompClient = new Client({
      brokerURL: "ws://localhost:8080/ws",
      onConnect: () => {
        console.log("✅ 연결됨");
        setConnected(true); // 콜백 안이라 괜찮음
        setReceived((prev) => [...prev, "✅ 서버 연결 성공"]);

        stompClient.subscribe("/topic/wsTest", (message) => {
          console.log("📩 받음:", message.body);
          setReceived((prev) => [...prev, `📩 ${message.body}`]);
        });
      },
      onDisconnect: () => {
        console.log("❌ 연결 끊김");
        setConnected(false);
      },
      onStompError: (frame) => {
        console.error("에러:", frame);
      },
    });

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      stompClient.deactivate();
    };
  }, []);

  const sendMessage = () => {
    if (clientRef.current && connected && message) {
      // ✅ ref에서 가져옴
      clientRef.current.publish({
        destination: "/app/hello",
        body: message,
      });
      setReceived((prev) => [...prev, `📤 보냄: ${message}`]);
      setMessage("");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">STOMP WebSocket 테스트</h1>
      <div className="mb-2">
        상태: {connected ? "🟢 연결됨" : "🔴 연결 안됨"}
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="메시지 입력"
          className="border p-2 mr-2"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={!connected}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 disabled:bg-gray-300"
          disabled={!connected}
        >
          전송
        </button>
      </div>

      <div className="border p-4 h-64 overflow-y-auto bg-gray-50">
        {received.map((msg, idx) => (
          <div key={idx} className="mb-1">
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
}
