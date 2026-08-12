"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePlayer } from "./player-provider";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

export default function VideoPanel() {
  const {
    currentTrack,
    currentPlaylistId,
    isPlaying,
    registerPlayer,
    updateProgress,
    onTrackEnded,
    onPlayerError,
    setIsPlayingState,
    syncActiveTrack,
  } = usePlayer();

  const playerRef = useRef<any>(null);
  const elementId = "yt-player-iframe-node";
  const [isReady, setIsReady] = useState(false);
  
  // Track the actual YouTube playlist ID loaded in the player to avoid race conditions
  const loadedPlaylistIdRef = useRef<string | null>(null);

  // Sync active track details from player data
  const syncActiveTrackData = (playerInstance: any) => {
    if (playerInstance && typeof playerInstance.getVideoData === "function") {
      try {
        const videoData = playerInstance.getVideoData();
        const duration = playerInstance.getDuration() || 0;
        const playlist = playerInstance.getPlaylist() || [];
        const index = playerInstance.getPlaylistIndex() || 0;
        const total = playlist.length || 1;

        if (videoData && videoData.video_id) {
          syncActiveTrack(videoData, duration, index, total);
        }
      } catch (err) {
        console.error("Error syncing active track data:", err);
      }
    }
  };

  // Initialize YouTube IFrame Player (Once on mount)
  useEffect(() => {
    let active = true;

    const initPlayer = () => {
      if (!active) return;
      try {
        playerRef.current = new window.YT.Player(elementId, {
          playerVars: {
            autoplay: 1, // Force autoplay on reload
            controls: 0,
            rel: 0,
            modestbranding: 1,
            origin: typeof window !== "undefined" ? window.location.origin : "",
            listType: "playlist",
            list: currentPlaylistId === "ghazals" ? "PLK4FtdgIFLYQ" : "PLHIETQTp5UV8",
          },
          events: {
            onReady: () => {
              if (!active) return;
              setIsReady(true);
              registerPlayer(playerRef.current);
              
              // Set the initially loaded playlist ID to prevent double-loading on mount
              loadedPlaylistIdRef.current = currentPlaylistId === "ghazals" ? "PLK4FtdgIFLYQ" : "PLHIETQTp5UV8";
              
              syncActiveTrackData(playerRef.current);
            },
            onStateChange: (event: any) => {
              if (!active) return;
              const state = event.data;
              if (state === window.YT.PlayerState.PLAYING) {
                setIsPlayingState(true);
                syncActiveTrackData(playerRef.current);
              } else if (state === window.YT.PlayerState.PAUSED) {
                setIsPlayingState(false);
              } else if (state === window.YT.PlayerState.ENDED) {
                onTrackEnded();
              }
            },
            onApiChange: () => {
              if (!active) return;
              syncActiveTrackData(playerRef.current);
            },
            onError: (event: any) => {
              if (!active) return;
              onPlayerError(event.data, currentTrack.videoId);
            },
          },
        });
      } catch (err) {
        console.error("Failed to initialize YT.Player:", err);
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      if (!document.getElementById("youtube-api-script")) {
        const tag = document.createElement("script");
        tag.id = "youtube-api-script";
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };
    }

    return () => {
      active = false;
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.error("Error destroying YouTube Player:", e);
        }
      }
      registerPlayer(null);
    };
  }, []); // Run once on mount

  // Watch playback state change
  useEffect(() => {
    if (isReady && playerRef.current) {
      try {
        const state = playerRef.current.getPlayerState?.();
        if (isPlaying && state !== window.YT.PlayerState.PLAYING) {
          playerRef.current.playVideo?.();
        } else if (!isPlaying && state === window.YT.PlayerState.PLAYING) {
          playerRef.current.pauseVideo?.();
        }
      } catch (err) {
        console.error("Error playing/pausing video panel:", err);
      }
    }
  }, [isPlaying, isReady]);

  // Watch playlist change from context to trigger loading new playlist in player
  useEffect(() => {
    if (!isReady || !playerRef.current || typeof playerRef.current.loadPlaylist !== "function") return;
    
    const targetListId = currentPlaylistId === "ghazals" ? "PLK4FtdgIFLYQ" : "PLHIETQTp5UV8";
    
    // Only call loadPlaylist if the target playlist is actually different from the loaded one
    if (loadedPlaylistIdRef.current === targetListId) return;

    try {
      // Use direct string ID loading to avoid object configuration bugs in the YT Player API
      playerRef.current.loadPlaylist(targetListId, 0);
      loadedPlaylistIdRef.current = targetListId;
    } catch (err) {
      console.warn("Could not load playlist:", err);
    }
  }, [currentPlaylistId, isReady]);

  // Micro-ticker for progress reports
  useEffect(() => {
    let intervalId: any;
    if (isReady && isPlaying && playerRef.current) {
      intervalId = setInterval(() => {
        try {
          if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
            const currentTime = playerRef.current.getCurrentTime();
            const duration = playerRef.current.getDuration() || 0;
            updateProgress(currentTime, duration);
          }
        } catch (err) {
          console.error("Error reporting progress in panel:", err);
        }
      }, 250);
    }
    return () => clearInterval(intervalId);
  }, [isReady, isPlaying]);

  return (
    <div className="relative w-full h-full rounded overflow-hidden shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] border border-charcoal/20 flex items-center justify-center bg-black">
      {/* Hidden YouTube player iframe node positioned off-screen */}
      <div className="absolute top-[-9999px] left-[-9999px] w-[1px] h-[1px] opacity-0 pointer-events-none">
        <div id={elementId} />
      </div>

      {/* Dynamic cover: show retro CSS cassette tape if placeholder, else show YouTube thumbnail */}
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
