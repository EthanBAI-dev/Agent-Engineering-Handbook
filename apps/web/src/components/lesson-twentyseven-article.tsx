"use client";

import { ScenarioLab, type ScenarioState } from "@/components/lab-kit";
import { Prose } from "@/components/auto-term";
import { Callout, CodeBlock, Misconceptions, RunLocally, Takeaways } from "@/components/article-kit";

/** 数字对齐 27_eval.py 实跑：v1 4/5，v2 5/5，v3 4/5，c5 是唯一会变的那条。 */
const VERSIONS: Record<string, { pass: number; fail: string[]; note: string; trace: string }> = {
  v1: { pass: 4, fail: ["c5"], note: "只用第一条检索结果", trace: "检索命中 2 条 → 走回答分支（检索对了，用的时候丢了一条）" },
  v2: { pass: 5, fail: [], note: "把命中的都带上", trace: "—" },
  v3: { pass: 4, fail: ["c5"], note: "在 v2 基础上收紧检索", trace: "检索命中 1 条 → 走回答分支（检索就少了一条）" },
};

function compute(s: ScenarioState) {
  const a = String(s.from), b = String(s.to);
  const A = VERSIONS[a], B = VERSIONS[b];
  const fixed = A.fail.filter((x) => !B.fail.includes(x));
  const broke = B.fail.filter((x) => !A.fail.includes(x));
  return {
    rows: [
      { label: `${a} → ${b}`, value: `${A.pass}/5 → ${B.pass}/5`, tone: "normal" as const },
      { label: "修好了", value: fixed.length ? fixed.join("、") : "无", tone: (fixed.length ? "good" : "muted") as "good" | "muted" },
      { label: "弄坏了", value: broke.length ? broke.join("、") : "无", tone: (broke.length ? "bad" : "muted") as "bad" | "muted" },
      { label: `${b} 里 c5 的运行路径`, value: B.fail.includes("c5") ? B.trace : "通过", tone: "muted" as const },
    ],
    lines: broke.length
      ? [{ text: `${b} 的动机（${B.note}）方向没错，但它把 c5 这种多关键词的问题弄坏了。只看总分是 ${A.pass}/5 → ${B.pass}/5；真正有用的信息是「弄坏了 ${broke.join("、")}」，它直接告诉你去看哪一条。`, tone: "bad" as const }]
      : fixed.length
        ? [{ text: `修好了 ${fixed.join("、")}。逐例对比比总分值钱：一次改动修好三个、弄坏两个，总分是 +1，看起来是进步，但那两个可能是最重要的用例。`, tone: "good" as const }]
        : [{ text: "总分没变，逐例也没变。" }],
    verdict: {
      text: broke.length ? "找到了回归。再看那一行运行路径——同一个错误答案，v1 和 v3 的病因完全不同。" : "试试 v2 → v3，总分下降的那一组。",
      passed: broke.length > 0,
    },
  };
}

export function LessonTwentySevenArticle() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 27 · 评测与观测</p>
        <h1>「感觉变好了」<br />不是证据。</h1>
        <p className="chapter-dek">改一版提示词，跑两个例子觉得不错，就上线了。过两天用户报了一个从前能答对的问题。</p>
        <div className="chapter-meta"><span>预计 9 分钟</span><span>无需 API</span><span>承接第 26 课</span></div>
      </header>

      <Prose label="只看一句话的话">
        <h2>没有数据集，你连「这次改动是变好还是变差」都说不清。</h2>
        <p>五个例子就能开始工作。真正重要的是它们的<strong>构成</strong>：三个正常问题覆盖不同知识点，一个<strong>期望拒绝</strong>的问题（第 26 课那条路径也要测），一个需要多条资料才能答对的问题。</p>
        <p className="term-hint">带虚线的词都可以悬停、聚焦或点击查看解释。</p>
      </Prose>

      <Prose label="期望写「必须包含」，不写标准答案">
        <h2>这条决定了数据集能不能活过三个月。</h2>
        <CodeBlock>{`标准答案：'年假从入职满一年起算，每年 10 天。'
  模型换个说法就判失败，你会疲于更新期望，最后干脆不跑了。

必须包含：'10 天'
  抓住这道题真正要考的事实，措辞自由。`}</CodeBlock>
        <p>判得太严的数据集，会因为维护成本太高而被放弃——<strong>一个没人跑的数据集，价值是零。</strong></p>
      </Prose>

      <Prose className="lab-intro" label="自己对比一次">
        <h2>三个版本，一个数据集。</h2>
        <p>先看 v1 → v2，再看 v2 → v3。第二组的总分是下降的，但真正有用的信息不在总分里。</p>
      </Prose>

      <ScenarioLab
        kicker="INTERACTIVE 27"
        title="找出被弄坏的那一条"
        storageKey="agent-lab-lesson-27"
        controls={[
          { kind: "segmented", id: "from", label: "从哪个版本", options: [{ id: "v1", label: "v1" }, { id: "v2", label: "v2" }], initial: "v1" },
          { kind: "segmented", id: "to", label: "改到哪个版本", options: [{ id: "v2", label: "v2" }, { id: "v3", label: "v3" }], initial: "v2" },
        ]}
        compute={compute}
        rowsLabel="这次改动的逐例对比"
        note="三个版本在同一数据集上的通过率来自 27_eval.py 的实跑：v1 4/5、v2 5/5、v3 4/5，c5 是唯一会变的那条。"
        code={{
          summary: "展开最小可行的可观测",
          text: `每次运行记下三样：
  1. 走了哪些节点  —— 区分「答错了」和「本该拒绝却回答了」
  2. 每步花了多久  —— 找出是哪一步慢
  3. 模型调用几次  —— 对应第 10 课的成本

这三样不需要任何工具，往 State 里加一个 trace 字段就有了。`,
        }}
      />

      <Prose className="after-lab" label="同一个错误答案，两种病因">
        <h2>没有运行路径，你会去改错地方。</h2>
        <CodeBlock>{`v1 的 c5：检索命中 2 条 → 走回答分支     ← 检索对了，用的时候丢了一条
v3 的 c5：检索命中 1 条 → 走回答分支     ← 检索就少了一条`}</CodeBlock>
        <p>同一个例子、同样的错误答案，<strong>病因完全不同</strong>，修法也不同。这就是可观测的价值。</p>
        <Callout title="什么时候跑">
          每次改提示词、换模型、改检索之后；每次改图结构之后（条件边改一下就可能改变整条路径）；上线前。
          跑一次五秒钟——<strong>成本低到没有理由不跑，是数据集能坚持下来的前提。</strong>
        </Callout>
      </Prose>

      <RunLocally file="lab/langgraph/examples/27_eval.py" command="uv run python examples/27_eval.py">
        <strong>不需要 API Key</strong>。建议自己加一个例子再跑。加例子的最佳时机是<strong>每次线上出问题之后</strong>：把那个问题变成数据集里的一条，它就再也不会悄悄回归。
      </RunLocally>

      <Prose label="本课挑战：这个数据集为什么没用">
        <h2>三条测的是同一件事。</h2>
        <CodeBlock>{`{"question": "年假有几天？",   "expect": "年假从入职满一年起算，每年 10 天。"},
{"question": "年假怎么算？",   "expect": "年假从入职满一年起算，每年 10 天。"},
{"question": "年假几天呀？",   "expect": "年假从入职满一年起算，每年 10 天。"},`}</CodeBlock>
        <p>通过率永远是 0/3 或 3/3，提供的信息量等于一条。而且期望是整句标准答案，模型换个措辞就判失败，很快就没人愿意维护它。</p>
        <p>好数据集的判断标准：<strong>每加一条，它能发现的新失败方式是不是也多了一种？</strong></p>
      </Prose>

      <Prose label="三个常见误区">
        <h2>覆盖不同失败方式，比数量重要。</h2>
        <Misconceptions
          items={[
            { claim: "例子越多越好", verdict: "覆盖更重要", body: <p>覆盖不同失败方式的五条，胜过同一类的五十条。而且跑得慢的数据集没人跑。</p> },
            { claim: "总分上升就是改好了", verdict: "会掩盖回归", body: <p>实跑的 v2 → v3 说明总分会掩盖回归。逐例对比才看得见。</p> },
            { claim: "等有空了再补数据集", verdict: "出问题时最好补", body: <p>线上出问题的那一刻就是最好的时机：把它变成一条例子，成本最低，价值最高。</p> },
          ]}
        />
      </Prose>

      <Prose className="after-lab" label="本课带走">
        <h2>三句话。</h2>
        <Takeaways title="第二十七课带走" items={["期望写「必须包含」，不写标准答案", "逐例对比修好了什么、弄坏了什么", "记下运行路径，否则会改错地方"]} />
      </Prose>

      <section className="chapter-bridge">
        <span>NEXT</span><i />
        <span>它答得有据、改得可测。还剩最后一类问题：有人故意想让它做坏事。</span>
      </section>
    </article>
  );
}
