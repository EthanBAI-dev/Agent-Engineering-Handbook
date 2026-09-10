import Link from "next/link";

import {
  allLessonSlots,
  getLessonByNumber,
  lessonHref,
  type CourseLesson,
} from "@/lib/course";

const REPO = "https://github.com/EthanBAI-dev/Agent-Engineering-Handbook";
const pad = (number: number) => String(number).padStart(2, "0");

function LessonSlot({ lesson, current }: { lesson: CourseLesson; current: number }) {
  const href = lessonHref(lesson);
  const className = [
    "lesson-course-slot",
    `is-${lesson.status}`,
    lesson.number === current ? "is-current" : "",
  ].filter(Boolean).join(" ");

  return href ? (
    <Link
      href={href}
      className={className}
      aria-current={lesson.number === current ? "page" : undefined}
      title={`第 ${pad(lesson.number)} 课 · ${lesson.shortTitle}`}
    >
      {pad(lesson.number)}
    </Link>
  ) : (
    <span className={className} title={`第 ${pad(lesson.number)} 课 · ${lesson.status === "next" ? "下一课" : "规划中"}`}>
      {pad(lesson.number)}
    </span>
  );
}

/** 课程页顶部的完整 00–30 轨道。保持所有课都可见，窄屏横向滚动。 */
export function LessonCourseStrip({ current, tier }: { current: number; tier?: "brief" }) {
  const lesson = getLessonByNumber(current);

  return (
    <section className="lesson-course-strip" aria-label="课程位置与快速跳转">
      <div className="lesson-course-strip-inner">
        <Link className="lesson-crumb" href="/#curriculum">
          <span aria-hidden="true">⌁</span>
          <strong>00–30 课程 / {pad(current)} · {lesson?.shortTitle}</strong>
        </Link>

        <nav className="lesson-course-track" aria-label="00 到 30 课快速跳转">
          {allLessonSlots.map((item) => (
            <LessonSlot lesson={item} current={current} key={item.number} />
          ))}
        </nav>

        <div className="lesson-course-actions">
          {tier === "brief" ? <span>精简版 · 免费阅读</span> : <span>完整版</span>}
          <a href={REPO} rel="noopener noreferrer" target="_blank">GitHub 源码 ↗</a>
        </div>
      </div>
    </section>
  );
}
