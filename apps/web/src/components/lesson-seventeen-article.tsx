"use client";

import { ScenarioLab, type ScenarioState } from "@/components/lab-kit";
import { Prose } from "@/components/auto-term";
import { Callout, CodeBlock, Misconceptions, RunLocally, Takeaways } from "@/components/article-kit";

function compute(s: ScenarioState) {
  const act = String(s.action);
  if (act === "reject") {
    return {
      rows: [
        { label: "target", value: "/", tone: "muted" as const },
        { label: "days", value: "7", tone: "muted" as const },
        { label: "plan", value: "清理 / 下超过 7 天的文件", tone: "muted" as const },
        { label: "结果", value: "已取消", tone: "bad" as const },
      ],
      lines: [{ text: "Agent 什么也没学到，下次可能提出同样的方案。人明明已经知道正确答案了，却没有地方把它填进去。", tone: "bad" as const }],
      verdict: { text: "拒绝之后什么都没发生。试试另外两种反应。", passed: false },
    };
  }
  if (act === "edit") {
    return {
      rows: [
        { label: "target", value: "/tmp", tone: "good" as const },
        { label: "days", value: "30", tone: "good" as const },
        { label: "plan", value: "清理 / 下超过 7 天的文件　← 还是旧的", tone: "bad" as const },
        { label: "结果", value: "已执行：清理 / 下超过 7 天的文件", tone: "bad" as const },
      ],
      lines: [{ text: "参数改对了，执行的却还是旧提案。plan 是 propose 上一次算出来的——改一个字段不会自动重算依赖它的字段。这不是 bug，是 State 的本来行为。", tone: "bad" as const }],
      verdict: { text: "看出问题了吗？plan 没跟着变。要重算就得退回那一步之前。", passed: false },
    };
  }
  return {
    rows: [
      { label: "target", value: "/tmp", tone: "good" as const },
      { label: "days", value: "30", tone: "good" as const },
      { label: "plan", value: "清理 /tmp 下超过 30 天的文件", tone: "good" as const },
      { label: "结果", value: "已执行：清理 /tmp 下超过 30 天的文件", tone: "good" as const },
      { label: "代价", value: "多跑一次 propose 节点", tone: "muted" as const },
    ],
    lines: [{ text: "退回 propose 之前再改参数，节点用新参数重新跑了一遍，提案和参数对上了。如果那个节点会调用模型，这就是多一次模型调用。", tone: "good" as const }],
    verdict: { text: "对了。改动会影响后续推理时，就退回那一步之前。", passed: true },
  };
}

export function LessonSeventeenArticle() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 17 · 编辑 State</p>
        <h1>审批不该只有<br />同意和拒绝两个按钮。</h1>
        <p className="chapter-dek">人看到提案后最常见的反应是「方向对，参数不对」。只给两个按钮，人就只能拒绝。</p>
        <div className="chapter-meta"><span>预计 8 分钟</span><span>无需 API</span><span>承接第 16 课</span></div>
      </header>

      <Prose label="只看一句话的话">
        <h2>让人直接改 State，再从原地继续。</h2>
        <p>Agent 提出：清理 <code>/</code> 下超过 7 天的文件。范围太大了——但问题不在方向，清理旧文件是对的，只是不该从根目录开始。</p>
        <p className="term-hint">带虚线的词都可以悬停、聚焦或点击查看解释。</p>
      </Prose>

      <Prose className="lab-intro" label="三种反应">
        <h2>其中一种会给你一个意外。</h2>
        <p>依次试过去，特别注意「改参数后继续」那一档里 <code>plan</code> 字段发生了什么。</p>
      </Prose>

      <ScenarioLab
        kicker="INTERACTIVE 17"
        title="面对同一个提案，三种反应"
        storageKey="agent-lab-lesson-17"
        controls={[{
          kind: "segmented", id: "action", label: "你的反应",
          options: [{ id: "reject", label: "拒绝" }, { id: "edit", label: "改参数后继续" }, { id: "rewind", label: "退回重新生成" }],
          initial: "reject",
        }]}
        compute={compute}
        rowsLabel="三个字段与结果"
        note="两种改法都依赖 checkpointer。没有它，「原地」和「更早的一步」都不存在——第 04 课那句话在这一课变成了两条能力的地基。"
        code={{
          summary: "展开两种改法",
          text: `# 改法一：直接改当前 State
app.update_state(cfg, {"target": "/tmp", "days": 30}, as_node="propose")

# 改法二：退回到 propose 之前，让它用新参数重算
history = list(app.get_state_history(cfg))
before_propose = [h for h in history if h.next == ("propose",)][0]
forked = app.update_state(before_propose.config, {"target": "/tmp", "days": 30})
app.invoke(None, forked)

# 注意：从旧快照分叉跑过之后，恢复要用线程级 config——
# 这条是写实验时踩出来的，用了旧的 forked config 会什么都不执行。`,
        }}
      />

      <Prose className="after-lab" label="两种改法怎么选">
        <h2>问一句：这个字段，后面还有别的东西是根据它算出来的吗？</h2>
        <CodeBlock>{`人已经想清楚最终参数    改当前 State      省一次模型调用，最快
改动会影响后续推理      退回重新生成      让 Agent 基于新参数重新想一遍
只是修个错别字          改当前 State      没有下游依赖
改的是任务目标          退回重新生成      目标变了，整个计划都要重来`}</CodeBlock>
        <Callout tone="warn" title="技术上能改，不等于人改得了">
          审批界面至少要给出提案的<strong>具体参数</strong>（「清理旧文件」看不出范围是 <code>/</code> 还是 <code>/tmp</code>）、
          可以直接编辑的输入框，以及说明哪些字段改了之后会重新推理。
          人改完 <code>days</code> 却发现执行的还是旧计划，会认为这个系统在骗他。
        </Callout>
      </Prose>

      <RunLocally file="lab/langgraph/examples/17_edit_state.py" command="uv run python examples/17_edit_state.py">
        <strong>不需要 API Key</strong>。建议自己加一个字段试试：让 <code>propose</code> 同时算出一个 <code>risk_level</code>，然后只改 <code>days</code>，观察它会不会跟着变。
      </RunLocally>

      <Prose label="本课挑战：这样改为什么不安全">
        <h2>它把外部输入原样写进了 State。</h2>
        <CodeBlock>{`app.update_state(cfg, request.json["state"])`}</CodeBlock>
        <p>审批界面是网页，<code>request.json</code> 是用户可以任意构造的。这段代码允许审批者改<strong>任何</strong>字段——包括第 16 课的风险级别、第 19 课的幂等键，甚至是本该由服务端决定的用户身份。</p>
        <p>正确做法是只允许改一份白名单里的字段。这和第 11 课的路由白名单是同一条原则：<strong>外部来的值进入系统之前，先过一道你自己的清单。</strong></p>
      </Prose>

      <Prose label="三个常见误区">
        <h2>State 是一组字段，不是一张依赖图。</h2>
        <Misconceptions
          items={[
            { claim: "改了 State，相关字段会自动更新", verdict: "不会", body: <p>要重算就得让对应节点重新跑。字段之间的推导关系藏在节点代码里，不在 State 里。</p> },
            { claim: "update_state 可以随便改，反正有人把关", verdict: "界面管不住接口", body: <p>审批的人只看得到界面上显示的内容。接口层面能改什么，必须由服务端白名单决定。</p> },
            { claim: "退回重新生成更准，那就一律用它", verdict: "要多花一次", body: <p>如果那个节点调用模型，成本和延迟都会上去。只改错别字的时候没必要重来。</p> },
          ]}
        />
      </Prose>

      <Prose className="after-lab" label="本课带走">
        <h2>三句话。</h2>
        <Takeaways title="第十七课带走" items={["审批要有第三个选项：改一下再继续", "改字段不会重算依赖它的字段", "允许改哪些字段由服务端白名单决定"]} />
      </Prose>

      <section className="chapter-bridge">
        <span>NEXT</span><i />
        <span>「退回到更早的一步」这个能力值得单独讲一课——它是调试 Agent 最有力的工具。</span>
      </section>
    </article>
  );
}
