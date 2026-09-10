import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Agent Hands-on Lab｜读一段，动一步，真正看懂 Agent",
  description: "文章、流程动画与小练习结合的 LangGraph 零基础互动教程。无需安装，也不需要 API Key。",
  openGraph: {
    title: "Agent Hands-on Lab",
    description: "读一段，动一步，真正看懂 Agent。",
    images: [{ url: "/og.png", width: 1672, height: 941, alt: "Agent Hands-on Lab 互动课程" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Hands-on Lab",
    description: "读一段，动一步，真正看懂 Agent。",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
