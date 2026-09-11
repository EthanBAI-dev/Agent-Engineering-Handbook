import type { ComponentType } from "react";
import { LessonZeroArticle } from "@/components/lesson-zero-article";
import { LessonOneArticle } from "@/components/lesson-one-article";
import { LessonTwoArticle } from "@/components/lesson-two-article";
import { LessonThreeArticle } from "@/components/lesson-three-article";
import { LessonFourArticle } from "@/components/lesson-four-article";
import { LessonFiveArticle } from "@/components/lesson-five-article";
import { LessonSixArticle } from "@/components/lesson-six-article";
import { LessonSevenArticle } from "@/components/lesson-seven-article";
import { LessonEightArticle } from "@/components/lesson-eight-article";
import { LessonNineArticle } from "@/components/lesson-nine-article";
import { LessonTenArticle } from "@/components/lesson-ten-article";
import { LessonElevenArticle } from "@/components/lesson-eleven-article";
import { LessonTwelveArticle } from "@/components/lesson-twelve-article";
import { LessonThirteenArticle } from "@/components/lesson-thirteen-article";
import { LessonFourteenArticle } from "@/components/lesson-fourteen-article";
import { LessonFifteenArticle } from "@/components/lesson-fifteen-article";
import { LessonSixteenArticle } from "@/components/lesson-sixteen-article";
import { LessonSeventeenArticle } from "@/components/lesson-seventeen-article";
import { LessonEighteenArticle } from "@/components/lesson-eighteen-article";
import { LessonNineteenArticle } from "@/components/lesson-nineteen-article";
import { LessonTwentyArticle } from "@/components/lesson-twenty-article";

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
  6: LessonSixArticle,
  7: LessonSevenArticle,
  8: LessonEightArticle,
  9: LessonNineArticle,
  10: LessonTenArticle,
  11: LessonElevenArticle,
  12: LessonTwelveArticle,
  13: LessonThirteenArticle,
  14: LessonFourteenArticle,
  15: LessonFifteenArticle,
  16: LessonSixteenArticle,
  17: LessonSeventeenArticle,
  18: LessonEighteenArticle,
  19: LessonNineteenArticle,
  20: LessonTwentyArticle,
};
