import { Icon, Image } from "@raycast/api";

/**
 * GitHub Linguist language names → Simple Icons slugs.
 * @see https://simpleicons.org
 * @see https://github.com/github-linguist/linguist/blob/main/lib/linguist/languages.yml
 */
const LANGUAGE_ICON_SLUGS: Record<string, string> = {
  "C++": "cplusplus",
  "C#": "dotnet",
  "F#": "fsharp",
  "Visual Basic .NET": "dotnet",
  Java: "openjdk",
  HTML: "html5",
  CSS: "css",
  SCSS: "sass",
  Vue: "vuedotjs",
  Dockerfile: "docker",
  Shell: "gnubash",
  "Vim Script": "vim",
  "Emacs Lisp": "gnuemacs",
  "Jupyter Notebook": "jupyter",
  Groovy: "apachegroovy",
  Nix: "nixos",
  Handlebars: "handlebarsdotjs",
  Cuda: "nvidia",
  Markdown: "markdown",
};

/** Languages without a matching Simple Icons brand — full image URLs. */
const LANGUAGE_ICON_URLS: Record<string, (color?: string | null) => string> = {
  // Simple Icons `make` is Make.com, not GNU Make
  Makefile: (color) => {
    const hex = normalizeHex(color);
    return hex
      ? `https://api.iconify.design/vscode-icons:file-type-makefile.svg?color=%23${encodeURIComponent(hex)}`
      : "https://api.iconify.design/vscode-icons:file-type-makefile.svg";
  },
};

function normalizeHex(color?: string | null): string | undefined {
  if (!color) {
    return undefined;
  }
  const hex = color.replace(/^#/, "");
  return /^[0-9a-fA-F]{6}$/.test(hex) ? hex.toUpperCase() : undefined;
}

function hexToRgb(hex: string): [number, number, number] {
  return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) {
    return [0, 0, l];
  }
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    default:
      h = (r - g) / d + 4;
  }
  return [h / 6, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r: number;
  let g: number;
  let b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (v: number) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, "0");
  return `${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Boosts dull GitHub Linguist colors (low saturation / too dark) so tags & icons read more clearly.
 * Already vivid colors stay mostly unchanged; near-grays only get a lightness nudge.
 */
export function brightenLanguageColor(color?: string | null): string | undefined {
  const hex = normalizeHex(color);
  if (!hex) {
    return undefined;
  }

  const [r, g, b] = hexToRgb(hex);
  let [h, s, l] = rgbToHsl(r, g, b);

  if (s < 0.08) {
    // Near-gray: don't invent a hue, just lift very dark tones a bit
    if (l < 0.4) {
      l = Math.min(0.5, l + 0.12);
    }
    return `#${hslToHex(h, s, l)}`;
  }

  // Pull muted colors toward a clearer saturation
  if (s < 0.45) {
    s = Math.min(0.78, s * 1.55 + 0.12);
  } else if (s < 0.62) {
    s = Math.min(0.82, s + 0.12);
  }

  // Dark Linguist colors (CSS, PHP, Dockerfile…) → a bit brighter
  if (l < 0.38) {
    l = Math.min(0.52, l + 0.14);
  } else if (l < 0.48) {
    l = Math.min(0.55, l + 0.06);
  } else if (l > 0.72) {
    // Washed-out pastels → slightly deeper so they don't disappear
    l = Math.max(0.58, l - 0.1);
  }

  return `#${hslToHex(h, s, l)}`;
}

function getSimpleIconsSlug(languageName: string): string | undefined {
  const override = LANGUAGE_ICON_SLUGS[languageName];
  if (override) {
    return override;
  }

  // e.g. TypeScript → typescript, CoffeeScript → coffeescript
  const slug = languageName.toLowerCase().replace(/[\s._-]+/g, "");
  if (/^[a-z][a-z0-9]*$/.test(slug)) {
    return slug;
  }

  return undefined;
}

/** Remote language icon for a GitHub language name, with Icon.Code fallback. */
export function getLanguageIcon(name: string, color?: string | null): Image.ImageLike {
  const vividColor = brightenLanguageColor(color);
  const customUrl = LANGUAGE_ICON_URLS[name]?.(vividColor);
  if (customUrl) {
    return { source: customUrl, fallback: Icon.Code };
  }

  const slug = getSimpleIconsSlug(name);
  if (!slug) {
    return Icon.Code;
  }

  const hex = vividColor?.replace(/^#/, "");
  const source = hex
    ? `https://cdn.simpleicons.org/${encodeURIComponent(slug)}/${encodeURIComponent(hex)}`
    : `https://cdn.simpleicons.org/${encodeURIComponent(slug)}`;

  return { source, fallback: Icon.Code };
}
