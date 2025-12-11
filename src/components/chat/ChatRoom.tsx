// components/chat/ChatRoom.tsx
"use client";

import { IJwtPayLoad } from "@/interface/auth/interfaceJwt";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isMine: boolean;
}

interface Props {
  user: IJwtPayLoad;
  roomName: string;
  participantCount: number;
}

const ChatRoom = (props: Props) => {
  const { user, roomName, participantCount } = props;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "친구",
      content: "안녕하세요!",
      timestamp: new Date(),
      isMine: false,
    },
    {
      id: "2",
      sender: "나",
      content: "안녕하세요! 반갑습니다.",
      timestamp: new Date(),
      isMine: true,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: "나",
        content: inputValue,
        timestamp: new Date(),
        isMine: true,
      };
      setMessages([...messages, newMessage]);
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-0 md:p-4">
      <div className="flex flex-col w-full h-[100dvh] md:h-[600px] md:max-w-md md:rounded-lg md:border md:shadow-lg bg-card overflow-hidden">
        {/* 헤더 */}
        <div className="border-b bg-card px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-semibold text-lg">{roomName}</h2>
            <p className="text-sm text-muted-foreground">
              {participantCount}명
            </p>
          </div>
        </div>

        {/* 메시지 목록 - 부드러운 스크롤바 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 scrollbar-smooth">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.isMine ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-end gap-2 max-w-[70%] ${
                  message.isMine ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {!message.isMine && (
                  <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
                )}
                <div
                  className={`flex flex-col ${
                    message.isMine ? "items-end" : "items-start"
                  }`}
                >
                  {!message.isMine && (
                    <span className="text-sm font-medium mb-1">
                      {message.sender}
                    </span>
                  )}
                  <div
                    className={`px-3 py-2 rounded-lg ${
                      message.isMine
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground self-end mb-1">
                  {message.timestamp.toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
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
  );
};

export default ChatRoom;
