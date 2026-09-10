import Link from "next/link";

import { CourseMap } from "@/components/course-map";
import { Disclosure } from "@/components/disclosure";
import { LabPreview } from "@/components/lab-preview";
import {
  availableLessons,
  courseLessons,
  lessonHref,
  lessonsInRange,
  openLessons,
  roadmapStages,
  TOTAL_LESSONS,
} from "@/lib/course";

const REPO = "https://github.com/EthanBAI-dev/Agent-Engineering-Handbook";

/** STEP 卡右上角的四个图标：读 / 动 / 改 / 证。内联 SVG，不引图标字体。 */
const stepIcons: Record<string, React.ReactNode> = {
  "01": (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5zM20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5z" /></svg>),
  "02": (<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M10 8.5v7l6-3.5z" className="knockout" /></svg>),
  "03": (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h9M17 7h3M4 17h3M11 17h9" /><circle cx="15" cy="7" r="2.4" /><circle cx="9" cy="17" r="2.4" /></svg>),
  "04": (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4.5 12.5 5 5L20 7" /></svg>),
};

const learningSteps = [
  ["01", "读", "先用短文回答一个明确问题"],
  ["02", "动", "单步执行，观察节点和数据"],
  ["03", "改", "改变一个参数，制造不同结果"],
  ["04", "证", "通过挑战，确认自己真的理解"],
];

export default function Home() {
  const nextLesson = courseLessons.find((lesson) => lesson.status === "next");

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Agent Hands-on Lab 首页">
          <span className="brand-mark">A</span>
          <span className="brand-text">
            <span className="brand-name">Agent Hands-on Lab <b>v1.0</b></span>
            <span className="brand-tagline">读一段，动一步，真正看懂 Agent</span>
          </span>
        </a>
        <nav className="topnav" aria-label="首页导航">
          <a href="#method">学习方式</a>
          <a href="#preview">实验预览</a>
          <a href="#curriculum">30 课目录</a>
          <a href={REPO} rel="noopener noreferrer" target="_blank">GitHub 仓库</a>
        </nav>
        <div className="topbar-end">
          <span className="progress-label">前言 + {openLessons.length} / {TOTAL_LESSONS} 已开放</span>
          <Link className="topbar-cta" href={lessonHref(availableLessons[0]) ?? "/#curriculum"}>从第 00 课开始</Link>
        </div>
      </header>

      <section className="course-hero" id="top">
        <div className="hero-eyebrows">
          <span className="eyebrow-pill"><i aria-hidden="true" />ARTICLE × ANIMATION × PRACTICE</span>
          <span className="eyebrow-pill quiet">LangGraph 交互式图状态机运行时</span>
        </div>
        <div className="hero-main">
          <div className="hero-lede">
            <h1>读一段，动一步，<br /><em>真正看懂 Agent</em>。</h1>
            <p>这不是把传统教程原样搬到网页。每当文章讲到一个抽象概念，旁边的流程图就能立刻运行。30 课各有独立页面和进度位置，你可以按顺序学习，也可以随时回到目录重新定位。</p>
          </div>
          <div className="hero-actions">
            <Link className="primary-link" href={lessonHref(availableLessons[0]) ?? "/#curriculum"}>从第 00 课开始 <span>→</span></Link>
            <p className="hero-subline">
              <a href="#curriculum">查看 00–30 课完整大纲 ↓</a>
              <i aria-hidden="true">/</i>
              <a href="https://github.com/EthanBAI-dev/Agent-Engineering-Handbook" rel="noopener noreferrer" target="_blank">GitHub 源码 ↗</a>
            </p>
          </div>
        </div>
        <div className="hero-steps" id="method">
          {learningSteps.map(([number, title, description]) => (
            <article key={number}>
              <div className="step-top">
                <span>STEP {number}</span>
                <i className="step-icon" aria-hidden="true">{stepIcons[number]}</i>
              </div>
              <h2>{number} {title}</h2>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <LabPreview />

      <section className="curriculum" id="curriculum">
        <header className="curriculum-heading">
          <div>
            <p className="eyebrow">30-LESSON COURSE</p>
            <h2>一课一个问题。<br />学到哪里，都能接着回来。</h2>
          </div>
          <p>第 00 课是前言，不计入正式 30 课；第 01–04 课已经开放。第 05–30 课的主题和学习产出已经完成来源映射，将按“真实模型 → 状态与可靠性 → 高级模式 → 产品化”逐步开放。</p>
        </header>

        <CourseMap />

        <div className="open-lesson-grid">
          {availableLessons.map((lesson) => (
            <Link className="open-lesson-card" href={lessonHref(lesson) ?? "/"} key={lesson.number}>
              <div className="card-top">
                <span className="lesson-badge">{String(lesson.number).padStart(2, "0")} · OPEN</span>
                {lesson.duration ? <small>{lesson.duration}</small> : null}
              </div>
              <h3>{lesson.shortTitle}</h3>
              <p>{lesson.description}</p>
              <b>进入学习 <span aria-hidden="true">→</span></b>
            </Link>
          ))}

          {nextLesson ? (
            <article className="open-lesson-card is-next" aria-label={`下一课：${nextLesson.shortTitle}`}>
              <div className="card-top">
                <span className="lesson-badge badge-next">{String(nextLesson.number).padStart(2, "0")} · NEXT<i aria-hidden="true" /></span>
              </div>
              <h3>{nextLesson.shortTitle}</h3>
              <p>{nextLesson.description}</p>
              <b className="muted">即将开放</b>
            </article>
          ) : null}
        </div>

        <div className="roadmap-grid" aria-label="尚未开放的课程路线">
          {roadmapStages.map((stage) => {
            const items = lessonsInRange(stage.from, stage.to).filter((l) => l.status === "planned");
            if (items.length === 0) return null;
            return (
              <article className="roadmap-card" key={stage.label}>
                <div className="card-top">
                  <span className="stage-range">{String(stage.from).padStart(2, "0")}–{String(stage.to).padStart(2, "0")}</span>
                  <small>{items.length} 课</small>
                </div>
                <p className="stage-theme">{stage.theme}</p>
                <ul>
                  {items.map((l) => (
                    <li key={l.number}><span>{String(l.number).padStart(2, "0")}</span>{l.shortTitle}</li>
                  ))}
                </ul>
                <small className="stage-label">{stage.label} · 规划中</small>
              </article>
            );
          })}
        </div>
      </section>

      <Disclosure fullLessonHref="/lessons/01-graph-and-state" />

      <section className="ready-cta">
        <p className="eyebrow">READY TO RUN</p>
        <h2>不要停在文字里。<br />现在就去推动你的第一个 Node。</h2>
        <p className="ready-lede">零依赖，零环境安装。第 00–04 课都在浏览器里跑，不需要 API Key。</p>
        <div className="ready-actions">
          <Link className="primary-link" href={lessonHref(availableLessons[0]) ?? "/"}>
            进入第 00 课交互实验 <span aria-hidden="true">→</span>
          </Link>
          <a className="ghost-link" href="#curriculum">翻阅全部大纲</a>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-cols">
          <div>
            <p className="footer-brand"><span className="brand-mark">A</span>Agent Hands-on Lab</p>
            <p>一套把文章、可运行的流程图和小练习绑在一起的 LangGraph 零基础教程。每一课都能在浏览器里点着走完，再决定要不要落到本地 Python。</p>
          </div>
          <div>
            <p className="footer-heading">学习四步法</p>
            <ul className="footer-steps">
              {learningSteps.map(([number, title, description]) => (
                <li key={number}>
                  <b>{number} {title}</b>
                  <span>{description}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="footer-heading">仿真与生产隔离</p>
            <div className="footer-callout">
              <strong>网页里跑的是仿真器</strong>
              <span>
                本站运行纯前端的图状态机仿真，不消耗任何 LLM API Key。
                真实可跑的 Python LangGraph 工程在配套仓库里。
              </span>
            </div>
            <ul>
              <li><a href={REPO} rel="noopener noreferrer" target="_blank"><span>↗</span>GitHub 仓库</a></li>
              <li><a href={`${REPO}/tree/main/lab/langgraph`} rel="noopener noreferrer" target="_blank"><span>↗</span>本地可跑的四课代码</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-base">
          <span>© 2026 Agent Hands-on Lab · 为想真正看懂 Agent 的人而写</span>
          <div>
            <a href={REPO} rel="noopener noreferrer" target="_blank">GitHub</a>
            <span>课程正文 CC BY-NC-SA 4.0</span>
            <span>示例代码 Apache 2.0</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
