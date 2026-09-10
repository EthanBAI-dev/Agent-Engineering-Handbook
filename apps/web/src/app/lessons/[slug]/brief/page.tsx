import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonZeroArticleBrief } from "@/components/variants/lesson-zero-article-brief";
import { LessonOneArticleBrief } from "@/components/variants/lesson-one-article-brief";
import { LessonTwoArticleBrief } from "@/components/variants/lesson-two-article-brief";
import { LessonThreeArticleBrief } from "@/components/variants/lesson-three-article-brief";
import { availableLessons, getLessonBySlug } from "@/lib/course";

type BriefPageProps = { params: Promise<{ slug: string }> };

/** 只有 00–03 有补充正文之前的精简版；之后的课直接按新标准写，没有对照版本。 */
const BRIEF_LESSONS = new Set([0, 1, 2, 3]);

export function generateStaticParams() {
  return availableLessons
    .filter((lesson) => BRIEF_LESSONS.has(lesson.number))
    .map((lesson) => ({ slug: lesson.slug }));
}

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * 精简版对照页。
 *
 * 保留补充正文之前的版本，方便判断「正文加厚」是不是改进。
 * 不进入课程目录和分页，也不被搜索引擎收录。
 */
export default async function LessonBriefPage({ params }: BriefPageProps) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson || !BRIEF_LESSONS.has(lesson.number)) notFound();

  return (
    <main className="site-shell lesson-site">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="Agent Hands-on Lab 课程目录">
          <span className="brand-mark">A</span>
          <span>Agent Hands-on Lab</span>
        </Link>
        <Link className="catalog-link" href={`/lessons/${slug}`}>看正式版 →</Link>
        <span className="progress-label">精简版对照</span>
      </header>

      <div className="lesson-page-grid">
        <div className="lesson-page-content">
          <p className="variant-banner">
            这是<strong>补充正文之前</strong>的精简版，只用于对照阅读。
            正式版本在 <Link href={`/lessons/${slug}`}>/lessons/{slug}</Link>。
          </p>
          {lesson.number === 0 ? (
            <LessonZeroArticleBrief />
          ) : lesson.number === 1 ? (
            <LessonOneArticleBrief />
          ) : lesson.number === 2 ? (
            <LessonTwoArticleBrief />
          ) : (
            <LessonThreeArticleBrief />
          )}
        </div>
      </div>

      <footer>
        <span>Agent Hands-on Lab</span>
        <span>精简版对照</span>
      </footer>
    </main>
  );
}
