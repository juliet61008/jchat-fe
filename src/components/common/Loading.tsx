// components/LoadingSpinner.tsx
"use client";

interface LoadingSpinnerProps {
  isLoading: boolean;
  text?: string;
}

export default function Loading({
  isLoading,
  text = "Loading...",
}: LoadingSpinnerProps) {
  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()} // 클릭 이벤트 차단
    >
      <div className="flex flex-col items-center gap-4">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
        {text && <p className="text-gray-800 text-lg font-semibold">{text}</p>}
      </div>
    </div>
  );
}
