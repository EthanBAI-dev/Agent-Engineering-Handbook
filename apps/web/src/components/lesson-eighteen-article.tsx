"use client";

import { ScenarioLab, type ScenarioState } from "@/components/lab-kit";
import { Prose } from "@/components/auto-term";
import { Callout, CodeBlock, Misconceptions, RunLocally, Takeaways } from "@/components/article-kit";

const SNAPSHOTS = [
  { id: "start", label: "__start__ 之前" },
  { id: "pick", label: "pick 之前" },
  { id: "confirm", label: "confirm 之前" },
  { id: "done", label: "已结束" },
];

function compute(s: ScenarioState) {
  const at = String(s.snapshot);
  const budget = Number(s.budget);
  const changed = budget !== 3000;
  // 只有在 pick 之前改预算，picked 才会重算
  const recomputes = at === "pick" || at === "start";
  const picked = recomputes ? (budget >= 5000 ? "豪华版" : "基础版") : "基础版";
  const canRun = at !== "done";
  return {
    rows: [
      { label: "选中快照的 next", value: at === "done" ? "()　← 图已结束" : `(${at === "start" ? "pick" : at},)`, tone: (canRun ? "normal" : "bad") as "normal" | "bad" },
      { label: "改后的 budget", value: String(budget), tone: (changed ? "good" : "muted") as "good" | "muted" },
      { label: "picked", value: canRun ? picked : "基础版（不会重算）", tone: (recomputes && changed ? "good" : "muted") as "good" | "muted" },
      { label: "最终 note", value: canRun ? `预算 ${recomputes ? budget : 3000} 元，最终选择 ${picked}` : "跑不动，没有下一步", tone: (canRun ? "normal" : "bad") as "normal" | "bad" },
    ],
    lines: !canRun
      ? [{ text: "这个快照的 next 是空的，图已经结束，没有节点会再读这个新预算。分叉必须回到分岔点之前。", tone: "bad" as const }]
      : recomputes
        ? changed
          ? [{ text: "回到 pick 之前改预算，pick 用新值重新判断，整条路径都变了。原来那次运行仍然完好——分叉之后这个 thread 有两条分支。", tone: "good" as const }]
          : [{ text: "输入没变，结果当然一样。这就是「重放」：用来验证一段流程是不是确定性的。" }]
        : [{ text: "在 confirm 之前改 budget 没有用——pick 已经跑完，picked 不会重算。这正是第 17 课那条规则。", tone: "bad" as const }],
    verdict: {
      text: recomputes && changed && budget >= 5000
        ? "对了。只改一个字段，回到分岔点之前，就得到了另一条完整路径。"
        : "目标：只改 budget 一个字段，让最终结果变成「豪华版」。",
      passed: recomputes && changed && budget >= 5000,
    },
  };
}

export function LessonEighteenArticle() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 18 · Time Travel</p>
        <h1>回到旧状态，<br />再走一遍另一条路。</h1>
        <p className="chapter-dek">checkpointer 存下的不是最后一个状态，是每一步的状态——所以每一步都能回去。</p>
        <div className="chapter-meta"><span>预计 8 分钟</span><span>无需 API</span><span>承接第 17 课</span></div>
      </header>

      <Prose label="只看一句话的话">
        <h2>快照带着「下一步跑哪个节点」，所以它是位置，不只是数据。</h2>
        <p>第 03 课把 checkpoint 当成「会话记忆」，那只用到了它一半的能力。</p>
        <p className="term-hint">带虚线的词都可以悬停、聚焦或点击查看解释。</p>
      </Prose>

      <Prose label="每一步都存着">
        <h2>一次两个节点的运行，实跑得到四个快照。</h2>
        <CodeBlock>{`下一步=('<已结束>',)   values={'budget': 3000, 'picked': '基础版', 'note': '...'}
下一步=('confirm',)   values={'budget': 3000, 'picked': '基础版', 'note': ''}
下一步=('pick',)      values={'budget': 3000, 'picked': '',       'note': ''}
下一步=('__start__',) values={}`}</CodeBlock>
        <p><code>get_state_history</code> 从新到旧返回。每个快照带两样东西：当时的 <code>values</code>，以及<strong>下一步该跑哪个节点</strong>。第二样才是关键——它意味着这个快照不只是一份数据备份，而是一个可以继续执行的位置。</p>
      </Prose>

      <Prose className="lab-intro" label="自己分叉一次">
        <h2>选一个快照，改一个值，看结果变不变。</h2>
        <p>目标是只改 <code>budget</code> 一个字段，让最终结果变成「豪华版」。选错快照就改不动——这正是本课要练的判断。</p>
      </Prose>

      <ScenarioLab
        kicker="INTERACTIVE 18"
        title="找出分岔点"
        storageKey="agent-lab-lesson-18"
        controls={[
          { kind: "segmented", id: "snapshot", label: "回到哪个快照", options: SNAPSHOTS, initial: "confirm" },
          { kind: "slider", id: "budget", label: "把 budget 改成", min: 1000, max: 9000, step: 1000, initial: 3000, format: (v) => `${v} 元` },
        ]}
        compute={compute}
        rowsLabel="这次分叉的结果"
        note="数字来自 18_time_travel.py 的实跑：原运行 4 个快照，分叉之后这个 thread 共 9 个，两条分支都在——分叉不会覆盖原路径。"
        code={{
          summary: "展开重放与分叉的写法",
          text: `history = list(app.get_state_history(cfg))

# 重放：不给新输入，从这个快照往下跑
before_confirm = [h for h in history if h.next == ("confirm",)][0]
app.invoke(None, before_confirm.config)

# 分叉：改一个值再跑
before_pick = [h for h in history if h.next == ("pick",)][0]
forked = app.update_state(before_pick.config, {"budget": 8000})
app.invoke(None, forked)`,
        }}
      />

      <Prose className="after-lab" label="用它来做什么">
        <h2>调试、对比、回滚。</h2>
        <p><strong>调试。</strong>Agent 在第 7 步选错了工具。传统做法是把整段对话重来一遍，祈祷它再错一次。有了时间旅行，第 6 步的状态就摆在那里，改条件直接重跑那一步。</p>
        <p><strong>对比。</strong>同一个起点分出两条路，看看换个提示词、换个模型、换个参数，结果差多少。第 27 课的评测会大量用到。</p>
        <p><strong>回滚。</strong>发现方向错了，退回更早的一步重新提案——第 17 课用的就是它。</p>
        <p>重放还有一个不显眼的用途：<strong>验证确定性</strong>。如果重放两次结果不同，说明这一步依赖了不在 State 里的东西——当前时间、随机数、外部服务的实时数据，或者一个 <code>temperature</code> 不为 0 的模型。这类隐藏依赖是 Agent 最难查的一类 bug。</p>
        <Callout tone="warn" title="一个陷阱：reducer 不能原地修改旧值">
          <code>old.extend(new)</code> 会让 checkpoint 里保存的历史状态跟着变。
          等你想回到第 3 步时，会发现「第 3 步的状态」已经被第 7 步改掉了——时间旅行的地基被后来的运行悄悄挖空了。
          正确写法是 <code>return old + new</code>。
        </Callout>
      </Prose>

      <RunLocally file="lab/langgraph/examples/18_time_travel.py" command="uv run python examples/18_time_travel.py">
        <strong>不需要 API Key</strong>。建议试试从「已结束」的那个快照往下跑，看看会发生什么——它的 <code>next</code> 是空的，没有下一步可执行。
      </RunLocally>

      <Prose label="三个常见误区">
        <h2>分叉不会覆盖原路径。</h2>
        <Misconceptions
          items={[
            { claim: "时间旅行会覆盖原来的运行", verdict: "不会", body: <p>分叉创建的是新分支，旧快照仍然在。实跑里分叉之后快照从 4 个变成 9 个，两条路都保留着。</p> },
            { claim: "重放结果不同，说明 LangGraph 不可靠", verdict: "说反了", body: <p>正相反，说明你的图里有不在 State 里的隐藏依赖。重放是发现这个问题的工具，不是问题本身。</p> },
            { claim: "有了时间旅行就不用写日志了", verdict: "记的不是「为什么」", body: <p>快照记录的是 State。模型当时为什么选那个工具、外部服务返回了什么原始内容，仍然要靠第 27 课的手段记录。</p> },
          ]}
        />
      </Prose>

      <Prose className="after-lab" label="本课带走">
        <h2>三句话。</h2>
        <Takeaways title="第十八课带走" items={["快照带着 next，所以它是位置不只是数据", "重放验证确定性，分叉改一个变量", "分叉要回到分岔点之前"]} />
      </Prose>

      <section className="chapter-bridge">
        <span>NEXT</span><i />
        <span>回到过去可以重来。但有些步骤重来一次，外面的世界是看得见的。</span>
      </section>
    </article>
  );
}
