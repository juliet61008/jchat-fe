'use client';

import BottomSheet, { BottomSheetProps } from '@/components/common/BottomSheet';
import { IComOtherUser } from '@/interface/mem/interfaceMemFriend';
import Image from 'next/image';

interface Props {
  bottomSheetProps: BottomSheetProps;
  data?: IComOtherUser;
  onOpenChat: (userNo: number) => void;
  blockFriendBtnClick: (userNo: number, blockYn: 'Y' | 'N') => void; // 차단버튼 클릭
  likeFriendBtnClick: (userNo: number, likeYn: 'Y' | 'N') => void; // 즐겨찾기버튼 클릭
}

const FriendProfileBottomSheet = (props: Props) => {
  const { bottomSheetProps, data, onOpenChat, blockFriendBtnClick, likeFriendBtnClick } = props;

  if (!data) return <></>;

  return (
    <BottomSheet {...bottomSheetProps}>
      <div className="px-6 py-4">
        {/* 프로필 헤더 */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200">
            {data.profileImgUrl ? (
              <Image
                src={data.profileImgUrl}
                alt={`${data.userNo} profile`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-semibold text-gray-500">
                {(data.aliasNm ?? data.name).charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{data.id}</h3>
            <p className="text-sm text-gray-500">User #{data.userNo}</p>
          </div>
        </div>

        {/* 상태 메시지 */}
        {/* {data.statusMessage && (
          <div className="mb-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{data.statusMessage}</p>
          </div>
        )} */}

        {/* 액션 버튼들 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={() => {
              onOpenChat(data.userNo);
            }}
            className="px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            메시지 보내기
          </button>
          <button
            type="button"
            onClick={() => {
              likeFriendBtnClick(data.userNo, data.likeYn === 'Y' ? 'N' : 'Y');
            }}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            즐겨찾기
          </button>
        </div>

        {/* 추가 정보 */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">아이디</span>
            <span className="text-sm font-medium text-gray-900">{data.id}</span>
          </div>

          {/* {data.email && (
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">이메일</span>
              <span className="text-sm font-medium text-gray-900">{data.email}</span>
            </div>
          )}

          {data.phoneNumber && (
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">전화번호</span>
              <span className="text-sm font-medium text-gray-900">{data.phoneNumber}</span>
            </div>
          )} */}
        </div>

        {/* 위험 액션 */}
        <div className="mt-6 pt-4 border-t">
          <button className="w-full px-4 py-3 text-red-500 font-medium hover:bg-red-50 rounded-lg transition-colors">
            차단
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};

export default FriendProfileBottomSheet;
