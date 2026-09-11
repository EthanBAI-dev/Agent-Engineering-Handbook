"use client";

import { ScenarioLab, type ScenarioState } from "@/components/lab-kit";
import { Prose } from "@/components/auto-term";
import { AsciiFigure, Callout, CodeBlock, Misconceptions, RunLocally, Takeaways } from "@/components/article-kit";

/** 数字对齐 10_budget.py 实跑：上限 1/3/5/8 → 消息 3/7/11/17 条。 */
function compute(s: ScenarioState) {
  const limit = Number(s.limit);
  const orderRight = String(s.order) === "budget-first";
  const runaway = String(s.model) === "runaway";
  const calls = runaway ? limit : Math.min(2, limit);
  const cut = runaway && orderRight;
  const messages = runaway ? (orderRight ? 2 * limit + 1 : 2 * limit + 1) : 4;
  const last = runaway
    ? orderRight
      ? `已达本次请求上限（${limit} 次模型调用），先返回目前的进展。`
      : "（永远不会到达——预算判断在死代码里，循环停不下来）"
    : "查到了，资料在官网。";
  return {
    rows: [
      { label: "模型调用", value: `${calls} 次 / 上限 ${limit} 次`, tone: (cut ? "bad" : "normal") as "bad" | "normal" },
      { label: "消息条数", value: runaway && !orderRight ? "一直增长" : `${messages} 条`, tone: "normal" as const },
      { label: "最后一条", value: last, tone: (cut ? "good" : runaway ? "bad" : "normal") as "good" | "bad" | "normal" },
    ],
    lines: !orderRight
      ? [{ text: "条件边里先看了 tool_calls：只要模型还想调用工具，第一个 if 永远先命中，预算检查是死代码。它不会报错，只会出现在账单上。", tone: "bad" as const }]
      : runaway
        ? [{ text: `模型每一轮都想再搜一次。停在第 ${limit} 次，用户拿到一句说得通的话，而不是 500 错误。`, tone: "good" as const }]
        : [{ text: "正常请求用了 2 次，没碰到上限。限额不影响正常使用——这是一个好限额的标志。", tone: "good" as const }],
    verdict: {
      text: orderRight && runaway
        ? "对了。预算判断放在第一位，失控请求被截断并给出说明。"
        : orderRight
          ? "正常路径没问题。把模型换成停不下来的那个，看上限起不起作用。"
          : "把预算判断提到条件边的第一位。",
      passed: orderRight && runaway,
    },
  };
}

export function LessonTenArticle() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 10 · 限额与成本</p>
        <h1>模型不会自己停，<br />得你来停。</h1>
        <p className="chapter-dek">上线第一个 Agent 之后，最先出事的通常不是回答质量，是账单和响应时间。</p>
        <div className="chapter-meta"><span>预计 9 分钟</span><span>无需 API</span><span>承接第 09 课</span></div>
      </header>

      <Prose label="只看一句话的话">
        <h2>「让提示词告诉它别循环太久」不是控制。</h2>
        <p>控制是代码里一条数得清的硬上限。回到第 02 课的闭环：<code>model → tools → model</code> 的出口只有一个——模型不再提出工具调用。也就是说，<strong>是否结束由模型决定</strong>。这在教学示例里没问题，在线上就成了敞口。</p>
        <p className="term-hint">带虚线的词都可以悬停、聚焦或点击查看解释。</p>
      </Prose>

      <Prose label="加一个数得清的计数器">
        <h2>给 State 多一个字段，条件边里先查它。</h2>
        <CodeBlock caption="条件边">{`def route(state: BudgetState) -> str:
    if state["model_calls"] >= MAX_MODEL_CALLS:
        return "stop_note"
    return "tools" if state["messages"][-1].tool_calls else END`}</CodeBlock>
        <Callout tone="warn" title="顺序不能反">
          反过来写——先看 <code>tool_calls</code> 再查预算——只要模型还想调用工具，第一条就命中了，
          预算检查永远轮不到。这类 bug 不会报错，只会在账单上出现。
        </Callout>
      </Prose>

      <Prose className="lab-intro" label="自己拨一次">
        <h2>只能改三样：上限、判断顺序、模型。</h2>
        <p>先用正常模型看限额影不影响正常使用，再换成停不下来的那个，最后把判断顺序调反，看上限怎样失效。</p>
      </Prose>

      <ScenarioLab
        kicker="INTERACTIVE 10"
        title="调上限，看两条路径"
        storageKey="agent-lab-lesson-10"
        controls={[
          { kind: "slider", id: "limit", label: "单次请求调用上限", min: 1, max: 8, initial: 3, format: (v) => `${v} 次` },
          { kind: "segmented", id: "model", label: "模型行为", options: [{ id: "normal", label: "两轮收工" }, { id: "runaway", label: "停不下来" }], initial: "normal" },
          { kind: "segmented", id: "order", label: "条件边判断顺序", options: [{ id: "budget-first", label: "先查预算" }, { id: "tools-first", label: "先看 tool_calls" }], initial: "budget-first" },
        ]}
        compute={compute}
        rowsLabel="这次请求的结果"
        note="消息条数对齐 10_budget.py 的实跑：上限 1/3/5/8 分别得到 3/7/11/17 条——一条用户消息，加上每轮的模型消息和工具消息。"
        code={{
          summary: "展开超限之后走的那个节点",
          text: `def stop_note(state: BudgetState) -> dict:
    return {"messages": [AIMessage(
        content=f"已达本次请求上限（{MAX_MODEL_CALLS} 次模型调用），先返回目前的进展。"
    )]}`,
        }}
      />

      <Prose className="after-lab" label="超限之后要说人话">
        <h2>抛异常对用户是一个 500 页面。</h2>
        <p>走一个专门的节点，给一句能理解的回复。这条消息同样进 <code>messages</code>，所以它会作为最后一条返回给前端，前端不需要为「被截断」写特殊分支。</p>
      </Prose>

      <Prose label="这一层之外还有两层">
        <h2>本课只做了第一层。</h2>
        <AsciiFigure>{`单次请求的调用上限   一个请求里的死循环   本课
单个用户的用量配额   一个人反复发请求     第 29 课（需要账号）
全站的总预算与告警   所有人加起来烧超     计费侧的监控`}</AsciiFigure>
        <p>只做第一层就上线，等于「每个请求都很克制，但请求数量不受限」。在没有第 29 课的账号体系之前，接口不要公开暴露。</p>
        <p>除了次数，还可以数 token 用量（更贴近成本，但只能事后累计）和墙上时间（防的是「每一步都不慢，但步数太多」）。<strong>先做次数上限——它是唯一一个在调用发生之前就能拦住的。</strong></p>
      </Prose>

      <RunLocally file="lab/langgraph/examples/10_budget.py" command="uv run python examples/10_budget.py">
        <strong>不需要 API Key</strong>。推荐改两处再跑：把上限调成 1 看截断提前；再把 <code>route</code> 里的两个判断调换顺序，看上限怎样失效——第二个实验比读十遍说明更有用。
      </RunLocally>

      <Prose label="三个常见误区">
        <h2>「加上限会影响正常用户」是最常见的一条。</h2>
        <Misconceptions
          items={[
            { claim: "在提示词里写「最多查三次」就够了", verdict: "那是建议", body: <p>模型可能遵守，也可能在长对话里忘掉。能强制执行的只有代码。</p> },
            { claim: "加上限会影响正常用户", verdict: "实测不会", body: <p>正常请求用了 2 次，上限 3 次，完全没被触碰。上限该设在「异常」和「正常」之间，设不准就先记录真实分布。</p> },
            { claim: "超限抛个异常就行", verdict: "前端要多写分支", body: <p>异常对用户是一个 500 页面。走 <code>stop_note</code> 节点则让截断成为一条普通消息。</p> },
          ]}
        />
      </Prose>

      <Prose className="after-lab" label="本课带走">
        <h2>三句话。</h2>
        <Takeaways title="第十课带走" items={["结束循环的权力交给计数器，不是模型", "预算判断放条件边第一位", "超限走专门节点，给一句说得通的话"]} />
      </Prose>

      <section className="chapter-bridge">
        <span>NEXT</span><i />
        <span>单元二结束。下一课进入单元三，先解决「请求进错分支」这个最常见的失败。</span>
      </section>
    </article>
  );
}
