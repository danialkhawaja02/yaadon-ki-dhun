"use client";

import React from "react";
import { usePlayer } from "./player/player-provider";
import TopBar from "./top-bar";
import GrainOverlay from "./grain-overlay";
import PlaylistSwitcher from "./player/playlist-switcher";
import DesktopPlayer from "./player/desktop-player";
import MobilePlayer from "./player/mobile-player";

export default function MainLayout() {
  const { isMobile, mounted } = usePlayer();

  return (
    <main
      className="relative flex h-dvh max-h-dvh flex-col items-center justify-between overflow-hidden"
      style={{
        paddingTop: isMobile
          ? "calc(max(0.5rem, env(safe-area-inset-top)) + 1rem)"
          : "calc(max(1.25rem, env(safe-area-inset-top)) + 2rem)",
        paddingBottom: isMobile
          ? "max(0.5rem, env(safe-area-inset-bottom))"
          : "max(1.25rem, env(safe-area-inset-bottom))",
        paddingLeft: "max(1rem, env(safe-area-inset-left))",
        paddingRight: "max(1rem, env(safe-area-inset-right))",
      }}
    >
      {/* 1. Fixed Background Artwork */}
      <div className="hero-bg" aria-hidden="true" />

      {/* 2. Atmospheric Gradient Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/80 pointer-events-none -z-20"
        aria-hidden="true"
      />

      {/* 3. Paper / Cassette Cover printed texture grain overlay */}
      <GrainOverlay />

      {/* 4. Top Pinned Information Row (Independent pins) */}
      <TopBar />

      {/* 5. Center Mohalla Title Graphic Area (Stretches to keep background visible) */}
      <div className="flex-1 min-h-0 flex items-center justify-center pointer-events-none select-none py-2 sm:py-4 animate-fadeIn" aria-hidden="true">
        <img
          src="/pic.webp"
          alt="Yaadon Ki Dhun"
          className="max-h-[22vh] sm:max-h-[34vh] w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
        />
      </div>

      {/* 6. Centered Physical-inspired Music Player & Navigation Console */}
      <div className="w-full max-w-xl flex flex-col items-center gap-3 sm:gap-4 z-10 shrink-0 pointer-events-auto mt-0">
        {mounted ? (
          <>
            {/* The main horizontal hi-fi console */}
            {isMobile ? <MobilePlayer /> : <DesktopPlayer />}
            
            {/* Playlist switcher below the player casing */}
            <div className="w-full max-w-md px-1">
              <PlaylistSwitcher />
            </div>
          </>
        ) : (
          /* Hydration loader panel */
          <div className="w-full flex flex-col items-center gap-3 opacity-45">
            <div className="h-8 w-40 bg-white/10 rounded-md animate-pulse" />
            <div className="h-[120px] w-full bg-white/5 rounded-[8px] animate-pulse" />
          </div>
        )}
      </div>
    </main>
  );
}
