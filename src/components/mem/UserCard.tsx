'use client';

import FriendProfileBottomSheet from '@/components/mem/FriendProfileBottomSheet';
import { IComOtherUser } from '@/interface/mem/interfaceMemFriend';
import { MoreVertical } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  data: IComOtherUser;
  onOpenChat: (userNo: number) => void;
  onAddFriend: (userNo: number) => void; // 친구추가
  blockFriendBtnClick: (userNo: number, blockYn: 'Y' | 'N') => void; // 차단버튼 클릭
  likeFriendBtnClick: (userNo: number, likeYn: 'Y' | 'N') => void; // 즐겨찾기버튼 클릭
}

export default function UserCard(props: Props) {
  const { data, onOpenChat, onAddFriend, blockFriendBtnClick, likeFriendBtnClick } = props;

  // 메뉴오픈
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  // 프로필바텀시트오픈
  const [isProfileBottomSheetOpen, setIsProfileBottomSheetOpen] = useState<boolean>(false);
  const [profileData, setPropfileData] = useState<IComOtherUser>();

  const menuRef = useRef<HTMLDivElement>(null);

  /**
   * 프로필 바텀시트 클로즈 이벤트
   */
  const onCloseProfileBottomSheet = useCallback(() => {
    setIsProfileBottomSheetOpen(false);
  }, []);

  /**
   * 프로필 이미지 버튼 클릭 이벤트
   */
  const onClickProfileBtn = () => {
    // 프로필데이터 set
    setPropfileData(data);
    // 프로필바텀시트 open
    setIsProfileBottomSheetOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <>
      <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted flex-shrink-0 overflow-hidden relative">
            <button
              type="button"
              onClick={onClickProfileBtn}
              className="w-full h-full flex items-center justify-center text-muted-foreground"
            >
              {data.profileImgUrl ? (
                <>
                  <Image
                    src={data.profileImgUrl}
                    alt={`${data.userNo} profile`}
                    fill
                    className="object-cover"
                  />
                </>
              ) : (
                <>{data.aliasNm ?? data.name}</>
              )}{' '}
              {/* 별칭 ?? 이름 */}
            </button>
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
              <button
                onClick={() => {
                  onOpenChat(data.userNo);
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors"
              >
                채팅방 이동
              </button>
              {/* 친구인 경우 */}
              {data.friendYn === 'Y' && (
                <>
                  {/* 즐겨찾기 아닌 경우 */}
                  {data.likeYn === 'N' && (
                    <button
                      onClick={() => {
                        likeFriendBtnClick(data.userNo, 'Y');
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors"
                    >
                      즐겨찾기
                    </button>
                  )}
                  {/* 즐겨찾기인 경우 */}
                  {data.likeYn === 'Y' && (
                    <button
                      onClick={() => {
                        likeFriendBtnClick(data.userNo, 'N');
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors"
                    >
                      즐겨찾기 해제
                    </button>
                  )}
                </>
              )}
              {/* 친구 아닌 경우 */}
              {data.friendYn === 'N' && (
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
              {data.blockYn === 'N' ? (
                <button
                  onClick={() => {
                    blockFriendBtnClick(data.userNo, 'Y');
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
                    blockFriendBtnClick(data.userNo, 'N');
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors"
                >
                  차단 해제
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <FriendProfileBottomSheet
        bottomSheetProps={{ isOpen: isProfileBottomSheetOpen, onClose: onCloseProfileBottomSheet }}
        data={profileData}
        onOpenChat={onOpenChat}
        likeFriendBtnClick={likeFriendBtnClick}
        blockFriendBtnClick={blockFriendBtnClick}
      />
    </>
  );
}
