"use client";

import { ScenarioLab, type ScenarioState } from "@/components/lab-kit";
import { Prose } from "@/components/auto-term";
import { Callout, CodeBlock, Misconceptions, RunLocally, Takeaways } from "@/components/article-kit";

function compute(s: ScenarioState) {
  const n = Number(s.count);
  const guarded = Boolean(s.guard);
  const empty = n === 0;
  const skipped = empty && !guarded;
  return {
    rows: [
      { label: "map 任务", value: `${n} 个`, tone: "normal" as const },
      { label: "reduce 有没有执行", value: skipped ? "没有" : "有", tone: (skipped ? "bad" : "good") as "bad" | "good" },
      { label: "报告字段", value: skipped ? "''（停在初始值）" : empty ? "没有需要评审的文件" : `共 ${n} 份，平均 3.4 分`, tone: (skipped ? "bad" : "normal") as "bad" | "normal" },
      { label: "这一次的成本", value: n >= 50 ? `${n} 次模型调用，要考虑分批` : `${n} 次模型调用`, tone: (n >= 50 ? "bad" : "muted") as "bad" | "muted" },
    ],
    lines: skipped
      ? [{ text: "没有异常，也没有报告。fan_out 返回了空列表，review_one 一次都没跑；而 reduce_all 只有一条来自 review_one 的入边，于是它也没跑。整条下游被静默跳过——这是 map-reduce 最容易漏掉的边界。", tone: "bad" as const }]
      : empty
        ? [{ text: "条件函数可以返回一个节点名，也可以返回一串 Send。空集合单独走一条路，就有了说得通的结果。", tone: "good" as const }]
        : n >= 50
          ? [{ text: "并行不改变总成本，只改变总耗时。50 份就是 50 次调用，还要面对外部服务限流——实际项目里通常要加一层分批。", tone: "bad" as const }]
          : [{ text: "三份和七份用的是同一张图。数量变了，图不用改——这就是 Send 相对写死分支的价值。" }],
    verdict: {
      text: guarded && empty ? "对了。零扇出单独走一条路，不再静默跳过下游。" : "把文件数调到 0，看不加保护时会发生什么。",
      passed: guarded && empty,
    },
  };
}

export function LessonTwentyTwoArticle() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 22 · Map-reduce</p>
        <h1>数量不固定的任务<br />怎么扇出。</h1>
        <p className="chapter-dek">第 21 课的并行有个前提：分支数量写死在图里。但用户传了几份文件，要到运行时才知道。</p>
        <div className="chapter-meta"><span>预计 8 分钟</span><span>无需 API</span><span>承接第 21 课</span></div>
      </header>

      <Prose label="只看一句话的话">
        <h2>Send 让扇出的分支数量在运行时才决定。</h2>
        <CodeBlock>{`def fan_out(state: Overall):
    return [Send("review_one", {"document": doc}) for doc in state["documents"]]

graph.add_conditional_edges(START, fan_out, ["review_one"])`}</CodeBlock>
        <p><code>Send</code> 的第二个参数是<strong>那一份任务自己的输入</strong>，不是整个 State。map 节点只看得到自己那一份——它不知道也不需要知道别人在做什么，这正是 map 的定义。</p>
        <p className="term-hint">带虚线的词都可以悬停、聚焦或点击查看解释。</p>
      </Prose>

      <Prose className="lab-intro" label="自己调数量">
        <h2>0 份、3 份、50 份。</h2>
        <p>三份和五十份用的是同一张图。真正需要单独处理的是 0 份——它的失败方式最难查。</p>
      </Prose>

      <ScenarioLab
        kicker="INTERACTIVE 22"
        title="处理三种数量"
        storageKey="agent-lab-lesson-22"
        controls={[
          { kind: "segmented", id: "count", label: "输入文件数", options: [{ id: "0", label: "0 份" }, { id: "3", label: "3 份" }, { id: "7", label: "7 份" }, { id: "50", label: "50 份" }], initial: "3" },
          { kind: "switch", id: "guard", label: "空集合单独走一条路", note: "条件函数返回节点名而不是 Send 列表", initial: false },
        ]}
        compute={compute}
        rowsLabel="这次运行的结果"
        note="零扇出的行为是写这个实验时实跑发现的——原本以为是 reduce 里 max() 对空列表报错，实跑证明是整条下游被跳过。这也是课程坚持每个结论都跑一遍的原因。"
        code={{
          summary: "展开空集合的修法",
          text: `def route_or_empty(state: Overall):
    if not state["documents"]:
        return "nothing_to_do"
    return [Send("review_one", {"document": doc}) for doc in state["documents"]]`,
        }}
      />

      <Prose className="after-lab" label="三件必须想清楚的事">
        <h2>汇总要有 reducer，零要单独处理，map 之间不能有依赖。</h2>
        <p>汇总字段被多个 map 同时写，没有 reducer 就是第 13 课那个 <code>InvalidUpdateError</code>。</p>
        <p>扇出为 0 时下游整条被跳过；扇出很大时要想成本、并发和失败——默认一个 map 失败就整次失败，和第 21 课一样。</p>
        <Callout tone="warn" title="map 任务之间不能互相依赖">
          如果第二份文件的处理需要第一份的结果，那它就不是 map，是一条链。
          强行用 <code>Send</code> 扇出会得到不确定的结果——它们是并发执行的，没有先后。
        </Callout>
      </Prose>

      <RunLocally file="lab/langgraph/examples/22_map_reduce.py" command="uv run python examples/22_map_reduce.py">
        <strong>不需要 API Key</strong>。
      </RunLocally>

      <Prose label="本课挑战：这个 map 节点为什么读不到 State">
        <h2>Send 传过去的只有你给的那个字典。</h2>
        <CodeBlock>{`def review_one(state: Overall) -> dict:       # 类型标成了 Overall
    total = len(state["documents"])           # 想知道一共有几份`}</CodeBlock>
        <p>map 任务拿到的是 <code>Send</code> 里那个字典，里面没有 <code>documents</code>。需要总数就一起传：<code>{`Send("review_one", {"document": doc, "total": len(...)})`}</code>。</p>
      </Prose>

      <Prose label="三个常见误区">
        <h2>零份和三份区别很大。</h2>
        <Misconceptions
          items={[
            { claim: "零份和三份没什么区别，都能跑", verdict: "零份下游全跳过", body: <p>结果字段停在初始值，而且没有报错。必须单独处理。</p> },
            { claim: "map 节点能看到整个 State", verdict: "只看得到 Send 里的", body: <p>这是刻意的设计：map 任务应该是自足的。</p> },
            { claim: "扇出数量大一点无所谓，反正是并行的", verdict: "并行不改变总成本", body: <p>它只改变总耗时。一千份就是一千次调用，还要面对限流。</p> },
          ]}
        />
      </Prose>

      <Prose className="after-lab" label="本课带走">
        <h2>三句话。</h2>
        <Takeaways title="第二十二课带走" items={["Send 让分支数量在运行时决定", "零扇出时下游整条被静默跳过", "map 任务只看得到 Send 里传的东西"]} />
      </Prose>

      <section className="chapter-bridge">
        <span>NEXT</span><i />
        <span>图越来越大了。同一段流程已经复制过两次，是时候把它封装起来。</span>
      </section>
    </article>
  );
}
