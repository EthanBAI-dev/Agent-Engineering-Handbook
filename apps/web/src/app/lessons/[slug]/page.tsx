import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonZeroArticle } from "@/components/lesson-zero-article";
import { LessonOneArticle } from "@/components/lesson-one-article";
import { LessonTwoArticle } from "@/components/lesson-two-article";
import {
  TOTAL_LESSONS,
  availableLessons,
  courseLessons,
  getLessonBySlug,
  lessonHref,
  prefaceLesson,
} from "@/lib/course";

type LessonPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return availableLessons.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson) return {};
  const description = lesson.description;

  return {
    title: `第 ${String(lesson.number).padStart(2, "0")} 课：${lesson.shortTitle}｜Agent Hands-on Lab`,
    description,
    alternates: { canonical: `/lessons/${slug}` },
    openGraph: {
      title: `第 ${String(lesson.number).padStart(2, "0")} 课：${lesson.shortTitle}`,
      description,
      type: "article",
      images: [],
    },
    twitter: {
      card: "summary",
      title: `第 ${String(lesson.number).padStart(2, "0")} 课：${lesson.shortTitle}`,
      description,
      images: [],
    },
  };
}

function LessonPagination({ current }: { current: number }) {
  const previous = current === 0 ? undefined : current === 1 ? prefaceLesson : courseLessons[current - 2];
  const next = current === 0 ? courseLessons[0] : courseLessons[current];
  const previousHref = previous ? lessonHref(previous) : undefined;
  const nextHref = next ? lessonHref(next) : undefined;

  return (
    <nav className="lesson-pagination" aria-label="课程分页">
      <div className="pager-actions">
        {previousHref ? (
          <Link href={previousHref} className="pager-card pager-previous">
            <span>← 上一课</span><strong>{previous?.shortTitle}</strong>
          </Link>
        ) : (
          <Link href="/#curriculum" className="pager-card pager-previous">
            <span>← 返回</span><strong>30 课目录</strong>
          </Link>
        )}

        {nextHref ? (
          <Link href={nextHref} className="pager-card pager-next">
            <span>下一课 →</span><strong>{next?.shortTitle}</strong>
          </Link>
        ) : (
          <div className="pager-card pager-next disabled" aria-disabled="true">
            <span>下一课</span><strong>{next ? `${String(next.number).padStart(2, "0")} · 制作中` : "已到最后一课"}</strong>
          </div>
        )}
      </div>

      <div className="lesson-number-strip" aria-label={`第 00 课为前言，另有 ${TOTAL_LESSONS} 课；当前第 ${String(current).padStart(2, "0")} 课`}>
        <Link href={lessonHref(prefaceLesson) ?? "/"} className={current === 0 ? "active preface" : "preface"} aria-current={current === 0 ? "page" : undefined} aria-label="第 00 课：前言与环境">
          00
        </Link>
        {courseLessons.map((lesson) => {
          const href = lessonHref(lesson);
          const label = String(lesson.number).padStart(2, "0");
          return href ? (
            <Link key={lesson.number} href={href} className={lesson.number === current ? "active" : ""} aria-current={lesson.number === current ? "page" : undefined} aria-label={`第 ${lesson.number} 课：${lesson.shortTitle}`}>
              {label}
            </Link>
          ) : (
            <span key={lesson.number} className="locked" aria-label={`第 ${lesson.number} 课尚未开放`}>{label}</span>
          );
        })}
      </div>
    </nav>
  );
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson) notFound();

  return (
    <main className="site-shell lesson-site">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="Agent Hands-on Lab 课程目录">
          <span className="brand-mark">A</span>
          <span>Agent Hands-on Lab</span>
        </Link>
        <Link className="catalog-link" href="/#curriculum">全部课程</Link>
        <span className="progress-label">{lesson.number === 0 ? "第 00 课 · 前言" : `第 ${lesson.number} / ${TOTAL_LESSONS} 课`}</span>
      </header>

      <div className="lesson-page-grid">
        <aside className="lesson-side-index">
          <Link href="/#curriculum">← 课程目录</Link>
          <p>当前学习</p>
          <strong>{String(lesson.number).padStart(2, "0")}</strong>
          <span>{lesson.shortTitle}</span>
          <div className="side-progress"><i style={{ width: `${lesson.number === 0 ? 2 : (lesson.number / TOTAL_LESSONS) * 100}%` }} /></div>
          <small>{lesson.number === 0 ? "PREFACE · READY" : `${Math.round((lesson.number / TOTAL_LESSONS) * 100)}% of course`}</small>
        </aside>

        <div className="lesson-page-content">
          {lesson.number === 0 ? <LessonZeroArticle /> : lesson.number === 1 ? <LessonOneArticle /> : <LessonTwoArticle />}
          <LessonPagination current={lesson.number} />
        </div>
      </div>

      <footer>
        <span>Agent Hands-on Lab</span>
        <span>读一段，动一步。</span>
      </footer>
    </main>
  );
}
