"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { track } from "@vercel/analytics";
import { PLAYLISTS, Track, Playlist } from "../../lib/tracks";
import { playClickSound, playStaticSwoosh } from "../../lib/audio-effects";

// Clean and extract artist/title from raw YouTube playlist video metadata
export function cleanYouTubeMetadata(rawTitle: string, rawAuthor: string) {
  let title = rawTitle;
  let artist = rawAuthor;

  // Clean common YouTube suffixes
  title = title.replace(/\(Official (Video|Audio|Music Video)\)/gi, "");
  title = title.replace(/\[Official (Video|Audio|Music Video)\]/gi, "");
  title = title.replace(/\((Retro|Classic|HD|Remastered|1080p|Cover)\)/gi, "");
  title = title.replace(/\[(Retro|Classic|HD|Remastered|1080p|Cover)\]/gi, "");
  title = title.replace(/\b(19\d{2}|20\d{2})\b/g, ""); // Remove year
  title = title.trim();

  // Split by common delimiters like " - ", " | ", " : "
  const splitters = [" - ", " | ", " : ", " – ", " — "];
  let splitFound = false;
  for (const split of splitters) {
    if (title.includes(split)) {
      const parts = title.split(split);
      if (parts.length >= 2) {
        const part1 = parts[0].trim();
        const part2 = parts[1].trim();
        
        const knownArtists = [
          "mehdi hassan", "farida khanum", "vital signs", "ali haider", 
          "strings", "nusrat", "nazia", "zohaib", "junaid", "alamgir", 
          "hassan jahangir", "nusrat fateh", "nayyara noor", "iqbal bano"
        ];
        const p1Lower = part1.toLowerCase();
        const p2Lower = part2.toLowerCase();
        
        const p1IsArtist = knownArtists.some(name => p1Lower.includes(name));
        const p2IsArtist = knownArtists.some(name => p2Lower.includes(name));
        
        if (p1IsArtist && !p2IsArtist) {
          artist = part1;
          title = part2;
        } else if (p2IsArtist && !p1IsArtist) {
          artist = part2;
          title = part1;
        } else {
          artist = part1;
          title = part2;
        }
        splitFound = true;
        break;
      }
    }
  }

  if (!splitFound) {
    artist = rawAuthor.replace(/- Topic/gi, "").trim();
  }

  // Clean trailing elements
  title = title.replace(/^["'“]|["'”]$/g, "").replace(/\s+/g, " ").trim();
  artist = artist.replace(/^["'“]|["'”]$/g, "").replace(/\s+/g, " ").trim();

  return { title, artist };
}

interface PlayerContextType {
  playlists: Playlist[];
  currentPlaylistId: string;
  currentTrackIndex: number;
  currentTrack: Track;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isMobile: boolean;
  mounted: boolean;
  accentColor: string;
  
  // Custom analog hi-fi console parameters
  volume: number;
  tuneFrequency: number;
  signalStrength: number;
  changeVolume: (vol: number) => void;
  changeTuning: (freq: number) => void;
  trackFrequency: number;

  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  changePlaylist: (playlistId: string) => void;
  seek: (percent: number) => void;
  commitSeek: (percent: number) => void;
  
  // YouTube API integration callbacks
  registerPlayer: (player: any) => void;
  updateProgress: (current: number, total: number) => void;
  onTrackEnded: () => void;
  onPlayerError: (code: number, videoId: string) => void;
  setIsPlayingState: (playing: boolean) => void;
  syncActiveTrack: (videoData: any, duration: number, index: number, total: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Helper to determine simulated station frequency for a track
export const getTrackFrequency = (index: number, total: number) => {
  if (total <= 1) return 90.4;
  return 88.0 + (index + 0.5) * (20.0 / total);
};

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentPlaylistId, setCurrentPlaylistId] = useState("ghazals");
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Dynamic metadata states representing real-time playlist tracks
  const [dynamicTrack, setDynamicTrack] = useState<Track | null>(null);
  const [dynamicPlaylistLength, setDynamicPlaylistLength] = useState<number>(0);

  const [volume, setVolumeState] = useState(80);
  const [tuneFrequency, setTuneFrequency] = useState(90.0); // Restored FM tuner default
  const [signalStrength, setSignalStrength] = useState(1.0);

  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  const playerRef = useRef<any>(null);
  
  // Seek locking mechanisms to prevent YouTube current-time state override glitch
  const isSeekingRef = useRef(false);
  const seekTimeoutRef = useRef<any>(null);

  // Resolvers for initial placeholder states before YouTube metadata loads
  const GHAZAL_PLACEHOLDER: Track = {
    id: "ghazal-placeholder",
    title: "Tuning Receiver...",
    artist: "Soor Taal FM",
    film: "Ghazal Evenings",
    year: 1989,
    duration: "00:00",
    videoId: ""
  };

  const POP_PLACEHOLDER: Track = {
    id: "pop-placeholder",
    title: "Tuning Receiver...",
    artist: "Soor Taal FM",
    film: "Pakistani Pop",
    year: 1992,
    duration: "00:00",
    videoId: ""
  };

  const defaultTrack = currentPlaylistId === "ghazals" ? GHAZAL_PLACEHOLDER : POP_PLACEHOLDER;
  const currentTrack = dynamicTrack && dynamicTrack.id ? dynamicTrack : defaultTrack;

  const totalTracks = dynamicPlaylistLength > 0 ? dynamicPlaylistLength : 5;
  const trackFrequency = getTrackFrequency(currentTrackIndex, totalTracks);

  const accentColor = 
    currentPlaylistId === "ghazals" 
      ? "var(--color-ochre)" 
      : "var(--color-coral)";

  // Detect mobile viewports on mount
  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cleanup seek lock timer on unmount
  useEffect(() => {
    return () => {
      if (seekTimeoutRef.current) {
        clearTimeout(seekTimeoutRef.current);
      }
    };
  }, []);

  // Update volume in the active player
  const changeVolume = (newVol: number) => {
    const vol = Math.max(0, Math.min(newVol, 100));
    setVolumeState(vol);
    if (playerRef.current && typeof playerRef.current.setVolume === "function") {
      try {
        playerRef.current.setVolume(Math.round(vol * signalStrength));
      } catch (e) {
        console.error("Error setting volume on YT player:", e);
      }
    }
  };

  // Dial frequency scan handler (with simulated signal drop-off and snap to playlist items)
  const changeTuning = (freq: number) => {
    const newFreq = Math.round(Math.max(88.0, Math.min(freq, 108.0)) * 10) / 10;
    if (newFreq !== tuneFrequency) {
      playStaticSwoosh();
    }
    setTuneFrequency(newFreq);

    let closestIndex = currentTrackIndex;
    let minDiff = Infinity;

    for (let i = 0; i < totalTracks; i++) {
      const freqTarget = getTrackFrequency(i, totalTracks);
      const diff = Math.abs(newFreq - freqTarget);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }

    const targetFreq = getTrackFrequency(closestIndex, totalTracks);
    const distance = Math.abs(newFreq - targetFreq);
    
    // Signal drops off to 0 within a 1.2 MHz window
    const newSignal = Math.max(0, 1 - distance / 1.2);
    setSignalStrength(newSignal);

    // Sync volume with signal attenuation
    if (playerRef.current && typeof playerRef.current.setVolume === "function") {
      try {
        playerRef.current.setVolume(Math.round(volume * newSignal));
      } catch (e) {
        console.error(e);
      }
    }

    // Snap to the closest playlist video index
    if (closestIndex !== currentTrackIndex) {
      if (playerRef.current && typeof playerRef.current.playVideoAt === "function") {
        try {
          playerRef.current.playVideoAt(closestIndex);
          setCurrentTrackIndex(closestIndex);
        } catch (err) {
          console.error("Error playing video at index:", err);
        }
      }
    }
  };

  // Sync state changes with player reference
  const registerPlayer = (player: any) => {
    playerRef.current = player;
    if (player && typeof player.setVolume === "function") {
      try {
        player.setVolume(Math.round(volume * signalStrength));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const updateProgress = (current: number, total: number) => {
    // If seek lock is active, ignore updates from the iframe's progress ticker
    if (isSeekingRef.current) return;

    setCurrentTime(current);
    if (total > 0) {
      setDuration(total);
    }
  };

  const setIsPlayingState = (playing: boolean) => {
    setIsPlaying(playing);
  };

  // Callback to sync active video details from YouTube player metadata
  const syncActiveTrack = (videoData: any, videoDuration: number, index: number, total: number) => {
    if (!videoData) return;

    const { title, artist } = cleanYouTubeMetadata(videoData.title, videoData.author);
    
    // Format duration MM:SS
    const mins = Math.floor(videoDuration / 60);
    const secs = Math.floor(videoDuration % 60);
    const durationStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    // Extract year from title or fallback
    const yearMatch = videoData.title.match(/\b(19\d{2}|20\d{2})\b/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : (currentPlaylistId === "ghazals" ? 1989 : 1992);

    const synced: Track = {
      id: videoData.video_id,
      title: title || "Classic Song",
      artist: artist || "Radio Station",
      film: currentPlaylistId === "ghazals" ? "Classic Ghazal" : "Retro Pop",
      year: year,
      duration: durationStr,
      videoId: videoData.video_id
    };

    setDynamicTrack(synced);
    setCurrentTrackIndex(index);
    setDynamicPlaylistLength(total);
    
    if (!isSeekingRef.current) {
      setDuration(videoDuration);
    }

    // Auto-update needle frequency to point to the active station
    const targetFreq = getTrackFrequency(index, total);
    setTuneFrequency(Math.round(targetFreq * 10) / 10);
    setSignalStrength(1.0);
    
    if (playerRef.current && typeof playerRef.current.setVolume === "function") {
      try {
        playerRef.current.setVolume(volume);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const togglePlay = () => {
    playClickSound();
    if (!playerRef.current) return;
    const nextState = !isPlaying;
    setIsPlaying(nextState);

    try {
      if (nextState) {
        playerRef.current.playVideo?.();
        track("play", { trackId: currentTrack.id, trackTitle: currentTrack.title });
      } else {
        playerRef.current.pauseVideo?.();
        track("pause", { trackId: currentTrack.id, trackTitle: currentTrack.title });
      }
    } catch (e) {
      console.error("Error playing/pausing:", e);
    }
  };

  const next = () => {
    playClickSound();
    if (playerRef.current && typeof playerRef.current.nextVideo === "function") {
      try {
        playerRef.current.nextVideo();
      } catch (err) {
        console.error("Error playing next playlist item:", err);
      }
    }
  };

  const previous = () => {
    playClickSound();
    if (playerRef.current && typeof playerRef.current.previousVideo === "function") {
      try {
        playerRef.current.previousVideo();
      } catch (err) {
        console.error("Error playing previous playlist item:", err);
      }
    }
  };

  const changePlaylist = (playlistId: string) => {
    playClickSound();
    setCurrentPlaylistId(playlistId);
    setCurrentTrackIndex(0);
    setDynamicTrack(null);
    setDynamicPlaylistLength(0);
    setCurrentTime(0);
    setDuration(0);
  };

  const seek = (percent: number) => {
    if (seekTimeoutRef.current) {
      clearTimeout(seekTimeoutRef.current);
    }
    // Lock progress ticker
    isSeekingRef.current = true;
    
    const targetSeconds = percent * duration;
    setCurrentTime(targetSeconds);
  };

  const commitSeek = (percent: number) => {
    playClickSound();
    isSeekingRef.current = true;
    
    const targetSeconds = percent * duration;
    setCurrentTime(targetSeconds);
    
    if (playerRef.current && typeof playerRef.current.seekTo === "function") {
      try {
        playerRef.current.seekTo(targetSeconds, true);
        track("seek", { trackId: currentTrack.id, timeSeconds: Math.floor(targetSeconds) });
      } catch (err) {
        console.error("Error performing seek:", err);
      }
    }

    // Retain lock for 1000ms to allow the YT player to buffer seek jump cleanly
    if (seekTimeoutRef.current) {
      clearTimeout(seekTimeoutRef.current);
    }
    seekTimeoutRef.current = setTimeout(() => {
      isSeekingRef.current = false;
    }, 1000);
  };

  const onTrackEnded = () => {
    next();
  };

  const onPlayerError = (code: number, videoId: string) => {
    console.error(`YouTube API error (Code: ${code}) for videoId: ${videoId}`);
    next();
  };

  return (
    <PlayerContext.Provider
      value={{
        playlists: PLAYLISTS,
        currentPlaylistId,
        currentTrackIndex,
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        isMobile,
        mounted,
        accentColor,
        volume,
        tuneFrequency,
        signalStrength,
        changeVolume,
        changeTuning,
        trackFrequency,
        togglePlay,
        next,
        previous,
        changePlaylist,
        seek,
        commitSeek,
        registerPlayer,
        updateProgress,
        onTrackEnded,
        onPlayerError,
        setIsPlayingState,
        syncActiveTrack,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
