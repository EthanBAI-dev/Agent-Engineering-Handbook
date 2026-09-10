import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonZeroArticleBrief } from "@/components/variants/lesson-zero-article-brief";
import { LessonOneArticleBrief } from "@/components/variants/lesson-one-article-brief";
import { LessonTwoArticleBrief } from "@/components/variants/lesson-two-article-brief";
import { LessonThreeArticleBrief } from "@/components/variants/lesson-three-article-brief";
import { TOTAL_LESSONS, availableLessons, getLessonBySlug } from "@/lib/course";

type BriefPageProps = { params: Promise<{ slug: string }> };

/** 目前有精简版的课。没有精简版的课直接 404，不要落到别人的正文上。 */
const BRIEF_LESSONS = new Set([0, 1, 2, 3]);

export function generateStaticParams() {
  return availableLessons
    .filter((lesson) => BRIEF_LESSONS.has(lesson.number))
    .map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }: BriefPageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson || !BRIEF_LESSONS.has(lesson.number)) return {};
  return {
    title: `第 ${String(lesson.number).padStart(2, "0")} 课：${lesson.shortTitle}（精简版）｜Agent Hands-on Lab`,
    description: lesson.description,
    alternates: { canonical: `/lessons/${slug}` },
  };
}

/**
 * 精简版课页。
 *
 * 和完整版共用同一套版式与互动实验，区别只在正文深度：
 * 精简版讲清楚一件事，完整版补上代码、边界、常见误区与检查清单。
 */
export default async function LessonBriefPage({ params }: BriefPageProps) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson || !BRIEF_LESSONS.has(lesson.number)) notFound();

  const number = String(lesson.number).padStart(2, "0");

  return (
    <main className="site-shell lesson-site">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="Agent Hands-on Lab 课程目录">
          <span className="brand-mark">A</span>
          <span>Agent Hands-on Lab</span>
        </Link>
        <Link className="catalog-link" href="/#curriculum">全部课程</Link>
        <span className="progress-label">精简版 · 第 {number} 课</span>
      </header>

      <div className="lesson-page-grid">
        <aside className="lesson-side-index">
          <Link href="/#curriculum">← 课程目录</Link>
          <p>精简版</p>
          <strong>{number}</strong>
          <span>{lesson.shortTitle}</span>
          <div className="side-progress">
            <i style={{ width: `${lesson.number === 0 ? 2 : (lesson.number / TOTAL_LESSONS) * 100}%` }} />
          </div>
          <small>FREE TIER</small>
        </aside>

        <div className="lesson-page-content">
          <div className="tier-banner">
            <div>
              <strong>你正在读精简版</strong>
              <p>互动实验和完整版完全一样。完整版另外补上真实代码、边界条件、常见误区和排查清单。</p>
            </div>
            <Link className="tier-link" href={`/lessons/${slug}`}>看完整版 →</Link>
          </div>

          {lesson.number === 0 ? (
            <LessonZeroArticleBrief />
          ) : lesson.number === 1 ? (
            <LessonOneArticleBrief />
          ) : lesson.number === 2 ? (
            <LessonTwoArticleBrief />
          ) : (
            <LessonThreeArticleBrief />
          )}

          <div className="tier-banner tier-banner-end">
            <div>
              <strong>这一课的完整版还有</strong>
              <p>真实 Python 代码逐段拆解、结果对不上时的检查清单、三个常见误区，以及本地怎么跑通。</p>
            </div>
            <Link className="tier-link" href={`/lessons/${slug}`}>看完整版 →</Link>
          </div>
        </div>
      </div>

      <footer>
        <span>Agent Hands-on Lab</span>
        <span>精简版 · 免费阅读</span>
      </footer>
    </main>
  );
}
