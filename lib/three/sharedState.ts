"use client";

import { useRef } from "react";

/* ========================================================================
 * Shared Vehicle State
 * ---------------------------------------------------------------------------
 * Module-level reactive state shared between 3D components and DOM UI.
 * Uses ref-based pattern (like choreography) to avoid re-renders.
 * ======================================================================== */

/** Current body paint color hex */
export const paintColor = { current: "#0c0c0f" };

/** Engine started state */
export const engineState = { current: false };

/** Headlights on (always on now, but can be toggled) */
export const headlightState = { current: true };

/** Current scene key for scroll sound triggers */
export const lastSceneRef = { current: "" as string };
