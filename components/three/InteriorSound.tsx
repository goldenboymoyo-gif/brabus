"use client";

import { useEffect, useRef } from "react";
import { useChoreography } from "@/lib/three/choreography";
import { useFrame } from "@react-three/fiber";

/* ========================================================================
 * Interior Ambient Sound + Engine Startup
 * ---------------------------------------------------------------------------
 * Uses the Web Audio API to generate:
 * 1. Subtle cabin ambience (filtered noise) — fades in with interiorFocus
 * 2. Digital system startup chime — plays once on interior entry
 * 3. Engine startup sequence — low-frequency rumble + rev
 *
 * Respects browser autoplay policy: only starts after first user gesture.
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
  if (audioCtx) {
    if (audioCtx.state === "suspended") audioCtx.resume();
    return;
  }
  audioCtx = new AudioContext();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.8;
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

/* Digital startup chime — premium two-tone notification */
function playChime(ctx: AudioContext, dest: AudioNode, time: number) {
  // First tone — soft ascending
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(880, time);
  osc1.frequency.exponentialRampToValueAtTime(1320, time + 0.08);
  osc1.frequency.exponentialRampToValueAtTime(1100, time + 0.2);
  gain1.gain.setValueAtTime(0, time);
  gain1.gain.linearRampToValueAtTime(0.15, time + 0.02);
  gain1.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
  osc1.connect(gain1);
  gain1.connect(dest);
  osc1.start(time);
  osc1.stop(time + 0.5);

  // Second tone — higher, shorter
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(1320, time + 0.15);
  osc2.frequency.exponentialRampToValueAtTime(1760, time + 0.23);
  gain2.gain.setValueAtTime(0, time + 0.15);
  gain2.gain.linearRampToValueAtTime(0.1, time + 0.17);
  gain2.gain.exponentialRampToValueAtTime(0.001, time + 0.6);
  osc2.connect(gain2);
  gain2.connect(dest);
  osc2.start(time + 0.15);
  osc2.stop(time + 0.7);
}

/* Engine startup sequence — low rumble building to idle */
function playEngineStart(ctx: AudioContext, dest: AudioNode, time: number) {
  // Phase 1: Starter motor — low grinding
  const starterOsc = ctx.createOscillator();
  const starterGain = ctx.createGain();
  const starterFilter = ctx.createBiquadFilter();
  starterOsc.type = "sawtooth";
  starterOsc.frequency.setValueAtTime(60, time);
  starterOsc.frequency.linearRampToValueAtTime(80, time + 0.3);
  starterFilter.type = "lowpass";
  starterFilter.frequency.value = 200;
  starterGain.gain.setValueAtTime(0, time);
  starterGain.gain.linearRampToValueAtTime(0.12, time + 0.05);
  starterGain.gain.linearRampToValueAtTime(0.18, time + 0.4);
  starterGain.gain.linearRampToValueAtTime(0, time + 0.6);
  starterOsc.connect(starterFilter);
  starterFilter.connect(starterGain);
  starterGain.connect(dest);
  starterOsc.start(time);
  starterOsc.stop(time + 0.65);

  // Phase 2: Engine catch — deep rumble
  const engineOsc = ctx.createOscillator();
  const engineGain = ctx.createGain();
  const engineFilter = ctx.createBiquadFilter();
  engineOsc.type = "sawtooth";
  engineOsc.frequency.setValueAtTime(45, time + 0.5);
  engineOsc.frequency.linearRampToValueAtTime(85, time + 0.8);
  engineOsc.frequency.linearRampToValueAtTime(65, time + 1.2);
  engineFilter.type = "lowpass";
  engineFilter.frequency.setValueAtTime(150, time + 0.5);
  engineFilter.frequency.linearRampToValueAtTime(300, time + 0.8);
  engineFilter.frequency.linearRampToValueAtTime(180, time + 1.5);
  engineGain.gain.setValueAtTime(0, time + 0.5);
  engineGain.gain.linearRampToValueAtTime(0.2, time + 0.7);
  engineGain.gain.linearRampToValueAtTime(0.12, time + 1.2);
  engineGain.gain.linearRampToValueAtTime(0.06, time + 2.0);
  engineOsc.connect(engineFilter);
  engineFilter.connect(engineGain);
  engineGain.connect(dest);
  engineOsc.start(time + 0.5);
  engineOsc.stop(time + 2.5);

  // Phase 3: Sub-bass thump on ignition
  const subOsc = ctx.createOscillator();
  const subGain = ctx.createGain();
  subOsc.type = "sine";
  subOsc.frequency.setValueAtTime(35, time + 0.55);
  subOsc.frequency.exponentialRampToValueAtTime(25, time + 1.0);
  subGain.gain.setValueAtTime(0, time + 0.55);
  subGain.gain.linearRampToValueAtTime(0.12, time + 0.6);
  subGain.gain.exponentialRampToValueAtTime(0.001, time + 1.5);
  subOsc.connect(subGain);
  subGain.connect(dest);
  subOsc.start(time + 0.55);
  subOsc.stop(time + 1.6);
}

export default function InteriorSound() {
  const choreo = useChoreography();
  const ambienceGain = useRef<GainNode | null>(null);
  const hasPlayedChime = useRef(false);
  const hasPlayedEngine = useRef(false);

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

  useEffect(() => {
    ensureAudio();
    if (!audioCtx || !masterGain) return;
    ambienceGain.current = createCabinAmbience(audioCtx, masterGain);
  }, []);

  useFrame(() => {
    if (!audioCtx || !masterGain || !ambienceGain.current) return;
    if (audioCtx.state === "suspended") audioCtx.resume();

    const i = choreo.current.interiorFocus;

    // Fade ambience with interior focus
    const target = i * 0.18;
    ambienceGain.current.gain.linearRampToValueAtTime(
      target,
      audioCtx.currentTime + 0.1
    );

    // Digital chime — once when interior becomes visible
    if (i > 0.5 && !hasPlayedChime.current) {
      hasPlayedChime.current = true;
      playChime(audioCtx, masterGain, audioCtx.currentTime);
    }
    if (i < 0.2) {
      hasPlayedChime.current = false;
    }

    // Engine startup — once when interior is fully visible
    if (i > 0.85 && !hasPlayedEngine.current) {
      hasPlayedEngine.current = true;
      playEngineStart(audioCtx, masterGain, audioCtx.currentTime);
    }
    if (i < 0.3) {
      hasPlayedEngine.current = false;
    }
  });

  return null;
}
