"use client";

import { useEffect, useRef } from "react";
import { useChoreography } from "@/lib/three/choreography";
import { useFrame } from "@react-three/fiber";

/* ========================================================================
 * Interior Ambient Sound
 * ---------------------------------------------------------------------------
 * Uses the Web Audio API to generate subtle ambient cabin tone + soft
 * chime on interior entry. No external audio files needed — everything
 * is synthetically generated via oscillators and noise.
 *
 * Respects autoplay policy: only starts after first user gesture.
 * User can toggle via a mute button (not implemented in 3D — the UI
 * scene chrome handles this).
 * ======================================================================== */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isMuted = false;

export function setInteriorMuted(muted: boolean) {
  isMuted = muted;
  if (masterGain) {
    masterGain.gain.linearRampToValueAtTime(
      muted ? 0 : 1,
      (audioCtx?.currentTime ?? 0) + 0.3
    );
  }
}

export function isInteriorMuted() {
  return isMuted;
}

function ensureAudio() {
  if (audioCtx) return;
  audioCtx = new AudioContext();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0;
  masterGain.connect(audioCtx.destination);
}

/* Subtle low cabin rumble — filtered noise */
function createCabinAmbience(ctx: AudioContext, dest: AudioNode) {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  // Low-pass to make it a soft rumble
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 120;
  filter.Q.value = 0.5;

  const gain = ctx.createGain();
  gain.gain.value = 0;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  source.start();

  return gain;
}

/* Soft chime — entry notification */
function playChime(ctx: AudioContext, dest: AudioNode, time: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(880, time);
  osc.frequency.exponentialRampToValueAtTime(1320, time + 0.08);
  osc.frequency.exponentialRampToValueAtTime(1100, time + 0.2);

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.06, time + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);

  osc.connect(gain);
  gain.connect(dest);
  osc.start(time);
  osc.stop(time + 0.6);
}

export default function InteriorSound() {
  const choreo = useChoreography();
  const ambienceGain = useRef<GainNode | null>(null);
  const hasPlayedChime = useRef(false);

  useEffect(() => {
    // Start on first user interaction
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

  useEffect(() => {
    ensureAudio();
    if (!audioCtx || !masterGain) return;

    ambienceGain.current = createCabinAmbience(audioCtx, masterGain);
  }, []);

  useFrame(() => {
    if (!audioCtx || !masterGain || !ambienceGain.current) return;

    const i = choreo.current.interiorFocus;

    // Fade ambience with interior focus
    const target = i * 0.15;
    ambienceGain.current.gain.linearRampToValueAtTime(
      target,
      audioCtx.currentTime + 0.1
    );

    // Play chime once when interior first becomes visible
    if (i > 0.5 && !hasPlayedChime.current) {
      hasPlayedChime.current = true;
      playChime(audioCtx, masterGain, audioCtx.currentTime);
    }
    if (i < 0.2) {
      hasPlayedChime.current = false;
    }
  });

  return null;
}
