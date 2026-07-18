"use client";

import type { CSSProperties, MouseEvent as ReactMouseEvent, PointerEvent } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { formatJournalDate, starterJournalEntries } from "./now/journal-data";

const navItems = [
  ["作品", "#projects"],
  ["关于", "#about"],
  ["经历", "#experience"],
  ["正在做", "#contact"],
] as const;

const pageIds = ["top", "projects", "about", "experience", "contact"] as const;

function motionStyle(order: number) {
  return { "--motion-order": order } as CSSProperties;
}

function curvePoint(t: number, control1: number, control2: number) {
  const inverse = 1 - t;
  return 3 * inverse * inverse * t * control1 + 3 * inverse * t * t * control2 + t * t * t;
}

function curveDerivative(t: number, control1: number, control2: number) {
  const inverse = 1 - t;
  return 3 * inverse * inverse * control1 + 6 * inverse * t * (control2 - control1) + 3 * t * t * (1 - control2);
}

function pageTurnEase(progress: number) {
  let t = progress;
  for (let index = 0; index < 7; index += 1) {
    const difference = curvePoint(t, 0.22, 0.25) - progress;
    const slope = curveDerivative(t, 0.22, 0.25);
    if (Math.abs(difference) < 0.0001 || Math.abs(slope) < 0.0001) break;
    t = Math.min(1, Math.max(0, t - difference / slope));
  }
  return curvePoint(t, 0.55, 1);
}

const portfolio = [
  {
    type: "COMMERCIAL PHOTOGRAPHY",
    number: "01",
    category: "商业摄影",
    intro: "从材质、比例与光线出发，为产品建立准确而克制的视觉秩序。",
    series: [
      { title: "无重力护理", en: "ZERO GRAVITY CARE", year: "2026", role: "创意 / 摄影 / 后期", image: "/zero-gravity.png", gallery: ["/zero-gravity.png", "/frozen-signal.png", "/project-commercial.png"], note: "以透明、悬浮与冷调实验室光线，建立轻盈、洁净且具有技术感的护肤产品视觉。" },
      { title: "琥珀与肌理", en: "AMBER MATERIALS", year: "2026", role: "概念 / 灯光 / 摄影", image: "/amber-materials.png", gallery: ["/amber-materials.png", "/mineral-veil.png", "/project-commercial.png"], note: "围绕矿石、玻璃与金属的触感关系，探索温暖材质如何承载产品的高级感。" },
      { title: "冰层信号", en: "FROZEN SIGNAL", year: "2026", role: "视觉概念 / 摄影", image: "/frozen-signal.png", gallery: ["/frozen-signal.png", "/fluid-balance.png", "/zero-gravity.png"], note: "让冷感、折射与凝结成为产品语言，测试科技护肤视觉里洁净与触感的平衡。" },
      { title: "矿物薄纱", en: "MINERAL VEIL", year: "2026", role: "美术 / 灯光 / 摄影", image: "/mineral-veil.png", gallery: ["/mineral-veil.png", "/amber-materials.png", "/fluid-balance.png"], note: "以粉体、石材和微妙的空气感，建立一组柔和但不失结构的彩妆材质研究。" },
      { title: "流体平衡", en: "FLUID BALANCE", year: "2026", role: "创意 / 静物摄影", image: "/fluid-balance.png", gallery: ["/fluid-balance.png", "/frozen-signal.png", "/mineral-veil.png"], note: "金属、液面与一圈涟漪构成最少的叙事元素，让力量感停留在即将发生的瞬间。" },
    ],
  },
  {
    type: "BRAND FILM",
    number: "02",
    category: "品牌影像",
    intro: "从叙事逻辑与镜头节奏开始，让品牌的感受先于口号抵达。",
    series: [
      { title: "夜航", en: "NIGHT CURRENT", year: "2026", role: "导演概念 / 摄影", image: "/night-current.png", gallery: ["/night-current.png", "/project-film.png", "/between-breaths.png"], note: "蓝灰夜色、潮湿地面与克制人物关系，构成一组关于移动、选择与未知的品牌影像。" },
      { title: "呼吸之间", en: "BETWEEN BREATHS", year: "2026", role: "创意 / 分镜 / 摄影", image: "/between-breaths.png", gallery: ["/between-breaths.png", "/night-current.png", "/project-film.png"], note: "用自然光、风与身体的细微动作，完成一组安静但具有持续张力的生活方式影像。" },
      { title: "雨后折返", en: "AFTER RAIN", year: "2026", role: "导演概念 / 影像", image: "/after-rain.png", gallery: ["/after-rain.png", "/night-current.png", "/blue-hour-ritual.png"], note: "清晨城市与雨后反光共同推动人物前行，让一段短暂折返拥有可感知的情绪方向。" },
      { title: "静止的速度", en: "STILL MOTION", year: "2026", role: "动作设计 / 摄影", image: "/still-motion.png", gallery: ["/still-motion.png", "/after-rain.png", "/project-film.png"], note: "以身体、织物和方向性模糊拆开速度，尝试让运动品牌的力量更接近真实感受。" },
      { title: "蓝调仪式", en: "BLUE HOUR RITUAL", year: "2026", role: "创意 / 分镜 / 摄影", image: "/blue-hour-ritual.png", gallery: ["/blue-hour-ritual.png", "/between-breaths.png", "/still-motion.png"], note: "从一天将明未明的时间切入，用光线与日常动作建立安静、可信的生活方式叙事。" },
    ],
  },
  {
    type: "AI VISUAL WORKFLOW",
    number: "03",
    category: "AI 实验",
    intro: "把生成从偶然结果变成可控制、可复验、可继续迭代的方法。",
    series: [
      { title: "可控角色", en: "CONTROLLED CHARACTER", year: "2026", role: "工作流 / 影像设计", image: "/controlled-character.png", gallery: ["/controlled-character.png", "/project-ai.png", "/synthetic-matter.png"], note: "围绕同一虚构角色测试光线、场景和镜头变化，研究跨画面一致性的可用边界。" },
      { title: "边界材质", en: "SYNTHETIC MATTER", year: "2026", role: "视觉研究 / 生成", image: "/synthetic-matter.png", gallery: ["/synthetic-matter.png", "/controlled-character.png", "/project-ai.png"], note: "以半透明生物形态与真实光学为基础，寻找介于摄影、材料实验与生成影像之间的视觉语言。" },
      { title: "回声形体", en: "ECHO FORM", year: "2026", role: "生成 / 影像设计", image: "/echo-form.png", gallery: ["/echo-form.png", "/controlled-character.png", "/parallel-skin.png"], note: "让身体、薄膜与空间产生难以分辨的边界，测试生成影像中的触感和可信度。" },
      { title: "合成花期", en: "SYNTHETIC BLOOM", year: "2026", role: "材质研究 / 生成", image: "/synthetic-bloom.png", gallery: ["/synthetic-bloom.png", "/synthetic-matter.png", "/echo-form.png"], note: "从真实植物结构出发，重组玻璃、生物薄膜与光学折射，形成一组不存在却可信的花期。" },
      { title: "平行肌理", en: "PARALLEL SKIN", year: "2026", role: "角色测试 / 生成", image: "/parallel-skin.png", gallery: ["/parallel-skin.png", "/controlled-character.png", "/project-ai.png"], note: "在不牺牲皮肤真实感的前提下控制色彩投影与人物一致性，寻找商业人像生成的可用尺度。" },
    ],
  },
];

const experience = [
  {
    step: "01",
    label: "WEB DEVELOPMENT",
    title: "先学会构建",
    text: "前端开发让我习惯拆解复杂问题：理解结构、验证路径，再把每个细节连接成完整体验。",
  },
  {
    step: "02",
    label: "PHOTOGRAPHY",
    title: "再学会看见",
    text: "商业摄影让我回到真实世界。光线、材质、动作与情绪，任何一处不合理都会被画面放大。",
  },
  {
    step: "03",
    label: "AI VISUAL",
    title: "现在扩展边界",
    text: "我正在把技术思维、摄影判断与生成式工具合在一起，寻找更稳定、更有想象力的视觉生产方式。",
  },
] as const;

export default function Home() {
  const [focus, setFocus] = useState({ x: 50, y: 48 });
  const [activeProject, setActiveProject] = useState(0);
  const [openSeries, setOpenSeries] = useState<number | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [heroMediaReady, setHeroMediaReady] = useState(false);
  const [wechatCopied, setWechatCopied] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const heroImage = useRef<HTMLImageElement | null>(null);
  const scrollAnimation = useRef<number | null>(null);
  const contentAnimationTimer = useRef<number | null>(null);

  const animatePageScroll = useCallback((targetY: number) => {
    const pages = pageIds
      .map((id) => document.getElementById(id))
      .filter((page): page is HTMLElement => Boolean(page));

    const startY = window.scrollY;
    const currentPage = pages.reduce((closest, page, index) =>
      Math.abs(page.offsetTop - startY) < Math.abs(pages[closest].offsetTop - startY) ? index : closest, 0);
    const targetPage = pages.reduce((closest, page, index) =>
      Math.abs(page.offsetTop - targetY) < Math.abs(pages[closest].offsetTop - targetY) ? index : closest, 0);
    const isDesktop = window.matchMedia("(min-width: 981px)").matches;

    if (scrollAnimation.current !== null) {
      window.cancelAnimationFrame(scrollAnimation.current);
      scrollAnimation.current = null;
    }
    if (contentAnimationTimer.current !== null) {
      window.clearTimeout(contentAnimationTimer.current);
      contentAnimationTimer.current = null;
    }
    pages.forEach((page, index) => {
      page.classList.toggle("is-section-dormant", isDesktop && index !== currentPage);
      page.classList.remove(
        "is-page-entering",
        "is-page-leaving",
        "is-content-pending",
        "is-content-entering",
        "is-content-leaving",
      );
    });

    const distance = targetY - startY;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || Math.abs(distance) < 2) {
      pages.forEach((page, index) => {
        page.classList.toggle("is-section-dormant", isDesktop && index !== targetPage);
      });
      window.scrollTo(0, targetY);
      return;
    }

    const leavingPage = pages[currentPage];
    const enteringPage = pages[targetPage];
    setActiveSection(enteringPage.id === "top" ? "" : enteringPage.id);
    const duration = 720;
    const startedAt = performance.now();
    let contentHasEntered = false;
    document.documentElement.classList.add("is-page-turning");
    if (leavingPage !== enteringPage) {
      leavingPage.classList.add("is-page-leaving", "is-content-leaving");
      enteringPage.classList.add("is-page-entering", "is-content-pending");
      enteringPage.classList.remove("is-section-dormant");
    }

    const startContentEntrance = () => {
      if (contentHasEntered || leavingPage === enteringPage) return;
      contentHasEntered = true;
      enteringPage.classList.remove("is-content-pending");
      enteringPage.classList.add("is-content-entering");
    };

    const finishPageTurn = () => {
      startContentEntrance();
      leavingPage.classList.remove("is-page-leaving", "is-content-leaving");
      enteringPage.classList.remove("is-page-entering", "is-content-pending");
      pages.forEach((page) => {
        page.classList.toggle("is-section-dormant", isDesktop && page !== enteringPage);
      });
      document.documentElement.classList.remove("is-page-turning");
      contentAnimationTimer.current = window.setTimeout(() => {
        enteringPage.classList.remove("is-content-entering");
        contentAnimationTimer.current = null;
      }, 1150);
    };

    const renderFrame = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      window.scrollTo(0, startY + distance * pageTurnEase(progress));
      if (progress >= 0.36) startContentEntrance();

      if (progress < 1) {
        scrollAnimation.current = window.requestAnimationFrame(renderFrame);
      } else {
        window.scrollTo(0, targetY);
        scrollAnimation.current = null;
        finishPageTurn();
      }
    };

    scrollAnimation.current = window.requestAnimationFrame(renderFrame);
  }, []);

  useLayoutEffect(() => {
    const image = heroImage.current;
    let isCurrent = true;

    const revealHeroMedia = () => {
      if (isCurrent) setHeroMediaReady(true);
    };

    if (!image) return;
    if (image.complete) {
      if (typeof image.decode === "function") image.decode().then(revealHeroMedia).catch(revealHeroMedia);
      else revealHeroMedia();
    } else {
      image.addEventListener("load", revealHeroMedia, { once: true });
      image.addEventListener("error", revealHeroMedia, { once: true });
    }

    return () => {
      isCurrent = false;
      image.removeEventListener("load", revealHeroMedia);
      image.removeEventListener("error", revealHeroMedia);
    };
  }, []);

  useLayoutEffect(() => {
    const pages = pageIds
      .map((id) => document.getElementById(id))
      .filter((page): page is HTMLElement => Boolean(page));
    let firstSync = true;

    const syncDormantSections = () => {
      if (!window.matchMedia("(min-width: 981px)").matches) {
        pages.forEach((page) => page.classList.remove("is-section-dormant"));
        firstSync = false;
        return;
      }

      const hashPage = firstSync && window.location.hash
        ? pages.findIndex((page) => `#${page.id}` === window.location.hash)
        : -1;
      const currentPage = hashPage >= 0
        ? hashPage
        : pages.reduce((closest, page, index) =>
          Math.abs(page.offsetTop - window.scrollY) < Math.abs(pages[closest].offsetTop - window.scrollY) ? index : closest, 0);

      pages.forEach((page, index) => {
        page.classList.toggle("is-section-dormant", index !== currentPage);
      });
      firstSync = false;
    };

    syncDormantSections();
    window.addEventListener("resize", syncDormantSections);
    return () => {
      window.removeEventListener("resize", syncDormantSections);
      pages.forEach((page) => page.classList.remove("is-section-dormant"));
    };
  }, []);

  useEffect(() => {
    const sections = ["projects", "about", "experience", "contact"]
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-28% 0px -62% 0px", threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (openSeries !== null) return;

    let gestureConsumed = false;
    let releaseTimer = 0;

    const onWheel = (event: WheelEvent) => {
      if (!window.matchMedia("(min-width: 981px)").matches || event.ctrlKey) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (Math.abs(event.deltaY) < 1) return;

      event.preventDefault();
      window.clearTimeout(releaseTimer);
      releaseTimer = window.setTimeout(() => { gestureConsumed = false; }, 120);
      if (gestureConsumed || scrollAnimation.current !== null) return;

      const pages = pageIds
        .map((id) => document.getElementById(id))
        .filter((page): page is HTMLElement => Boolean(page));
      const currentIndex = pages.reduce((closest, page, index) =>
        Math.abs(page.offsetTop - window.scrollY) < Math.abs(pages[closest].offsetTop - window.scrollY) ? index : closest, 0);
      const direction = event.deltaY > 0 ? 1 : -1;
      const targetIndex = Math.min(pages.length - 1, Math.max(0, currentIndex + direction));
      gestureConsumed = true;

      if (targetIndex !== currentIndex) animatePageScroll(pages[targetIndex].offsetTop);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.clearTimeout(releaseTimer);
    };
  }, [animatePageScroll, openSeries]);

  useEffect(() => () => {
    if (scrollAnimation.current !== null) window.cancelAnimationFrame(scrollAnimation.current);
    if (contentAnimationTimer.current !== null) window.clearTimeout(contentAnimationTimer.current);
    document.documentElement.classList.remove("is-page-turning");
    pageIds.forEach((id) => document.getElementById(id)?.classList.remove(
      "is-page-entering",
      "is-page-leaving",
      "is-content-pending",
      "is-content-entering",
      "is-content-leaving",
      "is-section-dormant",
    ));
  }, []);

  useEffect(() => {
    if (openSeries === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenSeries(null);
      if (event.key === "ArrowRight") setGalleryIndex((value) => (value + 1) % 3);
      if (event.key === "ArrowLeft") setGalleryIndex((value) => (value + 2) % 3);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [openSeries]);

  useEffect(() => {
    if (
      activeSection !== "projects" ||
      openSeries !== null ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;

    let interval = 0;
    const advance = () => {
      setCarouselIndex((index) => (index + 1) % portfolio[activeProject].series.length);
    };
    const kickoff = window.setTimeout(() => {
      advance();
      interval = window.setInterval(advance, 3900);
    }, 1400);

    return () => {
      window.clearTimeout(kickoff);
      if (interval) window.clearInterval(interval);
    };
  }, [activeProject, activeSection, openSeries]);

  function moveCarousel(direction: -1 | 1) {
    const length = portfolio[activeProject].series.length;
    setCarouselIndex((index) => (index + direction + length) % length);
  }

  function trackFocus(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    setFocus({
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    });
  }

  const focusStyle = {
    "--focus-x": `${focus.x}%`,
    "--focus-y": `${focus.y}%`,
  } as CSSProperties;

  function handlePageLink(event: ReactMouseEvent<HTMLAnchorElement>, href: string) {
    if (!window.matchMedia("(min-width: 981px)").matches) return;
    const target = document.querySelector<HTMLElement>(href);
    if (!target) return;
    event.preventDefault();
    window.history.replaceState(null, "", href);
    animatePageScroll(target.offsetTop);
  }

  async function copyWechat() {
    const wechat = "KaelisChen";
    let success = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(wechat);
        success = true;
      }
    } catch {
      success = false;
    }

    if (!success) {
      const textarea = document.createElement("textarea");
      textarea.value = wechat;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      success = document.execCommand("copy");
      textarea.remove();
    }

    if (success) {
      setWechatCopied(true);
      window.setTimeout(() => setWechatCopied(false), 1800);
    }
  }

  return (
    <div className="site-frame">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="KAELIS 首页" onClick={(event) => handlePageLink(event, "#top")}>
          KAELIS
        </a>
        <nav className="site-nav" aria-label="主导航">
          {navItems.map(([label, href]) => (
            <a className={activeSection === href.slice(1) ? "is-active" : ""} href={href} onClick={(event) => handlePageLink(event, href)} key={href}>
              {label}
            </a>
          ))}
        </nav>
      </header>

      <main>
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow" data-page-motion style={motionStyle(0)}>
              <span>摄影师</span>
              <i aria-hidden="true" />
              <span>前 Web 开发者</span>
              <i aria-hidden="true" />
              <span>AI 视觉探索者</span>
            </p>

            <h1 className="hero-signature-title" id="hero-title" data-page-motion style={motionStyle(1)}>让光<em>有解</em>。</h1>
            <p className="hero-signature" data-page-motion style={motionStyle(2)}>我在快门与代码之间，把偶然磨成一套只属于自己的方法。</p>

            <div className="hero-actions" data-page-motion style={motionStyle(3)}>
              <a className="button button-primary" href="#projects" onClick={(event) => handlePageLink(event, "#projects")}>
                <span>查看作品</span>
                <span aria-hidden="true">→</span>
              </a>
              <a className="button button-ghost" href="#about" onClick={(event) => handlePageLink(event, "#about")}>
                <span>认识我</span>
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          <div
            className={`hero-stage${heroMediaReady ? " is-hero-media-ready" : ""}`}
            data-page-motion
            onPointerMove={trackFocus}
            style={{ ...focusStyle, ...motionStyle(1), visibility: heroMediaReady ? "visible" : "hidden" }}
          >
            <div className="stage-corner stage-corner-tl" aria-hidden="true" />
            <div className="stage-corner stage-corner-tr" aria-hidden="true" />
            <div className="stage-corner stage-corner-bl" aria-hidden="true" />
            <div className="stage-corner stage-corner-br" aria-hidden="true" />

            <div className="stage-image" aria-hidden="true">
              <img ref={heroImage} src="/hero-darkroom.png" alt="" decoding="async" fetchPriority="high" />
              <div className="stage-vignette" />
              <div className="stage-scan" />
            </div>

            <div className="stage-meta stage-meta-top" aria-hidden="true">
              <span>28.2282° N</span>
              <span>112.9388° E</span>
              <b />
            </div>
            <div className="stage-meta stage-meta-bottom" aria-hidden="true">
              <span>F 1.8</span>
              <span>1/250</span>
              <span>ISO 100</span>
            </div>
            <div className="stage-lens" aria-hidden="true">35MM</div>

            <div className="focus-reticle" aria-hidden="true">
              <span />
              <i />
            </div>
          </div>

          <div className="film-timeline" data-page-motion style={motionStyle(4)} aria-label="视觉章节 1，共 3 章">
            <div className="timeline-time">
              <span>00:</span>18 <i>/</i> 01:24
            </div>
            <div className="timeline-track" aria-hidden="true">
              <span className="timeline-progress" />
              <b className="timeline-playhead" />
            </div>
            <div className="timeline-frames" aria-hidden="true">
              {Array.from({ length: 8 }).map((_, index) => (
                <span key={index} style={{ "--frame": index } as CSSProperties} />
              ))}
            </div>
          </div>
        </section>

        <section className="projects-section section-shell" id="projects" aria-labelledby="projects-title">
          <h2 className="sr-only" id="projects-title">作品系列</h2>

          <div className="portfolio-tabs" data-page-motion style={motionStyle(0)} role="tablist" aria-label="选择作品方向">
            {portfolio.map((project, index) => (
              <button
                type="button"
                className={activeProject === index ? "is-active" : ""}
                onClick={() => {
                  setActiveProject(index);
                  setCarouselIndex(0);
                }}
                role="tab"
                aria-selected={activeProject === index}
                key={project.number}
              >
                <span>{project.number}</span>
                <strong>{project.category}</strong>
                <small>{project.type}</small>
              </button>
            ))}
          </div>

          <div className="series-heading" data-page-motion style={motionStyle(1)} aria-live="polite">
            <p>{portfolio[activeProject].intro}</p>
            <span>自动翻页 / 点击侧页切换</span>
          </div>
          <div
            className="coverflow-shell"
            data-page-motion
            style={motionStyle(2)}
          >
            <div className="coverflow-stage" role="list" aria-label={`${portfolio[activeProject].category}作品系列`}>
              {portfolio[activeProject].series.map((series, index) => {
                const length = portfolio[activeProject].series.length;
                const offset = (index - carouselIndex + length) % length;
                const position = offset === 0 ? "is-active" : offset === 1 ? "is-next" : offset === length - 1 ? "is-prev" : "is-hidden";
                return (
                  <article className={`coverflow-card ${position}`} role="listitem" aria-hidden={position === "is-hidden"} key={series.en}>
                    <button
                      type="button"
                      onClick={() => {
                        if (index === carouselIndex) { setOpenSeries(index); setGalleryIndex(0); }
                        else setCarouselIndex(index);
                      }}
                      tabIndex={position === "is-hidden" ? -1 : 0}
                      aria-label={index === carouselIndex ? `查看完整系列：${series.title}` : `切换到系列：${series.title}`}
                    >
                      <span className="coverflow-image"><img src={series.image} alt={`${series.title}概念系列封面`} loading="lazy" /></span>
                      <span className="coverflow-meta"><small>概念系列 / {series.year}</small><i>0{index + 1}</i></span>
                      <strong>{series.title}</strong>
                      <em>{series.en}</em>
                      <span className="coverflow-open">{index === carouselIndex ? "查看完整系列 ↗" : ""}</span>
                    </button>
                  </article>
                );
              })}
            </div>
            <div className="coverflow-controls">
              <button type="button" onClick={() => moveCarousel(-1)} aria-label="上一个作品">←</button>
              <div className="coverflow-dots" aria-label="选择作品">
                {portfolio[activeProject].series.map((series, index) => (
                  <button className={carouselIndex === index ? "is-active" : ""} type="button" onClick={() => setCarouselIndex(index)} aria-label={`切换到 ${series.title}`} key={series.en} />
                ))}
              </div>
              <span>0{carouselIndex + 1} / 0{portfolio[activeProject].series.length}</span>
              <button type="button" onClick={() => moveCarousel(1)} aria-label="下一个作品">→</button>
            </div>
          </div>
        </section>

        <section className="about-section section-shell" id="about" aria-labelledby="about-title">
          <div className="about-content">
            <p className="section-kicker" data-page-motion style={motionStyle(0)}><span>02</span> PERSONAL PROFILE</p>
            <h2 id="about-title" data-page-motion style={motionStyle(1)}>
              <span>先看见，</span>
              <span>再把偶然变成方法。</span>
            </h2>
            <p className="about-lead" data-page-motion style={motionStyle(2)}>
              我是 <em>KAELIS</em>。比起“漂亮”，<br />我更在意一张画面为什么成立。
            </p>
            <div className="about-grid">
              <p data-page-motion style={motionStyle(3)}><strong>摄影教会我怀疑画面。</strong>光线、材质、动作与情绪里，任何一处不合理，都会破坏真实。于是我反复看、反复调整，直到所有细节共同指向同一个感受。</p>
              <p data-page-motion style={motionStyle(4)}><strong>开发经历教会我拆解问题。</strong>现在面对 AI 的不确定，我仍然沿用这种习惯：验证、重组、继续试验——让生成回到人的判断里。</p>
            </div>
            <p className="about-manifesto" data-page-motion style={motionStyle(5)}>我不急着给自己固定一种身份。这里记录的，是我如何看见、如何工作，以及边界如何继续移动。</p>
            <dl className="profile-facts">
              <div data-page-motion style={motionStyle(6)}><dt>所在地</dt><dd>长沙 / 可远程</dd></div>
              <div data-page-motion style={motionStyle(7)}><dt>工作方向</dt><dd>商业摄影 / 品牌影像 / AI 工作流</dd></div>
              <div data-page-motion style={motionStyle(8)}><dt>当前状态</dt><dd>开放项目合作与工作机会</dd></div>
            </dl>
          </div>
        </section>

        <section className="experience-section section-shell" id="experience" aria-labelledby="experience-title">
          <div className="section-heading experience-heading">
            <p className="section-kicker" data-page-motion style={motionStyle(0)}><span>03</span> EXPERIENCE AXIS</p>
            <h2 id="experience-title" data-page-motion style={motionStyle(1)}>
              <span>路径不同，</span>
              <span className="heading-offset">判断始终一致。</span>
            </h2>
          </div>

          <ol className="experience-list">
            {experience.map((item, index) => (
              <li data-page-motion style={motionStyle(index + 2)} key={item.step}>
                <span className="experience-step">{item.step}</span>
                <div>
                  <small>{item.label}</small>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="contact-section now-preview-section" id="contact" aria-labelledby="now-preview-title">
          <div className="now-preview-grid" aria-hidden="true" />
          <div className="now-preview-shell">
            <div className="now-preview-heading" data-page-motion style={motionStyle(0)}>
              <p className="section-kicker"><span>04</span> CURRENT PRACTICE</p>
              <h2 id="now-preview-title"><span>正在做的</span><em>事。</em></h2>
              <p>不是成果陈列，而是把仍在形成的判断、试验与片段留下来。</p>
              <a href="/now"><span>进入工作日志</span><b aria-hidden="true">→</b></a>
            </div>

            <div className="now-preview-list" data-page-motion style={motionStyle(1)}>
              {starterJournalEntries.map((entry, index) => (
                <a href={`/now#entry-${entry.id}`} key={entry.id}>
                  <span className="now-preview-index">0{index + 1}</span>
                  <span className="now-preview-date">{formatJournalDate(entry.date)}</span>
                  <small>{entry.category}</small>
                  <h3>{entry.title}</h3>
                  <span className="now-preview-thumb"><img src={entry.attachments[0].url} alt="" /></span>
                  <i aria-hidden="true">↗</i>
                </a>
              ))}
            </div>
          </div>

          <footer className="site-footer" data-page-motion style={motionStyle(2)}>
            <div className="footer-copyright">
              <strong>© 2026 KAELIS</strong>
              <span>ALL RIGHTS RESERVED.</span>
            </div>
            <div className="footer-contacts">
              <a href="mailto:chenguobin2228@163.com"><small>EMAIL</small>chenguobin2228@163.com</a>
              <button type="button" onClick={copyWechat}><small>WECHAT</small>{wechatCopied ? "已复制 KaelisChen" : "KaelisChen"}</button>
            </div>
            <div className="footer-tail">
              <span>CHANGSHA / AVAILABLE REMOTELY</span>
              <a href="#top" onClick={(event) => handlePageLink(event, "#top")}>TOP ↑</a>
            </div>
          </footer>
        </section>
      </main>

      {openSeries !== null && (() => {
        const series = portfolio[activeProject].series[openSeries];
        return (
          <div className="series-modal" role="dialog" aria-modal="true" aria-labelledby="series-modal-title">
            <button className="modal-backdrop" type="button" onClick={() => setOpenSeries(null)} aria-label="关闭系列详情" />
            <div className="modal-panel">
              <button className="modal-close" type="button" onClick={() => setOpenSeries(null)} aria-label="关闭">关闭 ×</button>
              <div className="modal-copy">
                <p>{portfolio[activeProject].type} / 概念系列</p>
                <h2 id="series-modal-title">{series.title}</h2>
                <em>{series.en}</em>
                <p className="modal-note">{series.note}</p>
                <dl><div><dt>年份</dt><dd>{series.year}</dd></div><div><dt>职责</dt><dd>{series.role}</dd></div></dl>
              </div>
              <div className="modal-gallery">
                <img key={series.gallery[galleryIndex]} src={series.gallery[galleryIndex]} alt={`${series.title}系列图 ${galleryIndex + 1}`} />
                <div className="gallery-controls">
                  <button type="button" onClick={() => setGalleryIndex((galleryIndex + 2) % 3)} aria-label="上一张">←</button>
                  <span>0{galleryIndex + 1} / 03</span>
                  <button type="button" onClick={() => setGalleryIndex((galleryIndex + 1) % 3)} aria-label="下一张">→</button>
                </div>
                <div className="gallery-thumbs">
                  {series.gallery.map((image, index) => <button type="button" className={galleryIndex === index ? "is-active" : ""} onClick={() => setGalleryIndex(index)} key={image}><img src={image} alt="" /></button>)}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
