import { useState, useEffect } from 'react';

// Generate a consistent hash from a string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Generate colors from movie title - creates consistent, pleasing colors
function generateColorsFromTitle(title: string): { bg: string; accent: string } {
  const hash = hashString(title);

  // Use hash to generate hue (0-360), keep saturation and lightness in pleasing ranges
  const hue = (hash % 360) / 360;
  const saturation = 0.4 + (((hash >> 8) % 30) / 100); // 0.4-0.7
  const lightness = 0.25 + (((hash >> 16) % 15) / 100); // 0.25-0.4 for bg

  const [r, g, b] = hslToRgb(hue, saturation, lightness);
  const [ar, ag, ab] = hslToRgb(hue, saturation + 0.1, lightness + 0.15);

  return {
    bg: `rgb(${r}, ${g}, ${b})`,
    accent: `rgb(${ar}, ${ag}, ${ab})`,
  };
}

// Find dominant color using color quantization
function extractDominantColor(imageData: Uint8ClampedArray): { r: number; g: number; b: number } | null {
  const colorBuckets: Map<string, { r: number; g: number; b: number; count: number }> = new Map();

  // Quantize colors into buckets (reduce to ~32 levels per channel)
  for (let i = 0; i < imageData.length; i += 4) {
    const r = Math.round(imageData[i] / 8) * 8;
    const g = Math.round(imageData[i + 1] / 8) * 8;
    const b = Math.round(imageData[i + 2] / 8) * 8;
    const a = imageData[i + 3];

    // Skip transparent or near-black/white pixels
    if (a < 128) continue;
    const brightness = (r + g + b) / 3;
    if (brightness < 20 || brightness > 235) continue;

    // Skip very desaturated colors
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    if (saturation < 0.15) continue;

    const key = `${r},${g},${b}`;
    const existing = colorBuckets.get(key);
    if (existing) {
      existing.count++;
    } else {
      colorBuckets.set(key, { r, g, b, count: 1 });
    }
  }

  // Find the most common color
  let dominant: { r: number; g: number; b: number; count: number } | null = null;
  for (const color of colorBuckets.values()) {
    if (!dominant || color.count > dominant.count) {
      dominant = color;
    }
  }

  return dominant ? { r: dominant.r, g: dominant.g, b: dominant.b } : null;
}

export function useImageColor(imageUrl: string, index: number, title?: string) {
  // Generate initial colors from title if available, otherwise use index-based fallback
  const fallbackColors = title
    ? generateColorsFromTitle(title)
    : generateColorsFromTitle(`movie-${index}`);

  const [colors, setColors] = useState(fallbackColors);

  useEffect(() => {
    if (!imageUrl) {
      setColors(fallbackColors);
      return;
    }

    // Try to extract color from image
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setColors(fallbackColors);
          return;
        }

        // Use larger sample for better color extraction
        canvas.width = 100;
        canvas.height = 150;
        ctx.drawImage(img, 0, 0, 100, 150);

        const imageData = ctx.getImageData(0, 0, 100, 150).data;
        const dominant = extractDominantColor(imageData);

        if (dominant) {
          const { r, g, b } = dominant;

          // Create darker bg and slightly lighter accent
          const darken = (c: number) => Math.max(0, Math.floor(c * 0.5));
          const accent = (c: number) => Math.min(255, Math.floor(c * 0.8));

          setColors({
            bg: `rgb(${darken(r)}, ${darken(g)}, ${darken(b)})`,
            accent: `rgb(${accent(r)}, ${accent(g)}, ${accent(b)})`,
          });
        } else {
          setColors(fallbackColors);
        }
      } catch {
        // CORS error, use fallback
        setColors(fallbackColors);
      }
    };

    img.onerror = () => {
      setColors(fallbackColors);
    };

    img.src = imageUrl;
  }, [imageUrl, index, fallbackColors]);

  return colors;
}

// Synchronous version for when we need colors immediately (e.g., getMovieColor)
export function getMovieColor(title: string, index: number): { bg: string; accent: string } {
  return generateColorsFromTitle(title || `movie-${index}`);
}

