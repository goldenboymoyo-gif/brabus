"use client";

import * as THREE from "three";

/* ========================================================================
 * Interior PBR Texture Generator
 * Creates high-quality procedural textures for leather, carbon fiber,
 * brushed metal, stitching, and screen content. All generated via canvas
 * so no external assets are needed for the base materials.
 * ======================================================================== */

function createCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!];
}

function toTexture(c: HTMLCanvasElement, repeat = [1, 1] as [number, number]): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ------------------------------------------------------------------ */
/*  LEATHER GRAIN                                                      */
/* ------------------------------------------------------------------ */
export function buildLeatherTexture(
  baseColor = "#2e2923",
  grainScale = 1.0
): { map: THREE.CanvasTexture; normalMap: THREE.CanvasTexture; roughnessMap: THREE.CanvasTexture } {
  const size = 512;

  // Base color with subtle variation
  const [colorC, colorCtx] = createCanvas(size, size);
  colorCtx.fillStyle = baseColor;
  colorCtx.fillRect(0, 0, size, size);

  // Add subtle color noise for natural leather variation
  const imgData = colorCtx.getImageData(0, 0, size, size);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 12;
    imgData.data[i] = Math.max(0, Math.min(255, imgData.data[i] + noise));
    imgData.data[i + 1] = Math.max(0, Math.min(255, imgData.data[i + 1] + noise));
    imgData.data[i + 2] = Math.max(0, Math.min(255, imgData.data[i + 2] + noise));
  }
  colorCtx.putImageData(imgData, 0, 0);

  // Fine leather grain normal map
  const [normC, normCtx] = createCanvas(size, size);
  const normData = normCtx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      // Multi-octave noise for organic grain
      const n1 = Math.sin(x * 0.15 * grainScale) * Math.cos(y * 0.12 * grainScale) * 30;
      const n2 = Math.sin(x * 0.47 * grainScale + 2.1) * Math.cos(y * 0.38 * grainScale + 1.7) * 18;
      const n3 = (Math.random() - 0.5) * 25;
      // Pores — small circular depressions
      const poreX = (x * 0.08 * grainScale) % 1;
      const poreY = (y * 0.08 * grainScale) % 1;
      const poreDist = Math.sqrt((poreX - 0.5) ** 2 + (poreY - 0.5) ** 2);
      const pore = poreDist < 0.2 ? (poreDist - 0.2) * 40 : 0;

      const nx = 128 + (n1 + n2 + n3 + pore * 0.3) * 0.6;
      const ny = 128 + (n1 + n2 + n3 - pore) * 0.6;
      normData.data[idx] = Math.max(0, Math.min(255, nx));
      normData.data[idx + 1] = Math.max(0, Math.min(255, ny));
      normData.data[idx + 2] = 240;
      normData.data[idx + 3] = 255;
    }
  }
  normCtx.putImageData(normData, 0, 0);

  // Roughness — leather is rough but has subtle sheen variation
  const [roughC, roughCtx] = createCanvas(size, size);
  const roughData = roughCtx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const base = 160;
      const variation = Math.sin(x * 0.05) * 8 + Math.cos(y * 0.04) * 8;
      const grain = (Math.random() - 0.5) * 20;
      const val = Math.max(120, Math.min(200, base + variation + grain));
      roughData.data[idx] = val;
      roughData.data[idx + 1] = val;
      roughData.data[idx + 2] = val;
      roughData.data[idx + 3] = 255;
    }
  }
  roughCtx.putImageData(roughData, 0, 0);

  return {
    map: toTexture(colorC),
    normalMap: toTexture(normC),
    roughnessMap: toTexture(roughC),
  };
}

/* ------------------------------------------------------------------ */
/*  DIAMBER QUILTED LEATHER (seats)                                    */
/* ------------------------------------------------------------------ */
export function buildQuiltedLeatherTexture(
  baseColor = "#3a3428",
  stitchColor = "#c8b89a"
): { map: THREE.CanvasTexture; normalMap: THREE.CanvasTexture } {
  const size = 512;
  const [c, ctx] = createCanvas(size, size);

  // Fill with base
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  // Subtle noise
  const imgData = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 10;
    imgData.data[i] += n;
    imgData.data[i + 1] += n;
    imgData.data[i + 2] += n;
  }
  ctx.putImageData(imgData, 0, 0);

  // Diamond quilt pattern
  const cellSize = 64;
  ctx.strokeStyle = stitchColor;
  ctx.lineWidth = 1.5;

  for (let y = -size; y < size * 2; y += cellSize) {
    for (let x = -size; x < size * 2; x += cellSize) {
      // Diamond stitch
      ctx.beginPath();
      ctx.moveTo(x + cellSize / 2, y);
      ctx.lineTo(x + cellSize, y + cellSize / 2);
      ctx.lineTo(x + cellSize / 2, y + cellSize);
      ctx.lineTo(x, y + cellSize / 2);
      ctx.closePath();
      ctx.stroke();

      // Inner shadow for puffiness
      const grad = ctx.createRadialGradient(
        x + cellSize / 2, y + cellSize / 2, 0,
        x + cellSize / 2, y + cellSize / 2, cellSize * 0.45
      );
      grad.addColorStop(0, "rgba(255,255,255,0.04)");
      grad.addColorStop(0.7, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0.15)");
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, cellSize, cellSize);
    }
  }

  // Normal map for the quilting
  const [normC, normCtx] = createCanvas(size, size);
  const normData = normCtx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      // Diamond height field — puffy center, depressed stitch lines
      const cellX = ((x % cellSize) + cellSize) % cellSize;
      const cellY = ((y % cellSize) + cellSize) % cellSize;
      const dx = (cellX - cellSize / 2) / (cellSize / 2);
      const dy = (cellY - cellSize / 2) / (cellSize / 2);
      const diamond = Math.max(Math.abs(dx), Math.abs(dy));
      const height = diamond < 0.85 ? (1 - diamond / 0.85) * 20 : 0;
      // Stitch depression
      const stitchDist = Math.min(
        Math.abs(cellX - cellSize / 2) + Math.abs(cellY - cellSize / 2),
        Math.abs(cellX) + Math.abs(cellY - cellSize / 2),
        Math.abs(cellX - cellSize) + Math.abs(cellY - cellSize / 2),
        Math.abs(cellX - cellSize / 2) + Math.abs(cellY),
        Math.abs(cellX - cellSize / 2) + Math.abs(cellY - cellSize)
      );
      const stitchDepth = stitchDist < 3 ? -15 : 0;

      normData.data[idx] = 128 + height * 0.5;
      normData.data[idx + 1] = 128 + height * 0.5;
      normData.data[idx + 2] = 230 + stitchDepth;
      normData.data[idx + 3] = 255;
    }
  }
  normCtx.putImageData(normData, 0, 0);

  return {
    map: toTexture(c),
    normalMap: toTexture(normC),
  };
}

/* ------------------------------------------------------------------ */
/*  CARBON FIBER WEAVE                                                 */
/* ------------------------------------------------------------------ */
export function buildCarbonFiberTexture(): {
  map: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const size = 512;
  const [c, ctx] = createCanvas(size, size);

  ctx.fillStyle = "#0c0c0e";
  ctx.fillRect(0, 0, size, size);

  // 2x2 twill weave
  const weaveSize = 12;
  for (let y = 0; y < size; y += weaveSize) {
    for (let x = 0; x < size; x += weaveSize) {
      const row = Math.floor(y / weaveSize);
      const col = Math.floor(x / weaveSize);
      const phase = (row + col) % 4;

      // Each fiber bundle has a slight angle shift
      const gradAngle = phase * Math.PI / 8;
      const base = phase < 2 ? 18 : 32;
      const grad = ctx.createLinearGradient(
        x + Math.cos(gradAngle) * weaveSize,
        y + Math.sin(gradAngle) * weaveSize,
        x - Math.cos(gradAngle) * weaveSize,
        y - Math.sin(gradAngle) * weaveSize
      );
      grad.addColorStop(0, `rgb(${base + 8},${base + 8},${base + 10})`);
      grad.addColorStop(0.5, `rgb(${base},${base},${base + 2})`);
      grad.addColorStop(1, `rgb(${base + 4},${base + 4},${base + 6})`);
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, weaveSize, weaveSize);

      // Thread lines within each bundle
      ctx.strokeStyle = `rgba(255,255,255,0.03)`;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < weaveSize; i += 3) {
        ctx.beginPath();
        if (row % 2 === 0) {
          ctx.moveTo(x + i, y);
          ctx.lineTo(x + i, y + weaveSize);
        } else {
          ctx.moveTo(x, y + i);
          ctx.lineTo(x + weaveSize, y + i);
        }
        ctx.stroke();
      }
    }
  }

  // Clearcoat sheen
  const sheenGrad = ctx.createLinearGradient(0, 0, size, size * 0.7);
  sheenGrad.addColorStop(0, "rgba(255,255,255,0.06)");
  sheenGrad.addColorStop(0.4, "rgba(255,255,255,0)");
  sheenGrad.addColorStop(0.7, "rgba(255,255,255,0.04)");
  sheenGrad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheenGrad;
  ctx.fillRect(0, 0, size, size);

  // Normal map
  const [normC, normCtx] = createCanvas(size, size);
  const normData = normCtx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const cellX = x % weaveSize;
      const cellY = y % weaveSize;
      const row = Math.floor(y / weaveSize);
      const col = Math.floor(x / weaveSize);

      // Fiber direction normals
      const nx = row % 2 === 0 ? Math.sin(cellX * 0.8) * 20 : 0;
      const ny = col % 2 === 0 ? Math.sin(cellY * 0.8) * 20 : 0;

      // Edge depression at weave boundaries
      const edgeX = cellX < 1 || cellX > weaveSize - 2 ? -8 : 0;
      const edgeY = cellY < 1 || cellY > weaveSize - 2 ? -8 : 0;

      normData.data[idx] = 128 + nx + edgeX;
      normData.data[idx + 1] = 128 + ny + edgeY;
      normData.data[idx + 2] = 240;
      normData.data[idx + 3] = 255;
    }
  }
  normCtx.putImageData(normData, 0, 0);

  // Roughness — clearcoat is smooth, weave has slight variation
  const [roughC, roughCtx] = createCanvas(size, size);
  const roughData = roughCtx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const cellX = x % weaveSize;
      const cellY = y % weaveSize;
      const center = Math.sqrt((cellX - weaveSize / 2) ** 2 + (cellY - weaveSize / 2) ** 2);
      const val = 60 + center * 4;
      roughData.data[idx] = val;
      roughData.data[idx + 1] = val;
      roughData.data[idx + 2] = val;
      roughData.data[idx + 3] = 255;
    }
  }
  roughCtx.putImageData(roughData, 0, 0);

  return {
    map: toTexture(c),
    normalMap: toTexture(normC),
    roughnessMap: toTexture(roughC),
  };
}

/* ------------------------------------------------------------------ */
/*  BRUSHED ALUMINIUM                                                  */
/* ------------------------------------------------------------------ */
export function buildBrushedMetalTexture(): {
  map: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const size = 512;
  const [c, ctx] = createCanvas(size, size);

  ctx.fillStyle = "#8a8a90";
  ctx.fillRect(0, 0, size, size);

  // Horizontal brush strokes
  for (let y = 0; y < size; y++) {
    const brightness = 128 + (Math.random() - 0.5) * 20 + Math.sin(y * 0.3) * 3;
    ctx.fillStyle = `rgb(${brightness},${brightness},${brightness + 2})`;
    ctx.fillRect(0, y, size, 1);
  }

  // Add some wider strokes
  ctx.globalAlpha = 0.15;
  for (let i = 0; i < 80; i++) {
    const y = Math.random() * size;
    const width = 0.5 + Math.random() * 1.5;
    ctx.fillStyle = Math.random() > 0.5 ? "#ffffff" : "#000000";
    ctx.fillRect(0, y, size, width);
  }
  ctx.globalAlpha = 1;

  const [roughC, roughCtx] = createCanvas(size, size);
  roughCtx.fillStyle = "#707070";
  roughCtx.fillRect(0, 0, size, size);

  // Streaks in roughness
  for (let y = 0; y < size; y++) {
    const r = 90 + (Math.random() - 0.5) * 40;
    roughCtx.fillStyle = `rgb(${r},${r},${r})`;
    roughCtx.fillRect(0, y, size, 1);
  }

  return {
    map: toTexture(c),
    roughnessMap: toTexture(roughC),
  };
}

/* ------------------------------------------------------------------ */
/*  INFO-TAINMENT SCREEN CONTENT                                       */
/* ------------------------------------------------------------------ */
export function buildScreenTexture(
  variant: "cluster" | "infotainment" = "infotainment"
): THREE.CanvasTexture {
  const size = 1024;
  const [c, ctx] = createCanvas(size, size);

  if (variant === "cluster") {
    // Dark background
    ctx.fillStyle = "#080a0f";
    ctx.fillRect(0, 0, size, size);

    // Speed arc
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(size / 2, size * 0.65, size * 0.3, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    // Redline zone
    ctx.strokeStyle = "#cc3333";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(size / 2, size * 0.65, size * 0.3, Math.PI * 1.72, Math.PI * 1.85);
    ctx.stroke();

    // Tick marks
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 20; i++) {
      const angle = Math.PI * 1.15 + (i / 20) * Math.PI * 0.7;
      const inner = size * 0.26;
      const outer = size * 0.28 + (i % 5 === 0 ? 8 : 0);
      ctx.beginPath();
      ctx.moveTo(size / 2 + Math.cos(angle) * inner, size * 0.65 + Math.sin(angle) * inner);
      ctx.lineTo(size / 2 + Math.cos(angle) * outer, size * 0.65 + Math.sin(angle) * outer);
      ctx.stroke();
    }

    // Center text
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${size * 0.1}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText("0", size / 2, size * 0.62);
    ctx.font = `${size * 0.035}px Arial`;
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText("km/h", size / 2, size * 0.68);

    // Gear indicator
    ctx.fillStyle = "#4488ff";
    ctx.font = `bold ${size * 0.06}px Arial`;
    ctx.fillText("D", size / 2, size * 0.82);

    // Subtle blue glow
    const grad = ctx.createRadialGradient(size / 2, size * 0.6, 0, size / 2, size * 0.6, size * 0.5);
    grad.addColorStop(0, "rgba(40,80,140,0.12)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

  } else {
    // Infotainment — navigation-style map view
    ctx.fillStyle = "#0c1018";
    ctx.fillRect(0, 0, size, size);

    // Grid lines
    ctx.strokeStyle = "rgba(60,120,180,0.12)";
    ctx.lineWidth = 1;
    for (let i = 0; i < size; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(size, i);
      ctx.stroke();
    }

    // "Road" paths
    ctx.strokeStyle = "rgba(80,140,200,0.25)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(size * 0.1, size * 0.8);
    ctx.quadraticCurveTo(size * 0.3, size * 0.5, size * 0.5, size * 0.45);
    ctx.quadraticCurveTo(size * 0.7, size * 0.4, size * 0.9, size * 0.2);
    ctx.stroke();

    // Active route
    ctx.strokeStyle = "#4488ff";
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.moveTo(size * 0.3, size * 0.6);
    ctx.quadraticCurveTo(size * 0.5, size * 0.45, size * 0.65, size * 0.35);
    ctx.stroke();
    ctx.setLineDash([]);

    // Position dot
    ctx.fillStyle = "#4488ff";
    ctx.beginPath();
    ctx.arc(size * 0.3, size * 0.6, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(size * 0.3, size * 0.6, 3, 0, Math.PI * 2);
    ctx.fill();

    // Top bar — time, temp
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, size, 48);
    ctx.fillStyle = "#ffffff";
    ctx.font = `${size * 0.028}px Arial`;
    ctx.textAlign = "left";
    ctx.fillText("10:26", 20, 32);
    ctx.textAlign = "right";
    ctx.fillText("22°C", size - 20, 32);
    ctx.textAlign = "center";
    ctx.fillText("BRABUS NAVIGATION", size / 2, 32);

    // Bottom menu bar
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, size - 60, size, 60);
    const menuItems = ["NAV", "MEDIA", "PHONE", "CLIMATE", "VEHICLE"];
    menuItems.forEach((item, i) => {
      const x = (size / menuItems.length) * (i + 0.5);
      ctx.fillStyle = i === 0 ? "#4488ff" : "rgba(255,255,255,0.5)";
      ctx.font = `${size * 0.022}px Arial`;
      ctx.fillText(item, x, size - 28);
    });
  }

  const tex = toTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ------------------------------------------------------------------ */
/*  STITCHING TEXTURE — horizontal stitch line                          */
/* ------------------------------------------------------------------ */
export function buildStitchTexture(
  stitchColor = "#c8b89a"
): THREE.CanvasTexture {
  const size = 128;
  const [c, ctx] = createCanvas(size, size);

  ctx.clearRect(0, 0, size, size);

  // Stitch holes
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  for (let x = 4; x < size; x += 10) {
    ctx.beginPath();
    ctx.ellipse(x, size / 2, 2, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Thread segments
  ctx.strokeStyle = stitchColor;
  ctx.lineWidth = 1.5;
  for (let x = 0; x < size; x += 10) {
    ctx.beginPath();
    ctx.moveTo(x + 2, size / 2 - 2);
    ctx.lineTo(x + 8, size / 2 + 2);
    ctx.stroke();
  }

  return toTexture(c);
}
