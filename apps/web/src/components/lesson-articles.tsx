import type { ComponentType } from "react";
import { LessonZeroArticle } from "@/components/lesson-zero-article";
import { LessonOneArticle } from "@/components/lesson-one-article";
import { LessonTwoArticle } from "@/components/lesson-two-article";
import { LessonThreeArticle } from "@/components/lesson-three-article";
import { LessonFourArticle } from "@/components/lesson-four-article";
import { LessonFiveArticle } from "@/components/lesson-five-article";

/**
 * 课号 → 正文组件。
 *
 * 新开一课只在这里加一行；课程路由不用再动。
 * 只有 `course.ts` 里状态为 open、且带 slug 的课会被路由到。
 */
export const lessonArticles: Record<number, ComponentType> = {
  0: LessonZeroArticle,
  1: LessonOneArticle,
  2: LessonTwoArticle,
  3: LessonThreeArticle,
  4: LessonFourArticle,
  5: LessonFiveArticle,
};
