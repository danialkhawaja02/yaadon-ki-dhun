import React from "react";
import { PlayerProvider } from "../components/player/player-provider";
import MainLayout from "../components/main-layout";

export default function Home() {
  return (
    <PlayerProvider>
      <MainLayout />
    </PlayerProvider>
  );
}
