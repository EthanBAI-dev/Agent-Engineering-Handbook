"use client";

import { ScenarioLab, type ScenarioState } from "@/components/lab-kit";
import { Prose } from "@/components/auto-term";
import { AsciiFigure, Callout, Misconceptions, RunLocally, Takeaways } from "@/components/article-kit";

const MODES = [
  { id: "updates", label: "updates" },
  { id: "values", label: "values" },
  { id: "messages", label: "messages" },
];

function compute(s: ScenarioState) {
  const mode = String(s.mode);
  const filtered = Boolean(s.filtered);
  if (mode === "updates") {
    return {
      rows: [
        { label: "事件条数", value: "3 条", tone: "normal" as const },
        { label: "用户看到", value: "三条进度提示", tone: "good" as const },
        { label: "有没有正文", value: "没有", tone: "muted" as const },
      ],
      lines: [
        { text: "[model] AIMessage → get_weather" },
        { text: "[tools] ToolMessage → '北京：晴，24 度'" },
        { text: "[model] AIMessage → '北京今天晴，24 度。'" },
        { text: "一个节点一条，正好对应界面上「正在查天气…」这类提示。", tone: "good" as const },
      ],
      verdict: { text: "updates 适合给用户看进度。再看看 messages 那一档。", passed: false },
    };
  }
  if (mode === "values") {
    return {
      rows: [
        { label: "事件条数", value: "4 次", tone: "normal" as const },
        { label: "用户看到", value: "整份 State", tone: "bad" as const },
        { label: "适合给谁", value: "只给你自己", tone: "muted" as const },
      ],
      lines: [
        { text: "第 0 次：messages 共 1 条　← 图还没跑，先给了输入状态" },
        { text: "第 1 次：messages 共 2 条" },
        { text: "第 2 次：messages 共 3 条" },
        { text: "第 3 次：messages 共 4 条" },
        { text: "系统提示、工具原始返回、内部字段都在 State 里。这是调试工具，不是响应格式。", tone: "bad" as const },
      ],
      verdict: { text: "values 直接给用户会把整份 State 抖出去。", passed: false },
    };
  }
  return filtered
    ? {
        rows: [
          { label: "文本块", value: "11 个（已过滤）", tone: "normal" as const },
          { label: "拼出来是", value: "北京今天晴，24 度。", tone: "good" as const },
          { label: "过滤依据", value: "langgraph_node === 'model'", tone: "good" as const },
        ],
        lines: [{ text: "干净了。过滤依据是节点名，不是「看起来像不像答案」。", tone: "good" as const }],
        verdict: { text: "对了。messages 流必须按节点过滤，否则工具结果会混进答案。", passed: true },
      }
    : {
        rows: [
          { label: "文本块", value: "12 个", tone: "normal" as const },
          { label: "拼出来是", value: "北京：晴，24 度北京今天晴，24 度。", tone: "bad" as const },
          { label: "多出来的是", value: "ToolMessage 的内容", tone: "bad" as const },
        ],
        lines: [{ text: "工具返回的「北京：晴，24 度」也被当成文本块吐出来了。它是给模型看的中间结果，不是给用户看的正文。", tone: "bad" as const }],
        verdict: { text: "打开过滤开关，只保留来自 model 节点的块。", passed: false },
      };
}

export function LessonNineArticle() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 09 · 流式事件</p>
        <h1>让用户看见<br />Agent 正在做什么。</h1>
        <p className="chapter-dek">一个会调用工具的 Agent 跑十几秒很正常。这十几秒里页面什么都没有，用户会以为它死了。</p>
        <div className="chapter-meta"><span>预计 9 分钟</span><span>无需 API</span><span>承接第 08 课</span></div>
      </header>

      <Prose label="只看一句话的话">
        <h2>选错粒度，页面要么一片空白，要么把内部状态抖给用户。</h2>
        <p><code>stream</code> 提供几种粒度不同的事件。三种各有各的用途，而其中一种带着一个很容易踩的坑。</p>
        <p className="term-hint">带虚线的词都可以悬停、聚焦或点击查看解释。</p>
      </Prose>

      <Prose className="lab-intro" label="同一次运行，三种看法">
        <h2>问题固定是「北京天气怎么样？」。</h2>
        <p>下面每一档的数字都来自实跑。切到 <code>messages</code> 时注意看拼出来的那句话——它多了一段不该给用户的东西。</p>
      </Prose>

      <ScenarioLab
        kicker="INTERACTIVE 09"
        title="给同一次运行换粒度"
        storageKey="agent-lab-lesson-9"
        controls={[
          { kind: "segmented", id: "mode", label: "stream_mode", options: MODES, initial: "updates" },
          { kind: "switch", id: "filtered", label: "按节点过滤", note: "只保留 model 节点的块", initial: false },
        ]}
        compute={compute}
        rowsLabel="这一档给出什么"
        note="事件条数与顺序都来自 09_streaming.py 的实跑。脚本化模型逐字吐字，所以块数是确定的；换成真实模型，块的切分方式由服务商决定，但事件的种类和顺序不变。"
        code={{
          summary: "展开按节点过滤的写法",
          text: `for token, meta in app.stream(payload, stream_mode="messages"):
    # meta 里带着这个块来自哪个节点
    if token.content and meta.get("langgraph_node") == "model":
        buffer += token.content`,
        }}
      />

      <Prose className="after-lab" label="该给用户看哪一种">
        <h2>三种粒度，三种用途。</h2>
        <AsciiFigure>{`updates   给用户   「正在查天气…」进度提示，一个节点一条
values    给自己   调试面板；直接给用户会把整份 State 抖出去
messages  给用户   打字机效果，必须按节点过滤`}</AsciiFigure>
        <p>真实界面通常是组合：<code>updates</code> 驱动上方的状态条，过滤后的 <code>messages</code> 驱动下方逐字出现的回答。</p>
        <Callout tone="warn" title="进度里 model 会出现两次">
          第一次它没写正文，只提出了工具调用——这正是第 02 课的结论。界面上不该把这一次显示成「正在回答」。
        </Callout>
      </Prose>

      <Prose label="流式不改变超时">
        <h2>它改变的是等待感，不是耗时。</h2>
        <p>流式让第一个字更早出现，用户的等待感大幅下降。但整个任务该花多久还是多久：模型该调几次调几次，工具该跑多久跑多久。</p>
        <p>第 08 课提到的平台超时限制，流式<strong>不能</strong>绕开。真正需要跑很久的任务，得改成「先返回任务 id，再轮询」。</p>
      </Prose>

      <RunLocally file="lab/langgraph/examples/09_streaming.py" command="uv run python examples/09_streaming.py">
        使用脚本化模型，<strong>不需要 API Key</strong>。本课所有事件条数和顺序都来自这次实跑。
      </RunLocally>

      <Prose label="三个常见误区">
        <h2>最贵的一个是「全拼起来就是答案」。</h2>
        <Misconceptions
          items={[
            { claim: "用了流式就不会超时", verdict: "不成立", body: <p>流式改变的是用户的等待感，不是任务耗时。平台的单次请求上限照样存在。</p> },
            { claim: "把流里的文本全拼起来就是答案", verdict: "会混进工具结果", body: <p>实跑已经证明。必须按节点过滤，而且判断依据是节点名，不是「看起来像不像答案」。</p> },
            { claim: "values 模式最全，就用它", verdict: "最全也最容易泄漏", body: <p>系统提示、工具原始输出、内部字段都在 State 里。它是调试工具，不是响应格式——第 08 课的挑战题就是这个错误的完整版。</p> },
          ]}
        />
      </Prose>

      <Prose className="after-lab" label="本课带走">
        <h2>三句话。</h2>
        <Takeaways title="第九课带走" items={["updates 给进度，messages 给正文", "messages 流里有 ToolMessage，必须按节点过滤", "流式改善体验，绕不开平台超时"]} />
      </Prose>

      <section className="chapter-bridge">
        <span>NEXT</span><i />
        <span>用户能看见它在做事了。下一个问题是：它会做多久？</span>
      </section>
    </article>
  );
}
