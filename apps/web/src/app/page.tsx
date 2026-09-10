import Link from "next/link";
import { availableLessons, courseLessons, lessonHref, openLessons, TOTAL_LESSONS } from "@/lib/course";

const learningSteps = [
  ["01", "读", "先用短文回答一个明确问题"],
  ["02", "动", "单步执行，观察节点和数据"],
  ["03", "改", "改变一个参数，制造不同结果"],
  ["04", "证", "通过挑战，确认自己真的理解"],
];

export default function Home() {
  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Agent Hands-on Lab 首页">
          <span className="brand-mark">A</span>
          <span>Agent Hands-on Lab</span>
        </a>
        <nav className="topnav" aria-label="首页导航">
          <a href="#method">学习方式</a>
          <a href="#curriculum">30 课目录</a>
        </nav>
        <span className="progress-label">前言 + {openLessons.length} / {TOTAL_LESSONS} 课已开放</span>
      </header>

      <section className="course-hero" id="top">
        <p className="eyebrow">ARTICLE × ANIMATION × PRACTICE</p>
        <h1>读一段，<br />动一步，<br /><em>真正看懂 Agent。</em></h1>
        <div className="hero-copy">
          <p>这不是把传统教程原样搬到网页。每当文章讲到一个抽象概念，旁边的流程图就能立刻运行。</p>
          <p>30 课各有独立页面和进度位置。你可以按顺序学习，也可以随时回到目录重新定位。</p>
          <Link className="primary-link" href={lessonHref(availableLessons[0]) ?? "/#curriculum"}>从第 00 课开始 <span>→</span></Link>
        </div>
      </section>

      <section className="learning-method" id="method" aria-labelledby="method-title">
        <div className="method-heading">
          <p className="eyebrow">THE LEARNING LOOP</p>
          <h2 id="method-title">文章不是动画的说明书。<br />它们共同完成一次学习。</h2>
        </div>
        <div className="method-grid">
          {learningSteps.map(([number, title, description]) => (
            <article key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>
          ))}
        </div>
      </section>

      <section className="curriculum" id="curriculum">
        <header className="curriculum-heading">
          <div>
            <p className="eyebrow">30-LESSON COURSE</p>
            <h2>一课一个问题。<br />学到哪里，都能接着回来。</h2>
          </div>
          <p>第 00 课是前言，不计入正式 30 课；第 01、02 课已经开放。第 03–30 课的主题和学习产出已经完成来源映射，将按“真实模型 → 状态与可靠性 → 高级模式 → 产品化”逐步开放。</p>
        </header>

        <div className="open-lesson-grid">
          {availableLessons.map((lesson) => (
            <Link className="open-lesson-card" href={lessonHref(lesson) ?? "/"} key={lesson.number}>
              <span>LESSON {String(lesson.number).padStart(2, "0")}</span>
              <h3>{lesson.shortTitle}</h3>
              <p>{lesson.description}</p>
              <div><small>{lesson.duration}</small><b>进入学习 →</b></div>
            </Link>
          ))}
        </div>

        <div className="future-lessons" aria-label="尚未开放的课程">
          {courseLessons.slice(openLessons.length).map((lesson) => (
            <article className={lesson.status === "next" ? "next" : ""} key={lesson.number}>
              <span>{String(lesson.number).padStart(2, "0")}</span>
              <div><strong>{lesson.shortTitle}</strong><small>{lesson.status === "next" ? "下一课" : "待开放"}</small></div>
            </article>
          ))}
        </div>
      </section>

      <section className="next-up">
        <p className="eyebrow">START SMALL</p>
        <h2>不用先装环境。<br />从看见 Agent 走第一步开始。</h2>
        <p>第 00–02 课都能先在浏览器运行，不需要 API Key。理解流程以后，再逐层接入真实 Python、模型和长期记忆。</p>
        <Link className="inverse-link" href={lessonHref(availableLessons[0]) ?? "/"}>进入第 00 课 →</Link>
      </section>

      <footer><span>Agent Hands-on Lab</span><span>30 课 · 持续更新</span></footer>
    </main>
  );
}
