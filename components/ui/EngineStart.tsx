"use client";

import { useState, useRef, useEffect } from "react";
import { engineState } from "@/lib/three/sharedState";

/* ========================================================================
 * Engine Start Button
 * ---------------------------------------------------------------------------
 * A circular START/STOP button that triggers the engine startup sequence.
 * When activated: headlights ramp up, engine sound plays, subtle vibration.
 * Click again to turn off.
 *
 * Uses Web Audio API for the engine startup sound — no audio files needed.
 * ======================================================================== */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

function ensureAudio() {
  if (audioCtx) return;
  audioCtx = new AudioContext();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.35;
  masterGain.connect(audioCtx.destination);
}

function playEngineStart(ctx: AudioContext, dest: AudioNode) {
  const now = ctx.currentTime;

  // Starter motor
  const starter = ctx.createOscillator();
  const starterGain = ctx.createGain();
  const starterFilter = ctx.createBiquadFilter();
  starter.type = "sawtooth";
  starter.frequency.setValueAtTime(55, now);
  starter.frequency.linearRampToValueAtTime(75, now + 0.3);
  starterFilter.type = "lowpass";
  starterFilter.frequency.value = 180;
  starterGain.gain.setValueAtTime(0, now);
  starterGain.gain.linearRampToValueAtTime(0.06, now + 0.05);
  starterGain.gain.linearRampToValueAtTime(0.08, now + 0.4);
  starterGain.gain.linearRampToValueAtTime(0, now + 0.6);
  starter.connect(starterFilter);
  starterFilter.connect(starterGain);
  starterGain.connect(dest);
  starter.start(now);
  starter.stop(now + 0.65);

  // Engine catch
  const engine = ctx.createOscillator();
  const engineGain = ctx.createGain();
  const engineFilter = ctx.createBiquadFilter();
  engine.type = "sawtooth";
  engine.frequency.setValueAtTime(40, now + 0.5);
  engine.frequency.linearRampToValueAtTime(80, now + 0.8);
  engine.frequency.linearRampToValueAtTime(55, now + 1.5);
  engineFilter.type = "lowpass";
  engineFilter.frequency.setValueAtTime(120, now + 0.5);
  engineFilter.frequency.linearRampToValueAtTime(250, now + 0.8);
  engineFilter.frequency.linearRampToValueAtTime(140, now + 2.0);
  engineGain.gain.setValueAtTime(0, now + 0.5);
  engineGain.gain.linearRampToValueAtTime(0.1, now + 0.7);
  engineGain.gain.linearRampToValueAtTime(0.06, now + 1.5);
  engineGain.gain.linearRampToValueAtTime(0.03, now + 3.0);
  engine.connect(engineFilter);
  engineFilter.connect(engineGain);
  engineGain.connect(dest);
  engine.start(now + 0.5);
  engine.stop(now + 3.5);

  // Sub-bass ignition thump
  const sub = ctx.createOscillator();
  const subGain = ctx.createGain();
  sub.type = "sine";
  sub.frequency.setValueAtTime(30, now + 0.55);
  sub.frequency.exponentialRampToValueAtTime(20, now + 1.0);
  subGain.gain.setValueAtTime(0, now + 0.55);
  subGain.gain.linearRampToValueAtTime(0.15, now + 0.6);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
  sub.connect(subGain);
  subGain.connect(dest);
  sub.start(now + 0.55);
  sub.stop(now + 1.6);
}

function playEngineStop(ctx: AudioContext, dest: AudioNode) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(55, now);
  osc.frequency.linearRampToValueAtTime(20, now + 0.5);
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(now);
  osc.stop(now + 0.7);
}

export default function EngineStart() {
  const [started, setStarted] = useState(false);
  const [vibrating, setVibrating] = useState(false);

  const toggle = () => {
    ensureAudio();
    if (audioCtx?.state === "suspended") audioCtx.resume();

    const next = !started;
    setStarted(next);
    engineState.current = next;

    if (next && audioCtx && masterGain) {
      playEngineStart(audioCtx, masterGain);
      setVibrating(true);
      // Haptic feedback on mobile
      if (navigator.vibrate) navigator.vibrate([50, 30, 100]);
      setTimeout(() => setVibrating(false), 2000);
    } else if (!next && audioCtx && masterGain) {
      playEngineStop(audioCtx, masterGain);
      if (navigator.vibrate) navigator.vibrate(50);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-auto md:right-6">
      <button
        onClick={toggle}
        className={`group relative flex items-center justify-center w-16 h-16 rounded-full border-2 transition-all duration-500 ${
          started
            ? "border-red-500/80 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
            : "border-line bg-black/80 hover:border-bone hover:bg-white/5"
        } ${vibrating ? "animate-pulse" : ""}`}
        title={started ? "Stop Engine" : "Start Engine"}
      >
        {/* Outer ring glow when running */}
        {started && (
          <div className="absolute inset-0 rounded-full border border-red-500/30 animate-ping" style={{ animationDuration: "2s" }} />
        )}

        {/* Icon */}
        <div className={`text-center transition-all duration-300 ${started ? "scale-90" : "group-hover:scale-105"}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={`mx-auto ${started ? "text-red-400" : "text-bone/70 group-hover:text-bone"}`}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className={`text-[7px] tracking-[0.2em] mt-0.5 ${started ? "text-red-400" : "text-ash/50"}`}>
            {started ? "STOP" : "START"}
          </p>
        </div>
      </button>
    </div>
  );
}
