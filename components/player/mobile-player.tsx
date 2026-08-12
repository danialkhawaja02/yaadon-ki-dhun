"use client";

import React from "react";
import DesktopPlayer from "./desktop-player";

export default function MobilePlayer() {
  // Render the unified, compact horizontal player directly on mobile viewports
  return (
    <div className="w-full flex justify-center px-1">
      <DesktopPlayer />
    </div>
  );
}
