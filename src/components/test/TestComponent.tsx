'use client';

import BottomSheet from '@/components/common/BottomSheet';
import { useState } from 'react';

const TestComponent = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <div>
      <button
        onClick={() => {
          setIsOpen(true);
        }}
      >
        오픈
      </button>
      <BottomSheet isOpen={isOpen} onClose={onClose}>
        <div className="overflow-y-auto w-full h-full">
          <div>내용내용내용내용내용내용내용내용내용내용내용내용</div>
          <div>내용내용내용내용내용내용내용내용내용내용내용내용</div>
          <div>내용내용내용내용내용내용내용내용내용내용내용내용</div>
          <div>내용내용내용내용내용내용내용내용내용내용내용내용</div>
          <div>내용내용내용내용내용내용내용내용내용내용내용내용</div>
          <div>내용내용내용내용내용내용내용내용내용내용내용내용</div>
          <div>내용내용내용내용내용내용내용내용내용내용내용내용</div>
          <div>내용내용내용내용내용내용내용내용내용내용내용내용</div>
          <div>내용내용내용내용내용내용내용내용내용내용내용내용</div>
          <div>내용내용내용내용내용내용내용내용내용내용내용내용</div>
          <div>내용내용내용내용내용내용내용내용내용내용내용내용</div>
          <div>내용내용내용내용내용내용내용내용내용내용내용내용</div>
          <div>내용내용내용내용내용내용내용내용내용내용내용내용</div>
          <div>내용내용내용내용내용내용내용내용내용내용내용내용</div>
          <div>내용내용내용내용내용내용내용내용내용내용내용내용</div>
          <div>내용내용내용내용내용내용내용내용내용내용내용내용</div>
          <div>내용내용내용내용내용내용내용내용내용내용내용내용</div>
          <div>내용내용내용내용내용내용내용내용내용내용내용내용</div>
          <div>내용내용내용내용내용내용내용내용내용내용내용내용</div>
          <div>내용내용내용내용내용내용내용내용내용내용내용내용</div>
          <div>내용내용내용내용내용내용내용내용내용내용내용내용</div>
          <div>내용내용내용내용내용내용내용내용내용내용내용내용</div>
        </div>
      </BottomSheet>
    </div>
  );
};
export default TestComponent;
