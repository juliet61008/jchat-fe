"use client";

import { IComOtherUser } from "@/interface/mem/interfaceMemFriend";
import { MoreVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  data: IComOtherUser;
  onAddFriend: (userNo: number) => void;
  onOpenChat: (userNo: number) => void;
  blockFriendBtnClick: (userNo: number, blockYn: "Y" | "N") => void;
}

export default function UserCard(props: Props) {
  const { data, onAddFriend, onOpenChat, blockFriendBtnClick } = props;

  // 메뉴오픈
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-muted flex-shrink-0 overflow-hidden">
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            {data.aliasNm ?? data.name} {/* 별칭 ?? 이름 */}
          </div>
        </div>
        <span className="font-medium">{data.aliasNm ?? data.name}</span>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-full transition-colors"
        >
          <MoreVertical size={20} />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-1 w-36 bg-card border rounded-lg shadow-lg overflow-hidden z-20">
            {/* 친구 아닌 경우 */}
            {data.friendYn === "N" && (
              <button
                onClick={() => {
                  onAddFriend(data.userNo);
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors"
              >
                친구 추가
              </button>
            )}
            {/* 차단 아닌 상태 */}
            {data.blockYn === "N" ? (
              <button
                onClick={() => {
                  console.log("test23");
                  console.log("함수 존재?", blockFriendBtnClick); // ← 이거 추가!
                  console.log("함수 타입?", typeof blockFriendBtnClick); // ← 이거도!
                  console.log("data.userNo?", data.userNo); // ← 이것도!
                  blockFriendBtnClick(data.userNo, "Y");
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors"
              >
                차단
              </button>
            ) : (
              // 차단 상태
              <button
                onClick={() => {
                  blockFriendBtnClick(data.userNo, "N");
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors"
              >
                차단 해제
              </button>
            )}
            <button
              onClick={() => {
                onOpenChat(data.userNo);
                setIsMenuOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors"
            >
              채팅방 이동
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
