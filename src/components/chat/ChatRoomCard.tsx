import { ISearchChatRoomListResData } from "@/interface/chat/interfaceChat";
import dayjs from "dayjs";

// ChatRoomCard.tsx
interface Props {
  data: ISearchChatRoomListResData;
  onClick: () => void;
}

export default function ChatRoomCard(props: Props) {
  const { data, onClick } = props;

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-4 border-b hover:bg-accent cursor-pointer transition-colors"
    >
      {/* 프로필 이미지 */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
          {false ? (
            <img
              src={"/"}
              alt={data.roomName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-lg font-semibold text-muted-foreground">
              {data.roomName}
            </span>
          )}
        </div>
        {/* {data.unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center px-1.5">
            {data.unreadCount > 99 ? "99+" : data.unreadCount}
          </div>
        )} */}
      </div>

      {/* 채팅방 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-sm truncate">{data.roomName}</h3>
          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
            {formatTime(dayjs(data.lastMsgCreateTm).format("YYYYMMDDhhmmss"))}
          </span>
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {data.lastMsgContent || "메시지가 없습니다"}
        </p>
      </div>
    </div>
  );
}

// 시간 포맷팅 헬퍼
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // 오늘: 시간만 표시
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } else if (diffDays === 1) {
    return "어제";
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else {
    // 일주일 이상: 날짜 표시
    return date.toLocaleDateString("ko-KR", {
      month: "numeric",
      day: "numeric",
    });
  }
}
