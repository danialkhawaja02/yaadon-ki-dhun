"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePlayer } from "./player-provider";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

/**
 * VideoPanel – YouTube IFrame player wrapper.
 *
 * ARCHITECTURE: This component is rendered with `key={currentPlaylistId}`.
 * When the user switches playlists, React unmounts the old VideoPanel and
 * mounts a fresh one. Each mount creates a brand-new YouTube player with
 * the correct playlist baked into `playerVars`. This eliminates:
 *   - Stale closures (every mount gets current context values)
 *   - loadPlaylist() API quirks (we never call it)
 *   - Race conditions between old/new playlist data
 */
export default function VideoPanel() {
  const {
    currentTrack,
    currentPlaylistId,
    youtubeListId,
    isPlaying,
    registerPlayer,
    updateProgress,
    onTrackEnded,
    onPlayerError,
    setIsPlayingState,
    syncActiveTrack,
  } = usePlayer();

  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const elementId = `yt-player-${currentPlaylistId}`;

  // ── Refs for the latest context callbacks ──────────────────────────
  // The YT player's event handlers are registered once in the init effect
  // and never re-created. By reading from refs, those handlers always
  // call the current (not stale) versions of the provider functions.
  const refs = useRef({ syncActiveTrack, onTrackEnded, onPlayerError, setIsPlayingState, currentTrack });
  refs.current = { syncActiveTrack, onTrackEnded, onPlayerError, setIsPlayingState, currentTrack };

  /** Pull metadata from the live YT player and push it into context. */
  const syncTrackFromPlayer = (player: any) => {
    if (!player || typeof player.getVideoData !== "function") return;
    try {
      const videoData = player.getVideoData();
      const duration = player.getDuration() || 0;
      const playlist = player.getPlaylist() || [];
      const index = player.getPlaylistIndex() || 0;
      const total = playlist.length || 1;
      if (videoData?.video_id) {
        refs.current.syncActiveTrack(videoData, duration, index, total);
      }
    } catch (err) {
      console.error("Error syncing track data:", err);
    }
  };

  // ── Create YouTube player (runs once per mount) ────────────────────
  useEffect(() => {
    let active = true;

    const createPlayer = () => {
      if (!active) return;
      try {
        playerRef.current = new window.YT.Player(elementId, {
          playerVars: {
            autoplay: 1,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            origin: typeof window !== "undefined" ? window.location.origin : "",
            listType: "playlist",
            list: youtubeListId,
          },
          events: {
            onReady: () => {
              if (!active) return;
              setIsReady(true);
              registerPlayer(playerRef.current);
              syncTrackFromPlayer(playerRef.current);
            },
            onStateChange: (event: any) => {
              if (!active) return;
              const state = event.data;
              if (state === window.YT.PlayerState.PLAYING) {
                refs.current.setIsPlayingState(true);
                syncTrackFromPlayer(playerRef.current);
              } else if (state === window.YT.PlayerState.PAUSED) {
                refs.current.setIsPlayingState(false);
              } else if (state === window.YT.PlayerState.ENDED) {
                refs.current.onTrackEnded();
              }
            },
            onApiChange: () => {
              if (!active) return;
              syncTrackFromPlayer(playerRef.current);
            },
            onError: (event: any) => {
              if (!active) return;
              refs.current.onPlayerError(event.data, refs.current.currentTrack.videoId);
            },
          },
        });
      } catch (err) {
        console.error("Failed to create YT.Player:", err);
      }
    };

    // If YouTube API is already loaded, create immediately
    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      // Load the IFrame API script (once globally)
      if (!document.getElementById("youtube-api-script")) {
        const tag = document.createElement("script");
        tag.id = "youtube-api-script";
        tag.src = "https://www.youtube.com/iframe_api";
        const first = document.getElementsByTagName("script")[0];
        first.parentNode?.insertBefore(tag, first);
      }
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prev) prev();
        createPlayer();
      };
    }

    // Cleanup: destroy the player when this component unmounts
    return () => {
      active = false;
      if (playerRef.current?.destroy) {
        try { playerRef.current.destroy(); } catch (_) { /* ignore */ }
      }
      playerRef.current = null;
      registerPlayer(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Runs once per mount — key-based remount handles playlist changes

  // ── Sync external play/pause state with the YT player ──────────────
  useEffect(() => {
    if (!isReady || !playerRef.current) return;
    try {
      const state = playerRef.current.getPlayerState?.();
      if (isPlaying && state !== window.YT.PlayerState.PLAYING) {
        playerRef.current.playVideo?.();
      } else if (!isPlaying && state === window.YT.PlayerState.PLAYING) {
        playerRef.current.pauseVideo?.();
      }
    } catch (err) {
      console.error("Error syncing play/pause:", err);
    }
  }, [isPlaying, isReady]);

  // ── Progress ticker ────────────────────────────────────────────────
  useEffect(() => {
    if (!isReady || !isPlaying || !playerRef.current) return;
    const id = setInterval(() => {
      try {
        if (playerRef.current?.getCurrentTime) {
          const t = playerRef.current.getCurrentTime();
          const d = playerRef.current.getDuration() || 0;
          updateProgress(t, d);
        }
      } catch (_) { /* ignore */ }
    }, 250);
    return () => clearInterval(id);
  }, [isReady, isPlaying]);

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-full rounded overflow-hidden shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] border border-charcoal/20 flex items-center justify-center bg-black">
      {/* Hidden YouTube player iframe (off-screen) */}
      <div className="absolute top-[-9999px] left-[-9999px] w-[1px] h-[1px] opacity-0 pointer-events-none">
        <div id={elementId} />
      </div>

      {/* Cover art: cassette placeholder while loading, YouTube thumbnail once ready */}
      {(!currentTrack.videoId || currentTrack.videoId === "") ? (
        <div className="w-full h-full bg-[#18120e] flex flex-col items-center justify-center p-2 border border-charcoal/30 rounded select-none">
          {/* Cassette Shell Outline */}
          <div className="w-[86px] h-[54px] bg-[#2a2018] border border-cream/15 rounded flex flex-col justify-between p-1 shadow-[0_2px_6px_rgba(0,0,0,0.5)] relative">
            {/* Cassette Label */}
            <div className="w-full h-5.5 bg-cream/90 rounded-sm flex flex-col justify-center items-center px-1">
              <span className="text-[5.5px] font-sans font-black text-charcoal/80 uppercase tracking-widest leading-none">
                SOOR TAAL
              </span>
              <span className="text-[3.5px] font-mono text-charcoal/50 uppercase leading-none mt-0.5">
                {currentPlaylistId === "ghazals" ? "TAPE A - GHAZALS" : "TAPE B - RETRO POP"}
              </span>
            </div>
            {/* Cassette Windows/Spools */}
            <div className="w-full h-4 bg-black/80 rounded-sm border border-cream/10 flex items-center justify-around px-1 relative">
              <div className="w-3 h-3 rounded-full border border-cream/20 bg-charcoal flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-black relative">
                  <div className="absolute top-0 bottom-0 left-[40%] right-[40%] bg-cream/30 animate-pulse" />
                  <div className="absolute left-0 right-0 top-[40%] bottom-[40%] bg-cream/30 animate-pulse" />
                </div>
              </div>
              <div className="w-3 h-3 rounded-full border border-cream/20 bg-charcoal flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-black relative">
                  <div className="absolute top-0 bottom-0 left-[40%] right-[40%] bg-cream/30 animate-pulse" />
                  <div className="absolute left-0 right-0 top-[40%] bottom-[40%] bg-cream/30 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <img
          src={`https://img.youtube.com/vi/${currentTrack.videoId}/hqdefault.jpg`}
          alt={currentTrack.title}
          className="w-full h-full object-cover transition-opacity duration-300 animate-fadeIn"
          loading="eager"
        />
      )}
    </div>
  );
}
