'use client';

import BottomSheet, { BottomSheetProps } from '@/components/common/BottomSheet';
import { IComOtherUser } from '@/interface/mem/interfaceMemFriend';

interface Props {
  bottomSheetProps: BottomSheetProps;
  data?: IComOtherUser;
}

const FriendProfileBottomSheet = (props: Props) => {
  const { bottomSheetProps, data } = props;

  return (
    <BottomSheet {...bottomSheetProps}>
      <>
        <div>userNo : {data?.userNo}</div>
        <div>id : {data?.id}</div>
      </>
    </BottomSheet>
  );
};

export default FriendProfileBottomSheet;
