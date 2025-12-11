// components/BackHeader.tsx
"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackHeaderProps {
  title: string;
  onBack?: () => void;
}

export default function BackHeader({ title, onBack }: BackHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="border-b bg-card px-4 py-3 flex items-center gap-3 flex-shrink-0 sticky top-0 z-10">
      <button
        onClick={handleBack}
        className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-full transition-colors"
      >
        <ChevronLeft size={24} />
      </button>
      <h2 className="font-semibold text-lg">{title}</h2>
    </div>
  );
}
