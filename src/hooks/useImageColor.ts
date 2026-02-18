import { useMemo } from 'react';

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

export function useImageColor(_imageUrl: string, index: number, title?: string) {
  // Generate colors from title - Letterboxd CDN doesn't support CORS so we can't extract from images
  const colors = useMemo(() => {
    return title
      ? generateColorsFromTitle(title)
      : generateColorsFromTitle(`movie-${index}`);
  }, [title, index]);

  return colors;
}

// Synchronous version for when we need colors immediately (e.g., getMovieColor)
export function getMovieColor(title: string, index: number): { bg: string; accent: string } {
  return generateColorsFromTitle(title || `movie-${index}`);
}

