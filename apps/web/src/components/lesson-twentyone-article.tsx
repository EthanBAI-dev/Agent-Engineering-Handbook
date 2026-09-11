"use client";

import { ScenarioLab, type ScenarioState } from "@/components/lab-kit";
import { Prose } from "@/components/auto-term";
import { Callout, CodeBlock, Misconceptions, RunLocally, Takeaways } from "@/components/article-kit";

function compute(s: ScenarioState) {
  const parallel = String(s.mode) === "parallel";
  const failing = Boolean(s.failing);
  const tolerant = Boolean(s.tolerant);
  const time = parallel ? "0.31 秒" : "0.91 秒";
  const crashed = failing && !tolerant;
  const found = crashed ? 0 : failing ? 2 : 3;
  return {
    rows: [
      { label: "总耗时", value: time, tone: (parallel ? "good" : "muted") as "good" | "muted" },
      { label: "收集到", value: crashed ? "整次运行失败" : `${found} 条`, tone: (crashed ? "bad" : "normal") as "bad" | "normal" },
      { label: "结果顺序", value: parallel ? "db → search → web（和加节点顺序相反）" : "按连线顺序", tone: (parallel ? "bad" : "muted") as "bad" | "muted" },
    ],
    lines: crashed
      ? [{ text: "默认行为很干脆：一个分支抛异常，整次运行就失败了。三个来源里挂了一个，另外两个查到的东西也拿不到。", tone: "bad" as const }]
      : failing
        ? [{ text: "分支内部自己 try 住，把失败也写成一条结果。跑完了，但要让后面的节点知道有一条是失败的——别当成正常资料用。", tone: "good" as const }]
        : parallel
          ? [{ text: "三个 0.3 秒的查询同时开始，总耗时约等于一个。注意顺序：db 在前、search 在后，和加节点的顺序相反——不要依赖它。", tone: "good" as const }]
          : [{ text: "三份等待叠加。它们互不依赖，本来可以一起跑。" }],
    verdict: {
      text: parallel && failing && tolerant
        ? "对了。并行提速，同时一个分支失败也不会拖垮整次运行。"
        : "目标：并行执行，并且让一个分支失败时其余结果仍然可用。",
      passed: parallel && failing && tolerant,
    },
  };
}

export function LessonTwentyOneArticle() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 21 · 并行分支</p>
        <h1>互不依赖的步骤，<br />没有理由排队。</h1>
        <p className="chapter-dek">三个来源串行做是三份等待叠加，并行做是一份。改起来只有两行差别。</p>
        <div className="chapter-meta"><span>预计 8 分钟</span><span>无需 API</span><span>单元五开始</span></div>
      </header>

      <Prose label="只看一句话的话">
        <h2>接法只有两行差别，难的是结果怎么合并、一个分支失败了怎么办。</h2>
        <CodeBlock>{`# 串行：一个接一个
graph.add_edge(START, "网页搜索")
graph.add_edge("网页搜索", "内部文档")

# 并行：都从 START 出发，都汇到 summarize
for name in SOURCES:
    graph.add_edge(START, name)
    graph.add_edge(name, "summarize")`}</CodeBlock>
        <p>扇入节点会等<strong>所有</strong>分支都完成才执行——这是 LangGraph 帮你做的，不用自己写等待逻辑。</p>
        <p className="term-hint">带虚线的词都可以悬停、聚焦或点击查看解释。</p>
      </Prose>

      <Prose className="lab-intro" label="自己切一次">
        <h2>三个来源各花 0.3 秒。</h2>
        <p>先看串行和并行的耗时差别，再让其中一个分支失败，看默认行为有多干脆。</p>
      </Prose>

      <ScenarioLab
        kicker="INTERACTIVE 21"
        title="并行、失败与尽力而为"
        storageKey="agent-lab-lesson-21"
        controls={[
          { kind: "segmented", id: "mode", label: "执行方式", options: [{ id: "serial", label: "串行" }, { id: "parallel", label: "并行" }], initial: "serial" },
          { kind: "switch", id: "failing", label: "内部文档服务挂了", initial: false },
          { kind: "switch", id: "tolerant", label: "分支内部自己兜住失败", note: "try/except，把失败也写成一条结果", initial: false },
        ]}
        compute={compute}
        rowsLabel="这次运行的结果"
        note="0.91 秒对 0.31 秒是本机实测。并行结果的顺序也来自实跑——它和添加节点的顺序相反，而且不保证在别的版本上一致。"
        code={{
          summary: "展开尽力而为的写法",
          text: `def source(state):
    try:
        ...
        return {"findings": [f"{name}：查到了"]}
    except ConnectionError as error:
        return {"findings": [f"{name}：查询失败（{error}）"]}

# 跑完了，但要让后面的节点能识别哪条是失败的——
# 失败的结果要带上可识别的标记，否则 summarize 会把它当成正常资料。`,
        }}
      />

      <Prose className="after-lab" label="两条必须记住的">
        <h2>汇总字段必须有 reducer；顺序不要依赖。</h2>
        <p>三个分支同时写 <code>findings</code>，所以它必须带合并规则——不加就是第 13 课那个 <code>InvalidUpdateError</code>。这不是意外，是并行场景下 reducer 从「可选」变成「必须」的那一刻。</p>
        <p>要知道每条结果来自哪里，就把来源写进数据本身：<code>{`f"{name} 找到了…"`}</code>。<strong>靠位置推断来源，是并行代码里最常见的隐藏 bug。</strong></p>
        <Callout tone="warn" title="什么时候不该并行">
          步骤之间有依赖；共同写一个覆盖型字段；外部服务有速率限制（三个请求同时打过去可能一起被限流，反而更慢）；
          只有两步且每步很快（调度开销可能比省下的时间还多）。
        </Callout>
      </Prose>

      <RunLocally file="lab/langgraph/examples/21_parallel.py" command="uv run python examples/21_parallel.py">
        <strong>不需要 API Key</strong>。耗时数字来自本机实测，你的机器上会略有不同，但串行约等于并行三倍这个关系不会变。建议改 <code>DELAY</code> 再跑，观察差距怎样随单步耗时放大。
      </RunLocally>

      <Prose label="本课挑战：这段并行为什么没有变快">
        <h2>扇出接了，但分支之间又连了串行的边。</h2>
        <CodeBlock>{`for name in SOURCES:
    graph.add_edge(START, name)

graph.add_edge("网页搜索", "内部文档")     # 多加的一条
graph.add_edge("内部文档", "数据库")       # 多加的一条`}</CodeBlock>
        <p><code>内部文档</code> 现在有两个前置，它必须等网页搜索跑完。扇出被这几条边抵消了。<strong>并行不是「从 START 连出去」就成立的，还要保证分支之间没有边。</strong></p>
      </Prose>

      <Prose label="三个常见误区">
        <h2>并行不一定更快。</h2>
        <Misconceptions
          items={[
            { claim: "并行一定更快", verdict: "看情况", body: <p>调度有开销，外部服务有限流。步骤很快或者对方限流时，并行可能更慢。先测再定。</p> },
            { claim: "结果顺序和加节点的顺序一样", verdict: "实测不一样", body: <p>把来源写进数据，不要靠位置。</p> },
            { claim: "一个分支失败没关系，其他的还在", verdict: "默认整体失败", body: <p>要「尽力而为」必须自己在分支里兜住，并且让下游能识别哪条失败了。</p> },
          ]}
        />
      </Prose>

      <Prose className="after-lab" label="本课带走">
        <h2>三句话。</h2>
        <Takeaways title="第二十一课带走" items={["扇入会自动等所有分支完成", "汇总字段必须有 reducer，来源写进数据里", "默认一个分支失败就整体失败"]} />
      </Prose>

      <section className="chapter-bridge">
        <span>NEXT</span><i />
        <span>这一课的分支数量是写死的。但很多任务的数量要到运行时才知道。</span>
      </section>
    </article>
  );
}
