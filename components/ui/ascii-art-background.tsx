"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type AsciiRenderMode =
  | "characters"
  | "dither"
  | "mosaic"
  | "pixel"
  | "dots"
  | "cross"
  | "diamond"
  | "voxel"
  | "lego"
  | "mixed"
  | "lines"
  | "diagonal"
  | "braille"
  | "disco"
  | "hexdump"
  | "matrix"
  | "rings"
  | "hearts"
  | "stars"
  | "hexagons"
  | "triangles"
  | "bubbles"
  | "hatch"
  | "contour"
  | "halfblocks";

type EffectToggle = {
  enabled: boolean;
  intensity: number;
};

type PointLight = {
  x: number;
  y: number;
  radius: number;
  intensity: number;
};

export type AsciiArtConfig = {
  renderMode: AsciiRenderMode;
  bgMode: "none" | "blurred" | "solid" | "original";
  bgBlur: number;
  bgOpacity: number;
  bgColor?: string;
  cellSize: number;
  coverage: number;
  invert: boolean;
  styleBlend: GlobalCompositeOperation;
  charSet: "custom" | "default";
  customChars: string;
  brightness: number;
  contrast: number;
  edgeEmphasis: number;
  density: number;
  toneCurve: Array<{ x: number; y: number }>;
  tint: string;
  tintOpacity: number;
  overlayBlend: GlobalCompositeOperation;
  saturation: number;
  grayscale: number;
  blurType: "off" | "gaussian" | "directional";
  blurAmount: number;
  blurAngle: number;
  directionalBothSides: boolean;
  pfx: {
    vignette: EffectToggle;
    scanLines: EffectToggle;
    chromatic: EffectToggle;
    bloom: EffectToggle;
    filmGrain: EffectToggle;
    glitch: EffectToggle;
    pixelate: EffectToggle;
    halftone: EffectToggle;
    filmDust: EffectToggle;
  };
  animated: boolean;
  animStyle: "wave" | "pulse" | "shimmer" | "ripple" | "flicker";
  animSpeed: EffectToggle;
  animIntensity: EffectToggle;
  lights: {
    enabled: boolean;
    points: PointLight[];
  };
  mask: {
    enabled: boolean;
    invert: boolean;
    dataUrl: string | null;
  };
};

const DEFAULT_CHARS = " .:-=+*#%@";

export const CREATION_ASCII_CONFIG: AsciiArtConfig = {
  renderMode: "characters",
  bgMode: "none",
  bgBlur: 12,
  bgOpacity: 50,
  bgColor: "#050505",
  cellSize: 17,
  coverage: 90,
  invert: true,
  styleBlend: "source-over",
  charSet: "custom",
  customChars: " .'\`^\",:;Il!i><~+_-?]",
  brightness: 0,
  contrast: 40,
  edgeEmphasis: 0,
  density: 40,
  toneCurve: [
    { x: 0, y: 0.18 },
    { x: 0.5, y: 0.56 },
    { x: 1, y: 1 },
  ],
  tint: "#d83cff",
  tintOpacity: 0,
  overlayBlend: "color-dodge",
  saturation: 0,
  grayscale: 100,
  blurType: "off",
  blurAmount: 35,
  blurAngle: 0,
  directionalBothSides: false,
  pfx: {
    vignette: { enabled: true, intensity: 38 },
    scanLines: { enabled: false, intensity: 28 },
    chromatic: { enabled: false, intensity: 40 },
    bloom: { enabled: false, intensity: 60 },
    filmGrain: { enabled: true, intensity: 40 },
    glitch: { enabled: false, intensity: 20 },
    pixelate: { enabled: false, intensity: 15 },
    halftone: { enabled: false, intensity: 20 },
    filmDust: { enabled: true, intensity: 20 },
  },
  animated: true,
  animStyle: "ripple",
  animSpeed: { enabled: true, intensity: 100 },
  animIntensity: { enabled: true, intensity: 4 },
  lights: { enabled: false, points: [] },
  mask: { enabled: false, invert: false, dataUrl: null },
};

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function hash2d(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function coverRect(
  imageWidth: number,
  imageHeight: number,
  width: number,
  height: number
) {
  const imageAspect = imageWidth / imageHeight;
  const canvasAspect = width / height;
  let drawWidth = width;
  let drawHeight = height;
  let x = 0;
  let y = 0;

  if (imageAspect > canvasAspect) {
    drawHeight = height;
    drawWidth = height * imageAspect;
    x = (width - drawWidth) / 2;
  } else {
    drawWidth = width;
    drawHeight = width / imageAspect;
    y = (height - drawHeight) / 2;
  }

  return { x, y, drawWidth, drawHeight };
}

function toneMap(value: number, points: Array<{ x: number; y: number }>) {
  if (points.length < 2) return value;
  const sorted = [...points].sort((a, b) => a.x - b.x);

  if (value <= sorted[0].x) return sorted[0].y;
  if (value >= sorted[sorted.length - 1].x) return sorted[sorted.length - 1].y;

  for (let i = 0; i < sorted.length - 1; i += 1) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (value >= a.x && value <= b.x) {
      const t = (value - a.x) / Math.max(0.0001, b.x - a.x);
      return a.y + (b.y - a.y) * t;
    }
  }

  return value;
}

function adjustedLuminance(
  r: number,
  g: number,
  b: number,
  config: AsciiArtConfig
) {
  const saturation = config.saturation / 100;
  const grayscale = config.grayscale / 100;
  const brightness = config.brightness / 100;
  const contrast = 1 + config.contrast / 100;

  let rr = r / 255;
  let gg = g / 255;
  let bb = b / 255;
  const average = (rr + gg + bb) / 3;

  rr = average + (rr - average) * (1 + saturation);
  gg = average + (gg - average) * (1 + saturation);
  bb = average + (bb - average) * (1 + saturation);

  const gray = rr * 0.2126 + gg * 0.7152 + bb * 0.0722;
  rr = rr * (1 - grayscale) + gray * grayscale;
  gg = gg * (1 - grayscale) + gray * grayscale;
  bb = bb * (1 - grayscale) + gray * grayscale;

  let lum = rr * 0.2126 + gg * 0.7152 + bb * 0.0722;
  lum = (lum - 0.5) * contrast + 0.5 + brightness;
  lum = clamp01(lum);
  lum = toneMap(lum, config.toneCurve);
  return config.invert ? 1 - lum : lum;
}

function animationOffset(
  style: AsciiArtConfig["animStyle"],
  x: number,
  y: number,
  width: number,
  height: number,
  time: number,
  speed: number,
  intensity: number
) {
  const nx = x / Math.max(1, width);
  const ny = y / Math.max(1, height);
  const t = time * (0.0007 + speed * 0.000018);
  const amount = intensity * 0.55;

  switch (style) {
    case "wave":
      return Math.sin(nx * 12 + t * 5) * amount;
    case "pulse":
      return Math.sin(t * 4) * amount;
    case "shimmer":
      return Math.sin((nx + ny) * 18 - t * 8) * amount;
    case "flicker":
      return (hash2d(Math.floor(x + t * 20), Math.floor(y)) - 0.5) * amount;
    case "ripple":
    default: {
      const dx = nx - 0.5;
      const dy = ny - 0.48;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return Math.sin(distance * 32 - t * 7) * amount;
    }
  }
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number
) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? radius : radius * 0.42;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  const s = size / 2;
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.8);
  ctx.bezierCurveTo(x - s * 1.4, y - s * 0.1, x - s * 0.7, y - s, x, y - s * 0.35);
  ctx.bezierCurveTo(x + s * 0.7, y - s, x + s * 1.4, y - s * 0.1, x, y + s * 0.8);
  ctx.fill();
}

function drawHexagon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number
) {
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const angle = Math.PI / 3 * i - Math.PI / 6;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawCell(
  ctx: CanvasRenderingContext2D,
  mode: AsciiRenderMode,
  x: number,
  y: number,
  size: number,
  lum: number,
  chars: string,
  col: number,
  row: number
) {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const scaled = Math.max(0.6, size * (0.15 + lum * 0.82));
  const glyphIndex = Math.min(
    chars.length - 1,
    Math.max(0, Math.floor(lum * (chars.length - 1)))
  );

  switch (mode) {
    case "characters":
      ctx.font = `${Math.max(5, size * (0.58 + lum * 0.42))}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(chars[glyphIndex] ?? " ", centerX, centerY);
      break;
    case "hexdump":
      ctx.font = `${Math.max(6, size * 0.72)}px ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("0123456789ABCDEF"[Math.min(15, Math.floor(lum * 15))], centerX, centerY);
      break;
    case "matrix":
      ctx.font = `${Math.max(6, size * 0.75)}px ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String.fromCharCode(0x30a0 + ((col * 7 + row * 13) % 80)), centerX, centerY);
      break;
    case "dither":
      if (lum > hash2d(col, row)) ctx.fillRect(x, y, size, size);
      break;
    case "mosaic":
    case "pixel":
      ctx.fillRect(x + 1, y + 1, Math.max(1, size - 2), Math.max(1, size - 2));
      break;
    case "dots":
    case "disco":
      ctx.beginPath();
      ctx.arc(centerX, centerY, scaled * 0.48, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "bubbles":
      ctx.lineWidth = Math.max(1, size * 0.09);
      ctx.beginPath();
      ctx.arc(centerX, centerY, scaled * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case "cross":
      ctx.lineWidth = Math.max(1, size * 0.08);
      ctx.beginPath();
      ctx.moveTo(centerX - scaled / 2, centerY);
      ctx.lineTo(centerX + scaled / 2, centerY);
      ctx.moveTo(centerX, centerY - scaled / 2);
      ctx.lineTo(centerX, centerY + scaled / 2);
      ctx.stroke();
      break;
    case "diamond":
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-scaled / 2, -scaled / 2, scaled, scaled);
      ctx.restore();
      break;
    case "voxel":
      ctx.fillRect(x + size * 0.2, y + size * 0.25, scaled * 0.7, scaled * 0.7);
      ctx.globalAlpha *= 0.6;
      ctx.fillRect(x + size * 0.34, y + size * 0.12, scaled * 0.7, scaled * 0.7);
      break;
    case "lego":
      ctx.fillRect(x + 1, y + size * 0.2, size - 2, size * 0.68);
      ctx.beginPath();
      ctx.arc(centerX, y + size * 0.23, size * 0.18, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "mixed": {
      const modes: AsciiRenderMode[] = ["dots", "cross", "diamond", "lines", "characters"];
      drawCell(ctx, modes[(col + row) % modes.length], x, y, size, lum, chars, col, row);
      break;
    }
    case "lines":
      ctx.lineWidth = Math.max(1, size * (0.05 + lum * 0.12));
      ctx.beginPath();
      ctx.moveTo(x, centerY);
      ctx.lineTo(x + size * lum, centerY);
      ctx.stroke();
      break;
    case "diagonal":
      ctx.lineWidth = Math.max(1, size * 0.08);
      ctx.beginPath();
      ctx.moveTo(x + size * (1 - lum), y + size);
      ctx.lineTo(x + size, y + size * (1 - lum));
      ctx.stroke();
      break;
    case "braille": {
      const dotR = Math.max(1, size * 0.07);
      for (let ix = 0; ix < 2; ix += 1) {
        for (let iy = 0; iy < 4; iy += 1) {
          const threshold = (iy * 2 + ix + 1) / 8;
          if (lum >= threshold) {
            ctx.beginPath();
            ctx.arc(x + size * (0.32 + ix * 0.36), y + size * (0.18 + iy * 0.21), dotR, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      break;
    }
    case "rings":
      ctx.lineWidth = Math.max(1, size * 0.07);
      ctx.beginPath();
      ctx.arc(centerX, centerY, scaled * 0.46, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case "hearts":
      drawHeart(ctx, centerX, centerY, scaled);
      break;
    case "stars":
      drawStar(ctx, centerX, centerY, scaled * 0.52);
      break;
    case "hexagons":
      drawHexagon(ctx, centerX, centerY, scaled * 0.52);
      break;
    case "triangles":
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - scaled * 0.55);
      ctx.lineTo(centerX - scaled * 0.52, centerY + scaled * 0.45);
      ctx.lineTo(centerX + scaled * 0.52, centerY + scaled * 0.45);
      ctx.closePath();
      ctx.fill();
      break;
    case "hatch":
      ctx.lineWidth = Math.max(0.6, size * 0.045);
      ctx.beginPath();
      ctx.moveTo(x, y + size);
      ctx.lineTo(x + size, y);
      if (lum > 0.5) {
        ctx.moveTo(x, y);
        ctx.lineTo(x + size, y + size);
      }
      ctx.stroke();
      break;
    case "contour":
      ctx.lineWidth = Math.max(0.7, size * 0.05);
      ctx.beginPath();
      ctx.arc(centerX, centerY, Math.max(1, scaled * 0.45), 0, Math.PI * 2);
      ctx.stroke();
      break;
    case "halfblocks":
      ctx.fillRect(x, y, size, Math.max(1, size * lum));
      if (lum > 0.45) ctx.fillRect(x, y + size / 2, size, size / 2);
      break;
  }
}

function applyPostEffects(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: AsciiArtConfig,
  time: number
) {
  const { pfx } = config;

  if (pfx.bloom.enabled) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = (pfx.bloom.intensity / 100) * 0.2;
    ctx.filter = `blur(${Math.max(2, pfx.bloom.intensity * 0.12)}px)`;
    ctx.drawImage(ctx.canvas, 0, 0, width, height);
    ctx.restore();
  }

  if (pfx.chromatic.enabled) {
    const offset = Math.max(1, pfx.chromatic.intensity * 0.05);
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.12;
    ctx.filter = "sepia(1) saturate(8) hue-rotate(-35deg)";
    ctx.drawImage(ctx.canvas, -offset, 0, width, height);
    ctx.filter = "sepia(1) saturate(8) hue-rotate(145deg)";
    ctx.drawImage(ctx.canvas, offset, 0, width, height);
    ctx.restore();
  }

  if (pfx.scanLines.enabled) {
    ctx.save();
    ctx.globalAlpha = (pfx.scanLines.intensity / 100) * 0.24;
    ctx.fillStyle = "#000";
    for (let y = 0; y < height; y += 4) ctx.fillRect(0, y, width, 1);
    ctx.restore();
  }

  if (pfx.halftone.enabled) {
    ctx.save();
    ctx.globalAlpha = (pfx.halftone.intensity / 100) * 0.18;
    ctx.fillStyle = "#fff";
    const step = 8;
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.arc(x, y, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  if (pfx.glitch.enabled) {
    const strength = Math.max(1, pfx.glitch.intensity * 0.16);
    ctx.save();
    ctx.globalAlpha = 0.25;
    for (let i = 0; i < 4; i += 1) {
      const y = hash2d(i, Math.floor(time / 160)) * height;
      const h = 2 + hash2d(i + 4, 2) * 16;
      const shift = (hash2d(i + 8, 3) - 0.5) * strength * 10;
      ctx.drawImage(ctx.canvas, 0, y, width, h, shift, y, width, h);
    }
    ctx.restore();
  }

  if (pfx.filmGrain.enabled) {
    const amount = Math.floor((width * height) / 1100 * (pfx.filmGrain.intensity / 100));
    ctx.save();
    ctx.globalAlpha = 0.12 + (pfx.filmGrain.intensity / 100) * 0.08;
    for (let i = 0; i < amount; i += 1) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const value = Math.random() > 0.5 ? 255 : 0;
      ctx.fillStyle = `rgb(${value} ${value} ${value})`;
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.restore();
  }

  if (pfx.filmDust.enabled) {
    const count = Math.max(1, Math.floor(pfx.filmDust.intensity / 6));
    ctx.save();
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = "#fff";
    for (let i = 0; i < count; i += 1) {
      const x = hash2d(i + 12, Math.floor(time / 1000)) * width;
      const y = hash2d(i + 50, Math.floor(time / 900)) * height;
      const r = 0.5 + hash2d(i + 20, 3) * 2.2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  if (pfx.vignette.enabled) {
    const intensity = pfx.vignette.intensity / 100;
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.15,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.72
    );
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, `rgba(0,0,0,${0.38 + intensity * 0.52})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
}

export interface AsciiArtBackgroundProps {
  src: string;
  className?: string;
  config?: Partial<AsciiArtConfig>;
}

export default function AsciiArtBackground({
  src,
  className,
  config: overrides,
}: AsciiArtBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const config: AsciiArtConfig = {
      ...CREATION_ASCII_CONFIG,
      ...overrides,
      pfx: {
        ...CREATION_ASCII_CONFIG.pfx,
        ...(overrides?.pfx ?? {}),
      },
      lights: {
        ...CREATION_ASCII_CONFIG.lights,
        ...(overrides?.lights ?? {}),
      },
      mask: {
        ...CREATION_ASCII_CONFIG.mask,
        ...(overrides?.mask ?? {}),
      },
    };

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sampleCanvas = document.createElement("canvas");
    const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });
    if (!sampleCtx) return;

    const maskImage = new Image();
    let maskReady = false;
    if (config.mask.enabled && config.mask.dataUrl) {
      maskImage.onload = () => {
        maskReady = true;
      };
      maskImage.src = config.mask.dataUrl;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";
    let imageReady = false;
    let raf = 0;
    let width = 1;
    let height = 1;
    let sampleData: ImageData | null = null;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      sampleCanvas.width = width;
      sampleCanvas.height = height;

      if (imageReady) {
        const cover = coverRect(image.naturalWidth, image.naturalHeight, width, height);
        sampleCtx.clearRect(0, 0, width, height);
        sampleCtx.drawImage(
          image,
          cover.x,
          cover.y,
          cover.drawWidth,
          cover.drawHeight
        );
        try {
          sampleData = sampleCtx.getImageData(0, 0, width, height);
        } catch {
          sampleData = null;
        }
      }
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    image.onload = () => {
      imageReady = true;
      resize();
    };
    image.onerror = () => {
      imageReady = false;
    };
    image.src = src;

    const frame = (time: number) => {
      ctx.save();
      ctx.setTransform(
        canvas.width / Math.max(1, width),
        0,
        0,
        canvas.height / Math.max(1, height),
        0,
        0
      );
      ctx.clearRect(0, 0, width, height);

      if (imageReady) {
        const cover = coverRect(image.naturalWidth, image.naturalHeight, width, height);

        if (config.bgMode === "solid") {
          ctx.save();
          ctx.globalAlpha = config.bgOpacity / 100;
          ctx.fillStyle = config.bgColor ?? "#050505";
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        } else if (config.bgMode === "original" || config.bgMode === "blurred") {
          ctx.save();
          ctx.globalAlpha = config.bgOpacity / 100;
          ctx.filter =
            config.bgMode === "blurred" ? `blur(${config.bgBlur}px)` : "none";
          ctx.drawImage(image, cover.x, cover.y, cover.drawWidth, cover.drawHeight);
          ctx.restore();
        }
      }

      if (sampleData) {
        const cell = Math.max(4, Math.floor(config.cellSize));
        const chars =
          config.charSet === "custom" && config.customChars.length > 0
            ? config.customChars
            : DEFAULT_CHARS;
        const coverage = clamp01(config.coverage / 100);
        const densityAlpha = 0.42 + clamp01(config.density / 100) * 0.58;
        const speed = config.animSpeed.enabled ? config.animSpeed.intensity : 0;
        const animAmount = config.animIntensity.enabled
          ? config.animIntensity.intensity
          : 0;

        ctx.save();
        ctx.globalCompositeOperation = config.styleBlend;

        for (let y = 0, row = 0; y < height; y += cell, row += 1) {
          for (let x = 0, col = 0; x < width; x += cell, col += 1) {
            if (hash2d(col, row) > coverage) continue;

            const sx = Math.min(width - 1, Math.max(0, Math.floor(x + cell / 2)));
            const sy = Math.min(height - 1, Math.max(0, Math.floor(y + cell / 2)));
            const index = (sy * width + sx) * 4;

            let lum = adjustedLuminance(
              sampleData.data[index] ?? 0,
              sampleData.data[index + 1] ?? 0,
              sampleData.data[index + 2] ?? 0,
              config
            );

            if (config.edgeEmphasis > 0) {
              const nx = Math.min(width - 1, sx + cell);
              const ny = Math.min(height - 1, sy + cell);
              const ix = (sy * width + nx) * 4;
              const iy = (ny * width + sx) * 4;
              const neighborX = adjustedLuminance(
                sampleData.data[ix] ?? 0,
                sampleData.data[ix + 1] ?? 0,
                sampleData.data[ix + 2] ?? 0,
                config
              );
              const neighborY = adjustedLuminance(
                sampleData.data[iy] ?? 0,
                sampleData.data[iy + 1] ?? 0,
                sampleData.data[iy + 2] ?? 0,
                config
              );
              const edge = Math.min(1, Math.abs(lum - neighborX) + Math.abs(lum - neighborY));
              lum = clamp01(lum + edge * (config.edgeEmphasis / 100));
            }

            const offset =
              config.animated
                ? animationOffset(
                    config.animStyle,
                    x,
                    y,
                    width,
                    height,
                    time,
                    speed,
                    animAmount
                  )
                : 0;

            const brightness = Math.floor(72 + lum * 183);
            const alpha = Math.min(1, (0.22 + lum * 0.95) * densityAlpha);
            ctx.globalAlpha = alpha;

            if (config.renderMode === "matrix") {
              ctx.fillStyle = `rgb(70 ${Math.min(255, 120 + brightness)} 95)`;
              ctx.strokeStyle = ctx.fillStyle;
            } else {
              ctx.fillStyle = `rgb(${brightness} ${brightness} ${brightness})`;
              ctx.strokeStyle = ctx.fillStyle;
            }

            drawCell(
              ctx,
              config.renderMode,
              x,
              y + offset,
              cell,
              lum,
              chars,
              col,
              row
            );
          }
        }
        ctx.restore();

        if (config.tintOpacity > 0) {
          ctx.save();
          ctx.globalCompositeOperation = config.overlayBlend;
          ctx.globalAlpha = config.tintOpacity / 100;
          ctx.fillStyle = config.tint;
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }

        if (config.blurType !== "off" && config.blurAmount > 0) {
          const blurCanvas = document.createElement("canvas");
          blurCanvas.width = width;
          blurCanvas.height = height;
          const blurCtx = blurCanvas.getContext("2d");
          if (blurCtx) {
            blurCtx.drawImage(canvas, 0, 0, width, height);
            ctx.save();
            ctx.clearRect(0, 0, width, height);
            ctx.filter = `blur(${Math.max(0.5, config.blurAmount * 0.12)}px)`;
            ctx.drawImage(blurCanvas, 0, 0, width, height);
            ctx.restore();
          }
        }

        if (config.lights.enabled) {
          for (const light of config.lights.points) {
            const lx = clamp01(light.x) * width;
            const ly = clamp01(light.y) * height;
            const radius = Math.max(10, light.radius * Math.min(width, height));
            const gradient = ctx.createRadialGradient(lx, ly, 0, lx, ly, radius);
            gradient.addColorStop(0, `rgba(255,255,255,${clamp01(light.intensity)})`);
            gradient.addColorStop(1, "rgba(255,255,255,0)");
            ctx.save();
            ctx.globalCompositeOperation = "screen";
            ctx.fillStyle = gradient;
            ctx.fillRect(lx - radius, ly - radius, radius * 2, radius * 2);
            ctx.restore();
          }
        }

        if (config.mask.enabled && maskReady && imageReady) {
          const maskCanvas = document.createElement("canvas");
          maskCanvas.width = width;
          maskCanvas.height = height;
          const maskCtx = maskCanvas.getContext("2d");
          if (maskCtx) {
            maskCtx.drawImage(maskImage, 0, 0, width, height);
            const revealCanvas = document.createElement("canvas");
            revealCanvas.width = width;
            revealCanvas.height = height;
            const revealCtx = revealCanvas.getContext("2d");
            if (revealCtx) {
              const cover = coverRect(image.naturalWidth, image.naturalHeight, width, height);
              revealCtx.drawImage(image, cover.x, cover.y, cover.drawWidth, cover.drawHeight);
              revealCtx.globalCompositeOperation = config.mask.invert
                ? "destination-out"
                : "destination-in";
              revealCtx.drawImage(maskCanvas, 0, 0);
              ctx.drawImage(revealCanvas, 0, 0);
            }
          }
        }

        applyPostEffects(ctx, width, height, config, time);
      }

      ctx.restore();

      if (config.animated) {
        raf = requestAnimationFrame(frame);
      }
    };

    raf = requestAnimationFrame(frame);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      image.onload = null;
      image.onerror = null;
    };
  }, [src, overrides]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("ascii-background", className)}
      aria-hidden
    />
  );
}
