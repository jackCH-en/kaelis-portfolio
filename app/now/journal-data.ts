export type JournalAttachment = {
  id: string;
  url: string;
  alt: string;
};

export type JournalEntry = {
  id: string;
  date: string;
  category: string;
  title: string;
  content: string;
  attachments: JournalAttachment[];
};

export const starterJournalEntries: JournalEntry[] = [
  {
    id: "site-motion-20260718",
    date: "2026-07-18",
    category: "WEB / INTERACTION",
    title: "让页面开始呼吸",
    content:
      "这几天反复调整的不是某一个动画，而是滚动、停留与信息之间的节奏。好的交互不该抢走注意力，它只在需要的时候，轻轻把下一页递过来。",
    attachments: [
      { id: "site-motion-a", url: "/hero-darkroom.png", alt: "KAELIS 网站首屏视觉实验" },
      { id: "site-motion-b", url: "/synthetic-matter.png", alt: "蓝色透明材质视觉实验" },
    ],
  },
  {
    id: "ai-workflow-20260716",
    date: "2026-07-16",
    category: "AI VISUAL",
    title: "生成图不是答案",
    content:
      "我正在测试角色、材质与光线的一致性。比起一次偶然生成的漂亮画面，我更关心它能否被控制、被复验，并在下一次继续成立。",
    attachments: [
      { id: "ai-workflow-a", url: "/controlled-character.png", alt: "可控角色生成实验" },
      { id: "ai-workflow-b", url: "/parallel-skin.png", alt: "真实皮肤与色彩投影实验" },
    ],
  },
  {
    id: "brand-film-20260714",
    date: "2026-07-14",
    category: "BRAND FILM",
    title: "让文案停止解释",
    content:
      "品牌影像不该把所有信息说满。最近的练习，是把文字退后一步，让环境声、动作和镜头之间的停顿，先替画面建立感受。",
    attachments: [
      { id: "brand-film-a", url: "/night-current.png", alt: "夜色品牌影像概念" },
      { id: "brand-film-b", url: "/between-breaths.png", alt: "自然光生活方式影像概念" },
    ],
  },
];

export function formatJournalDate(date: string) {
  return date.replaceAll("-", ".");
}
