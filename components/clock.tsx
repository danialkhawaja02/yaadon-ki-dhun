"use client";

import React, { useEffect, useState } from "react";

export default function Clock() {
  const [mounted, setMounted] = useState(false);
  const [timeData, setTimeData] = useState({ hour: "00", minute: "00", suffix: "PKT" });

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      try {
        const parts = new Intl.DateTimeFormat("en-PK", {
          timeZone: "Asia/Karachi",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).formatToParts(now);

        let hour = "12";
        let minute = "00";
        let dayPeriod = "AM";

        parts.forEach((part) => {
          if (part.type === "hour") hour = part.value;
          if (part.type === "minute") minute = part.value;
          if (part.type === "dayPeriod") dayPeriod = part.value;
        });

        setTimeData({ hour, minute, suffix: dayPeriod });
      } catch (e) {
        // Fallback in case of parsing errors
        setTimeData({ hour: "12", minute: "00", suffix: "PKT" });
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="font-mono text-xs tracking-wider text-warm-cream/40 select-none">
        00<span className="text-ochre opacity-50">:</span>00 --
      </div>
    );
  }

  return (
    <div 
      className="font-mono text-xs sm:text-sm tracking-wider text-cream font-bold select-none flex items-center"
      aria-label="Pakistan Current Time"
    >
      <span className="w-4 text-right">{timeData.hour}</span>
      <span className="animate-blink px-[0.5px] text-coral font-black select-none">:</span>
      <span className="w-4 text-left">{timeData.minute}</span>
      <span className="ml-1 text-[9px] sm:text-[9.5px] text-cream/85 font-sans tracking-normal select-none uppercase font-black">
        {timeData.suffix}
      </span>
    </div>
  );
}
