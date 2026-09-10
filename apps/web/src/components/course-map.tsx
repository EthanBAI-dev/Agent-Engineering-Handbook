import Link from "next/link";

import { allLessonSlots, lessonCounts, lessonHref } from "@/lib/course";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * 课程总览：状态统计条 + 00–30 分页条。
 * 三种状态按 DESIGN.md §2：open 走绿描边，next 用柠檬绿实底加脉冲点，
 * planned 用虚线描边且不可点。
 */
export function CourseMap() {
  return (
    <div className="course-map">
      <div className="course-map-head">
        <div className="course-stats">
          <span>正式 {lessonCounts.total} 课</span>
          <span className="stat-open">
            已开放 {lessonCounts.open} 课{lessonCounts.hasPreface ? " + 前言" : ""}
          </span>
          {lessonCounts.next > 0 ? <span className="stat-next">下一课 {lessonCounts.next} 课</span> : null}
          <span className="stat-planned">规划中 {lessonCounts.planned} 课</span>
        </div>
        <div className="course-legend" aria-label="课程状态图例">
          <span><i className="open" />已开放</span>
          <span><i className="next" />下一课</span>
          <span><i className="planned" />规划中</span>
        </div>
      </div>

      <div className="lesson-strip-scroll">
        <nav className="lesson-strip" aria-label="00 到 30 课进度">
          {allLessonSlots.map((lesson) => {
            const label = pad(lesson.number);
            const href = lessonHref(lesson);

            if (lesson.status === "open" && href) {
              return (
                <Link className="slot slot-open" href={href} key={label} title={`第 ${label} 课 · 已开放`}>
                  {label}
                </Link>
              );
            }
            if (lesson.status === "next") {
              return (
                <span className="slot slot-next" key={label} title={`第 ${label} 课 · 下一课`}>
                  {label}
                  <i aria-hidden="true" />
                </span>
              );
            }
            return (
              <span className="slot slot-planned" key={label} title={`第 ${label} 课 · 规划中`}>
                {label}
              </span>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
