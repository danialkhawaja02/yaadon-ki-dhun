"use client";

import React from "react";
import Clock from "./clock";
import { usePlayer } from "./player/player-provider";

export default function TopBar() {
  const { currentTrack } = usePlayer();

  return (
    <>
      {/* 1. Left Pin: Ticking Clock & Location (Responsive sizes) */}
      <div
        className="fixed z-30 flex flex-col items-start select-none text-left drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]"
        style={{
          top: "max(0.75rem, env(safe-area-inset-top))",
          left: "max(1rem, env(safe-area-inset-left))",
        }}
      >
        <Clock />
        <span className="text-[7.5px] sm:text-[9.5px] font-sans font-black tracking-widest text-cream mt-0.5 leading-none">
          LAHORE, PAKISTAN
        </span>
      </div>

      {/* 2. Center Pin: FM Broadcast (Visible on desktop only, prevents mobile overlap) */}
      <div
        className="hidden sm:flex fixed z-30 flex-col items-center select-none pointer-events-none text-center drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]"
        style={{
          top: "max(1.15rem, env(safe-area-inset-top))",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <div className="flex items-center gap-1.5 text-[9.5px] sm:text-[10.5px] tracking-widest text-cream font-mono font-black uppercase max-w-[200px] sm:max-w-none">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-coral animate-pulse shrink-0" aria-hidden="true" />
          <span className="truncate">
            FM BROADCAST: {currentTrack?.title || "TUNING STATION..."}
          </span>
        </div>
      </div>

      {/* 3. Right Pin: Instagram Profile Link (Responsive sizes) */}
      <nav
        className="fixed z-30 flex items-center gap-1.5 text-[9.5px] sm:text-[11px] tracking-wider font-black text-cream drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]"
        style={{
          top: "max(0.75rem, env(safe-area-inset-top))",
          right: "max(1rem, env(safe-area-inset-right))",
        }}
        aria-label="Instagram link"
      >
        <span className="text-[7.5px] sm:text-[9px] font-sans font-black tracking-widest text-cream select-none mr-0.5">
          FOLLOW
        </span>
        
        <a
          href="https://www.instagram.com/danialsohail02/"
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring p-0.5 rounded hover:scale-105 transition-transform"
          aria-label="Instagram Profile"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current opacity-95 hover:opacity-100 hover:text-cream transition-opacity" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </a>
      </nav>
    </>
  );
}
