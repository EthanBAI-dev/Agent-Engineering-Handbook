import Link from "next/link";

import { Misconceptions } from "@/components/article-kit";
import { LessonOneLab } from "@/components/lesson-one-lab";

/**
 * 首页的互动实验预览：左边一段第 01 课的真实摘录，右边直接跑第 01 课的实验台。
 * 刻意复用 LessonOneLab 而不是做一个假的静态图——预览里点得动的，就是课里那一个。
 */
export function LabPreview() {
  return (
    <section className="lab-preview" id="preview" aria-labelledby="preview-title">
      <div className="lab-preview-head">
        <div>
          <p className="eyebrow preview-eyebrow">
            <span>Interactive Lab Preview</span>
            <i aria-hidden="true">·</i>
            <span>Lesson 01 仿真沙盒</span>
          </p>
          <h2 id="preview-title">文章不是动画的说明书。<br />它们共同完成一次学习。</h2>
        </div>
        <p className="preview-note">
          <i aria-hidden="true" />
          前端纯状态机仿真 · 零外部 API 消耗
        </p>
      </div>

      <div className="lab-preview-split">
        <div className="excerpt-column">
          <article className="excerpt-card">
            <div className="excerpt-card-head">
              <span>EXCERPT · LESSON 01</span>
              <span>心智模型</span>
            </div>
            <h3>Agent 不是一次回答，而是一条会改变 State 的路</h3>
            <div className="excerpt-body">
              <p>普通函数像一次性办完一件事：输入进去，结果出来，中间发生了什么很难看见。</p>
              <p>
                图不一样。State 在步骤之间传递；Node 做一小步；Edge 决定下一步去哪。
                所谓「循环执行」，不是模型拥有什么神秘意志——只是图里有一条会绕回前面节点的条件 Edge。
              </p>
              <blockquote>
                把它想成接力赛：State 是接力棒，Node 是运动员，Edge 是跑道。
                每个人只完成自己的一段，然后把同一根棒交给下一个人。
              </blockquote>
            </div>
          </article>

          <Misconceptions
            items={[
              {
                claim: "本课这张图已经是一个 Agent 了",
                verdict: "还不是",
                body: (
                  <p>
                    它的路线是程序员提前写死的。下一课会把「要不要调用工具」交给 model 决定，
                    但真正执行工具的仍然不是模型。
                  </p>
                ),
              },
            ]}
          />

          <Link className="excerpt-more" href="/lessons/01-graph-and-state">
            读完整的第 01 课 <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="lab-column">
          <LessonOneLab />
        </div>
      </div>
    </section>
  );
}
