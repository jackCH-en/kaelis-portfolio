import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "正在做的事 — KAELIS",
  description: "KAELIS 的工作日志：按日期记录正在形成的摄影、影像、网页与 AI 视觉实验。",
};

export default function NowLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
