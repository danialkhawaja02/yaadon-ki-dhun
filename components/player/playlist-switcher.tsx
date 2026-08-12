"use client";

import React from "react";
import { usePlayer } from "./player-provider";

export default function PlaylistSwitcher() {
  const { playlists, currentPlaylistId, changePlaylist, accentColor } = usePlayer();

  // Era-appropriate custom vector icons mapping (§33)
  const getPlaylistIcon = (id: string) => {
    switch (id) {
      case "ghazals":
        // Tape Reel Icon
        return (
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-3-8c.83 0 1.5-.67 1.5-1.5S9.83 9 9 9s-1.5.67-1.5 1.5S8.17 11 9 11zm6 0c.83 0 1.5-.67 1.5-1.5S15.83 9 15 9s-1.5.67-1.5 1.5s.67 1.5 1.5 1.5zm-3 4c.83 0 1.5-.67 1.5-1.5S12.83 13 12 13s-1.5.67-1.5 1.5s.67 1.5 1.5 1.5z" />
          </svg>
        );
      case "pop":
        // Cassette Tape Icon
        return (
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 4H2v16h20V4zm-2 14H4V6h16v12zm-3-8H7v4h10v-4zm-8 3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
          </svg>
        );
      case "classics":
      default:
        // Transistor Radio Icon
        return (
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 6h-8.26l1.79-2.98c.11-.19.05-.44-.14-.55-.19-.11-.44-.05-.55.14L10.74 6H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm8-6h-3V8h3v4z" />
          </svg>
        );
    }
  };

  return (
    <div
      className="flex items-center justify-center gap-3 sm:gap-6 overflow-x-auto select-none w-full scrollbar-none font-mono text-[9.5px] sm:text-[11px] py-0.5 border-t border-b border-cream/5"
      role="tablist"
      aria-label="Audio categories"
    >
      {/* NOW PLAYING Tag Indicator */}
      <span className="text-cream/35 tracking-widest font-bold uppercase shrink-0 border-r border-cream/10 pr-4">
        NOW PLAYING
      </span>

      {/* Categories selectors */}
      <div className="flex items-center gap-5 sm:gap-8">
        {playlists.map((pl) => {
          const isActive = pl.id === currentPlaylistId;

          return (
            <button
              key={pl.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`playlist-panel-${pl.id}`}
              onClick={() => changePlaylist(pl.id)}
              className={`
                flex items-center gap-2 py-2 focus-ring border-b-2 transition-all duration-300 font-semibold cursor-pointer
                ${isActive
                  ? "border-current opacity-100"
                  : "border-transparent text-cream/55 hover:text-cream/90 hover:border-cream/20 opacity-75 hover:opacity-100"
                }
              `}
              style={{
                color: isActive ? accentColor : undefined,
              }}
            >
              {/* Retro Icon representation */}
              <span className="shrink-0">{getPlaylistIcon(pl.id)}</span>
              
              <span className="tracking-wider uppercase font-bold">
                {pl.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
