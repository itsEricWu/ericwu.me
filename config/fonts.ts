import { Inter } from "next/font/google";

// Apple devices render SF Pro straight from the system font stack (zero bytes).
// Inter is the closest match elsewhere and only downloads when SF isn't available.
export const fontInter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});
