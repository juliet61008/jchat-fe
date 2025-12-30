// components/BackHeader.tsx
"use client";

import { ChevronLeft, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface Props {
  title: string;
  onBack?: () => void;
  menu?: boolean;
  menuProps?: {
    value: string | number;
    name: string;
    function: () => void;
  }[];
}

export default function BackHeader(props: Props) {
  const { title, onBack, menu, menuProps } = props;

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // router
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  /**
   * 메뉴버튼클릭
   */
  const menuBtnClick = () => {
    setIsMenuOpen((prev) => !prev);
  };

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
    <div className="border-b bg-card px-4 py-3 flex items-center gap-3 flex-shrink-0 sticky top-0 z-10">
      <button
        onClick={handleBack}
        className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-full transition-colors"
      >
        <ChevronLeft size={24} />
      </button>
      <h2 className="font-semibold text-lg">{title}</h2>
      {menu && (
        <>
          <Menu className="ml-auto" onClick={menuBtnClick} />
          {isMenuOpen && menuProps && (
            <>
              {menuProps.map((obj, idx) => (
                <div
                  key={idx}
                  ref={menuRef}
                  className="absolute right-0 mt-1 w-36 bg-card border rounded-lg shadow-lg overflow-hidden z-20"
                >
                  <button
                    onClick={() => {
                      if (obj.function) {
                        obj.function();
                      }
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors"
                  >
                    {obj.name}
                  </button>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}
