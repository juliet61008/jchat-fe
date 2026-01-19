// components/BottomSheet.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type BottomSheetHeight = 'half' | 'full' | 'auto';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  title?: string;
  height?: BottomSheetHeight;
  enableBackButton?: boolean;
}

export default function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  height = 'auto',
  enableBackButton = true,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const lastYRef = useRef(0); // 이전 프레임의 Y 위치
  const currentYRef = useRef(0); // 현재 프레임의 Y 위치

  // 뒤로가기로 닫기
  useEffect(() => {
    if (!enableBackButton) return;

    if (isOpen) {
      window.history.pushState({ bottomSheet: true }, '');

      const handlePopState = () => {
        onClose();
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen, onClose, enableBackButton]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // 바디 스크롤 막기
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 드래그 시작
  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    setStartY(clientY);
    lastYRef.current = clientY;
    currentYRef.current = clientY;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  // 드래그 중
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (clientY: number) => {
      const deltaY = clientY - startY;

      // 아래로만 드래그 가능 (위로는 -20px까지만)
      if (deltaY >= -20) {
        setTranslateY(deltaY);

        // 이전 프레임의 값을 lastY에 저장하고, 현재 값을 currentY에 저장
        lastYRef.current = currentYRef.current;
        currentYRef.current = clientY;
      } else {
        setTranslateY(-20);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      handleMove(e.touches[0].clientY);
    };

    const handleEnd = (endY: number) => {
      setIsDragging(false);

      // 마지막 이동 방향 계산 (currentY가 더 최신 값)
      const dragDirection = currentYRef.current - lastYRef.current;

      console.log(
        'endY:',
        endY,
        'currentY:',
        currentYRef.current,
        'lastY:',
        lastYRef.current,
        'direction:',
        dragDirection
      );

      // 100px 이상 내려간 상태에서 아래 방향(dragDirection >= 0)으로 놓으면 닫기
      if (translateY > 100 && dragDirection >= 0) {
        onClose();
      } else {
        // 그 외의 경우 원래 위치로 되돌리기
        setTranslateY(0);
      }

      setStartY(0);
      lastYRef.current = 0;
      currentYRef.current = 0;
    };

    const handleMouseUp = (e: MouseEvent) => {
      handleEnd(e.clientY);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      handleEnd(e.changedTouches[0].clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, startY, translateY, onClose]);

  // 바텀시트가 열릴 때 초기화
  useEffect(() => {
    if (!isOpen) return;
    const openEvent = () => {
      setTranslateY(0);
      setStartY(0);
      lastYRef.current = 0;
      currentYRef.current = 0;
    };
    openEvent();
  }, [isOpen]);

  if (!isOpen) return null;

  const heightClasses: Record<BottomSheetHeight, string> = {
    half: 'h-[50vh]',
    full: 'h-[90vh]',
    auto: 'max-h-[80vh]',
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end">
      {/* 배경 오버레이 */}
      <div
        className={`
          absolute inset-0 bg-black/50 backdrop-blur-sm
          transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          opacity: isOpen ? Math.max(0.5 - translateY / 500, 0) : 0,
        }}
        onClick={onClose}
      />

      {/* 바텀시트 */}
      <div
        ref={sheetRef}
        className={`
          relative w-full bg-white rounded-t-3xl shadow-2xl
          ${heightClasses[height]}
          ${!isDragging && 'transition-transform duration-300 ease-out'}
        `}
        style={{
          transform: `translateY(${isOpen ? translateY : '100%'}px)`,
        }}
      >
        {/* 상단 핸들 바 (드래그 가능) */}
        <div
          className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={(e) => {
            // 클릭만 했을 때 (드래그 안했을 때)
            if (Math.abs(translateY) < 5) {
              onClose();
            }
          }}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* 헤더 */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* 컨텐츠 */}
        <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(100% - 80px)' }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
