"use client";

import { ScenarioLab, type ScenarioState } from "@/components/lab-kit";
import { Prose } from "@/components/auto-term";
import { Callout, CodeBlock, Misconceptions, RunLocally, Takeaways } from "@/components/article-kit";

/** 13 条历史，第 3 条藏着关键事实「改过收货地址」。预算 6 条。 */
function compute(s: ScenarioState) {
  const trim = Boolean(s.trim);
  const filter = Boolean(s.filter);
  const summarize = Boolean(s.summarize);
  let count = 13;
  const notes: { text: string; tone?: "good" | "bad" | "normal" }[] = [];
  let keptFact = true;
  let extraCall = 0;

  if (filter) { count = 7; notes.push({ text: "过滤：删掉 6 条重复的模板回复。零成本，但只能删规则明确的东西。" }); }
  if (summarize) {
    count = Math.min(count, 6);
    extraCall = 1;
    if (!filter) { keptFact = false; notes.push({ text: "总结：旧消息压成一段摘要。但摘要没抓住第 3 条那个「改过收货地址」——摘要的定义就是丢东西。", tone: "bad" }); }
    else notes.push({ text: "总结：在已经过滤过的历史上压缩，关键事实还在摘要里。", tone: "good" });
  }
  if (trim) {
    const before = count;
    count = Math.min(count, 3);
    if (before > 6 && !summarize) { keptFact = false; notes.push({ text: "裁剪：只留最近 3 条。第 3 条那个关键事实直接消失了，而且模型不知道自己忘了什么。", tone: "bad" }); }
    else notes.push({ text: "裁剪：保住系统消息，从一条完整的用户消息开始。" });
  }
  const withinBudget = count <= 6;
  const passed = withinBudget && keptFact && count < 13;
  return {
    rows: [
      { label: "模型这次看到", value: `${count} 条（预算 6 条）`, tone: (withinBudget ? "good" : "bad") as "good" | "bad" },
      { label: "关键事实还在吗", value: keptFact ? "在" : "丢了", tone: (keptFact ? "good" : "bad") as "good" | "bad" },
      { label: "额外模型调用", value: extraCall ? "1 次（生成摘要）" : "0 次", tone: (extraCall ? "bad" : "muted") as "bad" | "muted" },
    ],
    lines: notes.length ? notes : [{ text: "一条都没开：13 条历史全发给模型，费用和延迟都跟着输入长度走。" }],
    verdict: {
      text: passed ? "在 6 条预算内保住了关键事实。注意你为此多花了一次模型调用——没有不丢信息的方案。" : "目标：6 条以内，且第 3 条那个「改过收货地址」还看得见。",
      passed,
    },
  };
}

export function LessonFourteenArticle() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 14 · 上下文管理</p>
        <h1>消息太长怎么办：<br />裁剪、过滤、总结。</h1>
        <p className="chapter-dek">三种方式都在丢信息，区别只在于「丢哪些」和「丢得有多明显」。</p>
        <div className="chapter-meta"><span>预计 9 分钟</span><span>无需 API</span><span>承接第 13 课</span></div>
      </header>

      <Prose label="只看一句话的话">
        <h2>先认清代价：messages 只增不减。</h2>
        <p><code>messages</code> 用累加型 reducer，这是第 01 课就定下的——不累加，Agent 会只记得最后一句话。代价是一段十几轮的对话，每一轮都在重发前面所有内容。第 10 课数的是调用次数，这一课数的是每次调用的大小。</p>
        <p className="term-hint">带虚线的词都可以悬停、聚焦或点击查看解释。</p>
      </Prose>

      <Prose label="三种方式">
        <h2>裁剪最快，过滤最可控，总结最贵。</h2>
        <CodeBlock caption="裁剪：两个参数值得单独说">{`trimmed = trim_messages(
    HISTORY,
    max_tokens=4,
    token_counter=len,
    strategy="last",
    include_system=True,     # 系统消息定义角色，切掉模型会当场变成另一个人
    start_on="human",        # 保证截断后的历史不是从半截回答开始的
)`}</CodeBlock>
        <p><strong>过滤</strong>按规则删掉明确没用的内容——重复的模板回复、调试信息、超大的工具原始返回。它不花钱，但判断不了「这句话重不重要」。</p>
        <p><strong>总结</strong>把旧历史压成一段话。代价有两条：要多花一次模型调用；摘要本身可能丢掉关键细节，而且丢得很隐蔽。</p>
      </Prose>

      <Prose className="lab-intro" label="自己组合一次">
        <h2>13 条历史，6 条预算，第 3 条藏着关键事实。</h2>
        <p>那条关键事实是「用户改过收货地址」。三个开关随便组合，看能不能在预算内保住它。</p>
      </Prose>

      <ScenarioLab
        kicker="INTERACTIVE 14"
        title="在预算内保住关键信息"
        storageKey="agent-lab-lesson-14"
        controls={[
          { kind: "switch", id: "filter", label: "过滤", note: "按规则删掉重复的模板回复", initial: false },
          { kind: "switch", id: "summarize", label: "总结", note: "旧消息压成一段摘要", initial: false },
          { kind: "switch", id: "trim", label: "裁剪", note: "只保留最近几条", initial: false },
        ]}
        compute={compute}
        rowsLabel="模型这次看到什么"
        note="没有不丢信息的方案，这正是本课要传达的判断。常见组合是三种一起用：系统消息永远保留 + 最近 N 轮原文 + 更早的内容压成摘要 + 工具返回只留摘要。"
        code={{
          summary: "展开裁剪该发生在哪一层",
          text: `# 错误：裁剪写进了 State，被切掉的消息永久消失
def call_model(state):
    state["messages"] = state["messages"][-6:]     # 还原地改了 State
    return {"messages": [model.invoke(state["messages"])]}

# 正确：只在交给模型时裁剪，State 里保留完整历史
def call_model(state):
    visible = trim_messages(state["messages"], ...)
    return {"messages": [model.invoke(visible)]}`,
        }}
      />

      <Prose className="after-lab" label="这不是长期记忆">
        <h2>三件事，三课。</h2>
        <CodeBlock>{`第 03 课  会话记忆      这段对话的历史存在哪里
第 14 课  上下文管理    这一次调用带上其中的哪些
第 30 课  长期记忆      跨会话该记住这个用户的什么`}</CodeBlock>
        <Callout title="裁剪发生在交给模型之前，不是写进 State 之前">
          裁掉的消息仍然在 checkpoint 里躺着，只是这次没发给模型。保留完整历史、每次调用时按需裁剪——
          这样第 18 课的 Time Travel 才有东西可回放。
        </Callout>
      </Prose>

      <RunLocally file="lab/langgraph/examples/14_long_messages.py" command="uv run python examples/14_long_messages.py">
        <strong>不需要 API Key</strong>。脚本里的 <code>summarize</code> 用固定文本而不是真实模型，为的是让结果可复现。接上真实模型后，这一步的质量就成了变量——那时要用第 27 课的方法评估它。
      </RunLocally>

      <Prose label="三个常见误区">
        <h2>「窗口够大就不用管」把问题推后了。</h2>
        <Misconceptions
          items={[
            { claim: "上下文窗口够大就不用管", verdict: "只是推后", body: <p>每次调用的费用和延迟都跟输入长度走，一段长对话的成本会一路涨上去。</p> },
            { claim: "让模型自己判断该记住什么", verdict: "又一次调用", body: <p>它同样会出错，而且出错时你看不出来。先用规则能解决的部分，剩下的再交给模型。</p> },
            { claim: "摘要之后就可以删掉原文了", verdict: "删了回不去", body: <p>摘要放在发给模型的那一侧，原文留在 State 里——两者不冲突。</p> },
          ]}
        />
      </Prose>

      <Prose className="after-lab" label="本课带走">
        <h2>三句话。</h2>
        <Takeaways title="第十四课带走" items={["三种方式都在丢信息", "裁剪要保住系统消息并从完整用户消息开始", "裁剪发生在交给模型之前"]} />
      </Prose>

      <section className="chapter-bridge">
        <span>NEXT</span><i />
        <span>上下文控制住了。还有一个第 03 课留下的坑：InMemorySaver 一换进程就清空。</span>
      </section>
    </article>
  );
}
