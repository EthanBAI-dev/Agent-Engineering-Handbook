import { Inter, JetBrains_Mono, Noto_Serif, Noto_Serif_SC } from "next/font/google";

// 标题与 UI：紧字距、直接
export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

// 长文阅读：DESIGN.md 指定 18px/32px 衬线，中文走 Noto Serif SC 兜底
export const notoSerif = Noto_Serif({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-serif-latin",
  display: "swap",
});

export const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-serif-sc",
  display: "swap",
});

// 代码、终端、标签
export const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});
