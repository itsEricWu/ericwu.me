import { Figtree, Fraunces } from "next/font/google";
import localFont from "next/font/local";

/**
 * Text and interface: SF Pro on Apple devices (nothing to download), Figtree,
 * a friendly geometric sans, everywhere else. Not preloaded, so Apple devices
 * never fetch it.
 */
export const fontText = Figtree({
  subsets: ["latin"],
  variable: "--ff-text",
  display: "swap",
  preload: false,
});

/**
 * Display: Fraunces, a soft variable serif. Its SOFT axis rounds the letters,
 * so the headline can melt like liquid under the cursor, and its optical-size
 * axis draws each size as designed: crisp, high-contrast cuts for the big
 * headline, sturdier ones for card titles. (Without it every size is drawn
 * from the 9 pt master.) About 120 KB, fetched after the first paint.
 */
export const fontDisplay = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
  variable: "--ff-display",
  display: "swap",
  // Loaded after the first paint by <FontLoader />.
  preload: false,
});

/** The italic "Eric" in the headline: Fraunces Italic subset to four glyphs, all axes (6 KB). */
export const fontName = localFont({
  src: "../assets/fonts/fraunces-italic-eric.woff2",
  style: "italic",
  weight: "100 900",
  variable: "--ff-name",
  display: "swap",
  preload: false,
  adjustFontFallback: "Times New Roman",
});

/** What <FontLoader /> asks the browser to load once the page has painted. */
export const deferredFaces = [
  `600 1em ${fontDisplay.style.fontFamily.split(",")[0]}`,
  `italic 600 1em ${fontName.style.fontFamily.split(",")[0]}`,
];
