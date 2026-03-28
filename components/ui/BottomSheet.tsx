"use client";

import { useState, useRef, useCallback, type ReactNode } from "react";

interface BottomSheetProps {
  children: ReactNode;
}

type SheetPosition = "collapsed" | "half" | "full";

const POSITIONS: Record<SheetPosition, string> = {
  collapsed: "calc(100% - 120px)",
  half: "50%",
  full: "60px",
};

export function BottomSheet({ children }: BottomSheetProps) {
  const [position, setPosition] = useState<SheetPosition>("half");
  const startY = useRef(0);
  const currentTop = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      startY.current = e.touches[0].clientY;
      const rect = sheetRef.current?.getBoundingClientRect();
      currentTop.current = rect?.top ?? 0;
    },
    []
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const deltaY = e.changedTouches[0].clientY - startY.current;
      const windowHeight = window.innerHeight;
      const currentPercent = (currentTop.current + deltaY) / windowHeight;

      if (deltaY < -50) {
        // Swipe up
        setPosition(position === "collapsed" ? "half" : "full");
      } else if (deltaY > 50) {
        // Swipe down
        setPosition(position === "full" ? "half" : "collapsed");
      } else {
        // Snap to nearest
        if (currentPercent < 0.3) setPosition("full");
        else if (currentPercent < 0.65) setPosition("half");
        else setPosition("collapsed");
      }
    },
    [position]
  );

  return (
    <div
      ref={sheetRef}
      className="absolute left-0 right-0 bottom-0 bottom-sheet rounded-t-2xl z-20"
      style={{
        top: POSITIONS[position],
        background: "var(--surface)",
        boxShadow: "0 -4px 30px rgb(0 0 0 / 0.1)",
      }}
    >
      <div
        className="drag-handle cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() =>
          setPosition(position === "collapsed" ? "half" : "collapsed")
        }
      />
      <div
        className="overflow-y-auto px-4 pb-4"
        style={{ maxHeight: "calc(100% - 24px)" }}
      >
        {children}
      </div>
    </div>
  );
}
