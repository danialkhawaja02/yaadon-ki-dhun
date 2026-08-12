"use client";

import React, { useRef, useState, useEffect } from "react";

interface KnobProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  label: string;
}

export default function Knob({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
}: KnobProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Track continuous values in refs to solve latency state closures
  const prevAngleRef = useRef(0);
  const valueRef = useRef(value);
  const centerRef = useRef({ x: 0, y: 0 });

  // Sync incoming value prop to our mutable ref
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Map value to visual rotation angle (-135deg to +135deg)
  const percent = max > min ? (value - min) / (max - min) : 0;
  const rotationAngle = percent * 270 - 135;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!knobRef.current) return;
    
    knobRef.current.setPointerCapture(e.pointerId);
    setIsDragging(true);

    const rect = knobRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    centerRef.current = { x: cx, y: cy };

    // Set initial frame angle reference
    const angleRad = Math.atan2(e.clientY - cy, e.clientX - cx);
    prevAngleRef.current = angleRad * (180 / Math.PI);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const { x: cx, y: cy } = centerRef.current;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    // Small noise threshold
    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return;

    // Current angle
    const angleRad = Math.atan2(dy, dx);
    const currentAngle = angleRad * (180 / Math.PI);

    // Calculate incremental delta angle from the previous frame
    let angleDiff = currentAngle - prevAngleRef.current;
    
    // Wrap angles around the 180/-180 boundary
    if (angleDiff > 180) angleDiff -= 360;
    if (angleDiff < -180) angleDiff += 360;

    // Scale the incremental angle delta over the 270 degree sweep
    const range = max - min;
    const valueChange = (angleDiff / 270) * range;
    
    // Add delta change directly to latest value ref
    let newValue = valueRef.current + valueChange;
    newValue = Math.max(min, Math.min(max, newValue));
    
    // Snap to nearest step
    const stepsCount = Math.round((newValue - min) / step);
    const snappedValue = min + stepsCount * step;
    const finalValue = Math.max(min, Math.min(max, snappedValue));
    
    // Update frame references
    prevAngleRef.current = currentAngle;
    valueRef.current = finalValue;
    
    if (finalValue !== value) {
      onChange(finalValue);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging && knobRef.current) {
      knobRef.current.releasePointerCapture(e.pointerId);
      setIsDragging(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let newValue = value;
    const range = max - min;
    const pageJump = range * 0.1;

    switch (e.key) {
      case "ArrowUp":
      case "ArrowRight":
        newValue = Math.min(max, value + step);
        e.preventDefault();
        break;
      case "ArrowDown":
      case "ArrowLeft":
        newValue = Math.max(min, value - step);
        e.preventDefault();
        break;
      case "PageUp":
        newValue = Math.min(max, value + pageJump);
        e.preventDefault();
        break;
      case "PageDown":
        newValue = Math.max(min, value - pageJump);
        e.preventDefault();
        break;
      case "Home":
        newValue = min;
        e.preventDefault();
        break;
      case "End":
        newValue = max;
        e.preventDefault();
        break;
      default:
        return;
    }
    onChange(newValue);
  };

  return (
    <div className="flex flex-col items-center select-none shrink-0">
      {/* Knob Container */}
      <div
        ref={knobRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Math.round(value * 10) / 10}
        aria-label={label}
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center cursor-pointer focus-ring outline-none"
      >
        {/* Illustrated Knob Body */}
        <div
          className={`
            w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-cream relative shadow-md
            border border-brass/50 border-t-white/60 border-b-wood-dark/70
            flex items-center justify-center transition-transform duration-100 ease-out
            ${isDragging ? "scale-[0.97] brightness-[0.97]" : "hover:brightness-105 active:scale-95"}
          `}
          style={{
            transform: `rotate(${rotationAngle}deg)`,
          }}
        >
          <div className="absolute inset-0.5 rounded-full border border-wood-light/25 shadow-inner pointer-events-none" />
          <div className="w-0.5 h-2.5 bg-wood-dark rounded-full absolute top-1 left-1/2 -translate-x-1/2 pointer-events-none" />
        </div>
      </div>
      
      <span className="text-[7.5px] sm:text-[8px] font-sans font-bold tracking-widest text-charcoal/65 uppercase mt-0.5 pointer-events-none">
        {label}
      </span>
    </div>
  );
}
