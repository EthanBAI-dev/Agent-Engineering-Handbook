"use client";

import { ScenarioLab, type ScenarioState } from "@/components/lab-kit";
import { Prose } from "@/components/auto-term";
import { Callout, CodeBlock, Misconceptions, RunLocally, Takeaways } from "@/components/article-kit";

const OUTPUTS = [
  { id: "valid", label: "refund（合法枚举）" },
  { id: "case", label: "REFUND_NOW（大小写不同）" },
  { id: "prose", label: "「我觉得应该给他退款吧」" },
];
const RAW: Record<string, string> = { valid: "refund", case: "REFUND_NOW", prose: "我觉得应该给他退款吧" };

function compute(s: ScenarioState) {
  const out = String(s.output);
  const guarded = Boolean(s.guard);
  const raw = RAW[out];
  const legal = raw === "refund";
  const route = guarded ? (legal ? "refund" : "human") : raw;
  const crashed = !guarded && !legal;
  return {
    rows: [
      { label: "raw_route（模型说了什么）", value: raw, tone: "muted" as const },
      { label: "route（程序信了什么）", value: crashed ? "—" : route, tone: (crashed ? "bad" : legal ? "normal" : "good") as "bad" | "normal" | "good" },
      { label: "最终结果", value: crashed ? `KeyError: '${raw}'` : legal ? "已为你创建退款单。" : "已转接人工客服。", tone: (crashed ? "bad" : "normal") as "bad" | "normal" },
    ],
    lines: crashed
      ? [{ text: "条件边的返回值被当成节点名去查找，找不到就直接抛异常。对用户来说这是一个 500 错误，而触发条件——模型某次输出格式不对——你无法提前穷举。", tone: "bad" as const }]
      : legal
        ? [{ text: "合法值直接进入对应分支。第一层结构化输出让这种情况更常见，但不能保证。" }]
        : [{ text: "白名单校验把不在允许集合里的值拨到兜底分支。流程没有崩，也没有走错。", tone: "good" as const }],
    verdict: {
      text: guarded && !legal ? "对了。非法输出被挡在控制流之外，落到最安全的兜底分支。" : guarded ? "合法值当然没问题。换成后两种输出，看校验起不起作用。" : "打开白名单校验。",
      passed: guarded && !legal,
    },
  };
}

export function LessonElevenArticle() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 11 · Router</p>
        <h1>别把模型吐的字符串<br />直接当分支键。</h1>
        <p className="chapter-dek">分类是 Agent 里最常见的一步。最容易写错的做法，是让模型回一句自然语言，再用关键词去判断。</p>
        <div className="chapter-meta"><span>预计 8 分钟</span><span>无需 API</span><span>单元三开始</span></div>
      </header>

      <Prose label="只看一句话的话">
        <h2>先让模型从固定枚举里选，再用你自己的白名单校验它——两层都要。</h2>
        <p>关键词匹配有三个问题，而且都不会在测试时暴露：模型说「这个不是退款问题」会命中「退款」；换一种措辞可能一个都不命中；措辞一变你的关键词表就得跟着改。</p>
        <p className="term-hint">带虚线的词都可以悬停、聚焦或点击查看解释。</p>
      </Prose>

      <Prose label="第一层：结构化输出">
        <h2>把分类做成一个工具，参数用固定枚举限制取值。</h2>
        <CodeBlock>{`@tool
def classify(route: Literal["refund", "shipping", "human"], reason: str) -> str:
    """把用户请求分到一个已知类别。"""
    return route`}</CodeBlock>
        <p><code>reason</code> 不参与路由，但强烈建议留着——出问题时你要能看出模型「以为」这是什么请求。</p>
      </Prose>

      <Prose label="第二层：白名单校验">
        <h2>结构化输出让模型更可能给出合法值，不是保证。</h2>
        <CodeBlock>{`raw = message.tool_calls[0]["args"]["route"] if message.tool_calls else str(message.content)
route = raw if raw in ROUTES else FALLBACK
return {"raw_route": raw, "route": route}`}</CodeBlock>
        <p>存两个字段：<code>raw_route</code> 记录模型原本说了什么，<code>route</code> 是校验之后真正用于分支的值。出问题时，这两个字段的差异就是答案。</p>
      </Prose>

      <Prose className="lab-intro" label="自己试三种输出">
        <h2>合法值、大小写不同的值、一段自然语言。</h2>
        <p>关掉校验开关，看后两种会发生什么。</p>
      </Prose>

      <ScenarioLab
        kicker="INTERACTIVE 11"
        title="让路由挡住三种坏输入"
        storageKey="agent-lab-lesson-11"
        controls={[
          { kind: "segmented", id: "output", label: "模型这次输出", options: OUTPUTS, initial: "valid" },
          { kind: "switch", id: "guard", label: "白名单校验", note: "raw in ROUTES else FALLBACK", initial: true },
        ]}
        compute={compute}
        rowsLabel="这次分类的结果"
        note="KeyError 是本仓库实测的行为：条件边返回一个图里不存在的节点名时，LangGraph 直接抛 KeyError。"
        code={{
          summary: "展开兜底分支的选法",
          text: `ROUTES = ("refund", "shipping", "human")
FALLBACK = "human"      # 宁可转人工，也不要让流程崩掉或走错

# 兜底不能选 refund、delete_account 这类有后果的分支：
# 每一次模型输出异常，都会走进破坏性最强的那条路。`,
        }}
      />

      <Prose className="after-lab" label="兜底分支怎么选">
        <h2>问一句：如果这次判断完全错了，走哪条路损失最小？</h2>
        <p>通常是转人工，而不是退款或删除。兜底分支的正确选法是「最安全」，不是「最常见」，更不是「列表里的最后一个」。</p>
        <Callout tone="warn" title="同一条原则会反复出现">
          第 11 课校验分支键，第 17 课校验可编辑字段，第 24 课校验整份计划，第 28 课校验工具参数——
          <strong>任何来自模型或外部的值，进入控制流之前都要过一次白名单。</strong>
        </Callout>
      </Prose>

      <RunLocally file="lab/langgraph/examples/11_router.py" command="uv run python examples/11_router.py">
        <strong>不需要 API Key</strong>。推荐改一处再跑：把 <code>route = raw if raw in ROUTES else FALLBACK</code> 改成 <code>route = raw</code>，亲眼看到那个 <code>KeyError</code>。
      </RunLocally>

      <Prose label="三个常见误区">
        <h2>「结构化输出之后就不用校验了」是最贵的一条。</h2>
        <Misconceptions
          items={[
            { claim: "结构化输出之后就不用校验了", verdict: "只是降低概率", body: <p>实跑的后两种输入就是它失效的两种方式。任何来自模型的值，进入控制流之前都要过一次白名单。</p> },
            { claim: "用 if/elif 关键词匹配也能跑通", verdict: "扛不住真实措辞", body: <p>能跑通测试用例，失败方式是「悄悄走错分支」，比崩溃更难发现。</p> },
            { claim: "分支越多，Agent 越智能", verdict: "反而更不稳", body: <p>分支多只会让每一类的样本更少、判断更不稳。先做三四类，把兜底做对，再按真实数据拆分。</p> },
          ]}
        />
      </Prose>

      <Prose className="after-lab" label="本课带走">
        <h2>三句话。</h2>
        <Takeaways title="第十一课带走" items={["让模型从固定枚举里选", "进入控制流之前过一次白名单", "兜底选最安全的，不是最常见的"]} />
      </Prose>

      <section className="chapter-bridge">
        <span>NEXT</span><i />
        <span>路由不会走错了。但 State 本身还很脆弱——字段名写错不会报错。</span>
      </section>
    </article>
  );
}
