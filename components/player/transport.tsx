"use client";

import React from "react";
import { usePlayer } from "./player-provider";

export default function Transport() {
  const { isPlaying, togglePlay, next, previous } = usePlayer();

  return (
    <div className="flex items-center justify-between w-full select-none font-mono">
      
      {/* 1. Rewind / Prev */}
      <button
        onClick={previous}
        className="mechanical-key focus-ring w-[24px] h-[22px] flex items-center justify-center text-[7.5px] font-bold"
        aria-label="Previous track"
      >
        <span>◀◀</span>
      </button>

      {/* 2. Play */}
      <button
        onClick={() => {
          if (!isPlaying) togglePlay();
        }}
        className={`mechanical-key focus-ring w-[24px] h-[22px] flex items-center justify-center text-[7.5px] font-bold ${
          isPlaying ? "active play-active" : ""
        }`}
        aria-label="Play"
      >
        <span>▶</span>
      </button>

      {/* 3. Pause */}
      <button
        onClick={() => {
          if (isPlaying) togglePlay();
        }}
        className={`mechanical-key focus-ring w-[24px] h-[22px] flex items-center justify-center text-[7.5px] font-bold ${
          !isPlaying ? "active" : ""
        }`}
        aria-label="Pause"
      >
        <span>❙❙</span>
      </button>

      {/* 4. Fast Forward / Next */}
      <button
        onClick={next}
        className="mechanical-key focus-ring w-[24px] h-[22px] flex items-center justify-center text-[7.5px] font-bold"
        aria-label="Next track"
      >
        <span>▶▶</span>
      </button>

    </div>
  );
}
