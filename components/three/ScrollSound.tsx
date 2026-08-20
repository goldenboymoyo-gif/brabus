"use client";

import { useEffect, useRef } from "react";
import { useChoreography } from "@/lib/three/choreography";
import { useFrame } from "@react-three/fiber";
import { scrollState } from "@/lib/three/scrollState";
import { SCENE_RANGES } from "@/lib/constants/scroll";

/* ========================================================================
 * Scroll Sound Effects
 * ---------------------------------------------------------------------------
 * Generates subtle whoosh / mechanical transition sounds as the user scrolls
 * through scene boundaries. Uses Web Audio API oscillators — no audio files.
 *
 * Also produces a soft "tick" on each scene boundary crossing and a deeper
 * whoosh proportional to scroll velocity.
 * ======================================================================== */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isMuted = false;

export function setScrollMuted(muted: boolean) {
  isMuted = muted;
  if (masterGain) {
    masterGain.gain.linearRampToValueAtTime(
      muted ? 0 : 1,
      (audioCtx?.currentTime ?? 0) + 0.2
    );
  }
}

function ensureAudio() {
  if (audioCtx) return;
  audioCtx = new AudioContext();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 1.0;
  masterGain.connect(audioCtx.destination);
}

/* Soft whoosh — filtered noise burst, pitch-shaped by velocity */
function playWhoosh(ctx: AudioContext, dest: AudioNode, velocity: number) {
  const now = ctx.currentTime;
  const duration = 0.15 + Math.abs(velocity) * 0.3;
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(200 + Math.abs(velocity) * 800, now);
  filter.frequency.exponentialRampToValueAtTime(100, now + duration);
  filter.Q.value = 1.5;

  const gain = ctx.createGain();
  const vol = Math.min(0.35, 0.1 + Math.abs(velocity) * 0.25);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(vol, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  source.start(now);
  source.stop(now + duration);
}

/* Scene boundary tick — short tonal click */
function playTick(ctx: AudioContext, dest: AudioNode) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(2400, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.04);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.2, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(now);
  osc.stop(now + 0.08);
}

export default function ScrollSound() {
  const choreo = useChoreography();
  const lastProgress = useRef(0);
  const lastBoundary = useRef(-1);
  const initialized = useRef(false);

  useEffect(() => {
    const onInteraction = () => {
      ensureAudio();
      if (audioCtx?.state === "suspended") audioCtx.resume();
      window.removeEventListener("pointerdown", onInteraction);
      window.removeEventListener("keydown", onInteraction);
    };
    window.addEventListener("pointerdown", onInteraction);
    window.addEventListener("keydown", onInteraction);
    return () => {
      window.removeEventListener("pointerdown", onInteraction);
      window.removeEventListener("keydown", onInteraction);
    };
  }, []);

  useFrame(() => {
    if (!audioCtx || !masterGain) return;
    if (audioCtx.state === "suspended") audioCtx.resume();

    const progress = scrollState.progress;
    const velocity = scrollState.velocity;

    if (!initialized.current) {
      lastProgress.current = progress;
      initialized.current = true;
      return;
    }

    // Whoosh on scroll movement — volume proportional to velocity
    if (Math.abs(velocity) > 0.3) {
      playWhoosh(audioCtx, masterGain, velocity);
    }

    // Detect scene boundary crossings
    for (let i = 0; i < SCENE_RANGES.length; i++) {
      const r = SCENE_RANGES[i];
      if (
        (lastProgress.current < r.start && progress >= r.start) ||
        (lastProgress.current > r.start && progress <= r.start)
      ) {
        if (lastBoundary.current !== i) {
          lastBoundary.current = i;
          playTick(audioCtx, masterGain);
        }
      }
    }

    lastProgress.current = progress;
  });

  return null;
}
