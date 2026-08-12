"use client";

import React from "react";
import { usePlayer } from "./player-provider";
import VideoPanel from "./video-panel";
import TunerDial from "./tuner-dial";
import SeekBar from "./seek-bar";
import Transport from "./transport";
import Knob from "./knob";
import { formatTime } from "../../lib/format";

export default function DesktopPlayer() {
  const {
    currentTrack,
    currentTime,
    duration,
    volume,
    changeVolume,
    tuneFrequency,
    changeTuning,
    currentPlaylistId,
    changePlaylist,
  } = usePlayer();

  return (
    <div className="w-full max-w-[420px] sm:max-w-[450px] wood-trim mx-auto">
      <div className="cream-chassis rounded-[8px] p-3 flex flex-col gap-2.5 text-charcoal shadow-inner select-none">
        
        {/* Main Panel Content: Left Art Column and Right Controls Column */}
        <div className="flex items-stretch gap-3 h-[116px] sm:h-[124px]">
          
          {/* Left Column: Cover art and Transport Buttons directly below it */}
          <div className="w-[110px] sm:w-[120px] shrink-0 flex flex-col gap-1.5 justify-between">
            <div className="flex-1 w-full overflow-hidden relative rounded shadow-sm border border-charcoal/20">
              <VideoPanel />
            </div>
            <div className="w-full shrink-0">
              <Transport />
            </div>
          </div>

          {/* Right Column: Metadata details and Recessed Tuner Screen */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            
            {/* Metadata Text */}
            <div className="flex flex-col items-start leading-none truncate pl-0.5 mt-0.5">
              <h2 className="font-serif italic font-semibold text-xs sm:text-[13px] tracking-wide text-charcoal/90 uppercase truncate w-full">
                {currentTrack.title}
              </h2>
              <p className="font-sans text-[9px] sm:text-[9.5px] text-charcoal/55 font-bold mt-0.5 truncate w-full">
                {currentTrack.artist} &bull; {currentTrack.film} ({currentTrack.year})
              </p>
            </div>

            {/* Recessed Tuner Recess Screen */}
            <div className="tuner-screen p-1.5 flex flex-col justify-between select-none relative overflow-hidden h-[68px] sm:h-[72px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.02] to-white/[0.05] pointer-events-none rounded" />
              
              {/* 1. Interactive Tuner dial scale and Red frequency needle */}
              <TunerDial />

              {/* 2. Interactive Song timeline seek bar (Clickable to seek) */}
              <div className="w-full">
                <SeekBar />
              </div>

              {/* 3. Centered track duration readout */}
              <div className="flex items-center justify-center text-[8px] sm:text-[8.5px] font-mono text-needle/60 border-t border-white/5 pt-0.5 leading-none font-bold">
                <span>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Panel Controls Row: Restored Original Layout */}
        <div className="flex items-center justify-between border-t border-charcoal/10 pt-2 pb-0.5 px-0.5">
          
          {/* Volume Knob */}
          <div className="shrink-0">
            <Knob
              value={volume}
              min={0}
              max={100}
              step={1}
              onChange={changeVolume}
              label="VOLUME"
            />
          </div>

          {/* Tape Selector Switches (A & B only) */}
          <div className="flex flex-col items-center select-none gap-0.5 mt-[-1px]">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => changePlaylist("ghazals")}
                className={`mechanical-key w-5.5 h-4 flex items-center justify-center text-[7.5px] font-black ${
                  currentPlaylistId === "ghazals" ? "active play-active" : ""
                }`}
                aria-label="Tape A: Ghazals"
              >
                A
              </button>
              <button
                onClick={() => changePlaylist("pop")}
                className={`mechanical-key w-5.5 h-4 flex items-center justify-center text-[7.5px] font-black ${
                  currentPlaylistId === "pop" ? "active play-active" : ""
                }`}
                aria-label="Tape B: Pop"
              >
                B
              </button>
            </div>
            <span className="text-[6.5px] font-sans font-black tracking-widest text-charcoal/45 uppercase leading-none mt-0.5">
              TAPE
            </span>
          </div>

          {/* Tuning Knob (Controls radio frequency frequency) */}
          <div className="shrink-0">
            <Knob
              value={tuneFrequency}
              min={88.0}
              max={108.0}
              step={0.1}
              onChange={changeTuning}
              label="TUNE"
            />
          </div>

          {/* Stencil Brand Logo details */}
          <div className="flex flex-col items-start leading-none shrink-0 pl-1 sm:pl-2 border-l border-charcoal/10 py-0.5">
            <span className="font-sans font-black text-[9.5px] sm:text-[10px] tracking-wider text-charcoal/85 uppercase">
              SOOR TAAL
            </span>
            <span className="text-[5.5px] font-mono font-bold text-charcoal/40 uppercase tracking-tighter mt-0.5">
              STEREO CASSETTE RECEIVER
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
