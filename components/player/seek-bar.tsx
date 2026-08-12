"use client";

import React, { useRef, useEffect } from "react";
import { usePlayer } from "./player-provider";

export default function SeekBar() {
  const { currentTime, duration, seek, commitSeek } = usePlayer();
  const railRef = useRef<HTMLDivElement>(null);
  
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const currentPctRef = useRef(0);
  
  useEffect(() => {
    currentPctRef.current = progressPct / 100;
  }, [progressPct]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!railRef.current) return;
    const rect = railRef.current.getBoundingClientRect();

    const updatePosition = (clientX: number) => {
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percent = x / rect.width;
      currentPctRef.current = percent;
      seek(percent);
    };

    updatePosition(e.clientX);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      updatePosition(moveEvent.clientX);
    };

    const handlePointerUp = () => {
      commitSeek(currentPctRef.current);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
  };

  return (
    <div
      ref={railRef}
      onPointerDown={handlePointerDown}
      className="relative w-full cursor-pointer touch-none select-none flex flex-col justify-center py-1 h-[14px] sm:h-[16px]"
      role="slider"
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={currentTime}
      aria-label="Seek track position"
    >
      {/* Recessed Progress track with glowing indicators */}
      <div className="h-2 w-full bg-black/60 border border-charcoal/80 rounded-sm relative overflow-hidden pointer-events-none">
        
        {/* Glowing progress fill */}
        <div
          className="absolute left-0 top-0 bottom-0 bg-coral/75"
          style={{ width: `${progressPct}%` }}
        />

        {/* Dynamic tick indicators */}
        <div className="absolute inset-0 flex justify-between px-0.5 opacity-20">
          {Array.from({ length: 11 }).map((_, i) => (
            <div key={i} className="bg-needle w-[1px] h-full" />
          ))}
        </div>

        {/* Seeking needle indicator */}
        <div
          className="absolute top-0 bottom-0 w-[1.5px] bg-white transition-opacity duration-150 shadow-[0_0_4px_#fff]"
          style={{
            left: `${progressPct}%`,
            marginLeft: "-0.75px",
            boxShadow: "0 0 3px 0.5px #fff, 0 0 6px #fff",
          }}
        />
      </div>
    </div>
  );
}
