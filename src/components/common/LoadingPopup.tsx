// components/LoadingSpinner.tsx
"use client";

interface LoadingSpinnerProps {
  isLoading: boolean;
  text?: string;
}

export default function LoadingPopup({
  isLoading,
  text = "Loading...",
}: LoadingSpinnerProps) {
  if (!isLoading) return null;

  return (
    <>
      {/* 딤처리 배경 (클릭 차단) */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={(e) => e.preventDefault()}
      />

      {/* 팝업 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-lg shadow-2xl p-8 flex flex-col items-center gap-4 pointer-events-auto">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
          {text && (
            <p className="text-gray-800 text-base font-medium">{text}</p>
          )}
        </div>
      </div>
    </>
  );
}
