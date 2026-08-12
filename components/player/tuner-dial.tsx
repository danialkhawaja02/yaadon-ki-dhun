"use client";

import React, { useRef } from "react";
import { usePlayer } from "./player-provider";

export default function TunerDial() {
  const { tuneFrequency, changeTuning } = usePlayer();
  const containerRef = useRef<HTMLDivElement>(null);

  const needlePct = Math.max(0, Math.min(100, ((tuneFrequency - 88.0) / 20.0) * 100));

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    const updateTuning = (clientX: number) => {
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percent = x / rect.width;
      const freq = 88.0 + percent * 20.0;
      changeTuning(freq);
    };

    updateTuning(e.clientX);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      updateTuning(moveEvent.clientX);
    };

    const handlePointerUp = () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      className="relative w-full flex flex-col select-none cursor-pointer touch-none py-1 mt-0.5"
      role="slider"
      aria-valuemin={88.0}
      aria-valuemax={108.0}
      aria-valuenow={tuneFrequency}
      aria-label="Radio frequency scan dial"
    >
      {/* Scale numbers (88 - 108 MHz) */}
      <div className="flex justify-between w-full text-[8px] sm:text-[8.5px] font-mono text-needle/60 px-0.5 font-bold leading-none mb-0.5 pointer-events-none">
        <span>88</span>
        <span>92</span>
        <span>96</span>
        <span>100</span>
        <span>104</span>
        <span>108</span>
      </div>
      {/* Dial Ticks and Needle */}
      <div className="h-3.5 w-full bg-black/50 border border-charcoal/80 rounded-sm relative overflow-hidden flex items-end pb-0.5 pointer-events-none">
        <div className="absolute inset-0 flex justify-between px-0.5 opacity-20">
          {Array.from({ length: 21 }).map((_, i) => (
            <div key={i} className="bg-needle w-[1px] h-full" />
          ))}
        </div>
        {/* Glowing frequency needle line */}
        <div
          className="absolute top-0 bottom-0 w-[1.5px] bg-coral"
          style={{
            left: `${needlePct}%`,
            marginLeft: "-0.75px",
            boxShadow: "0 0 3px 0.5px #e0785a, 0 0 6px #e0785a",
          }}
        />
      </div>
    </div>
  );
}
