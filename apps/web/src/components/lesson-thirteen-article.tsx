"use client";

import { ScenarioLab, type ScenarioState } from "@/components/lab-kit";
import { Prose } from "@/components/auto-term";
import { Callout, CodeBlock, Misconceptions, RunLocally, Takeaways } from "@/components/article-kit";

function compute(s: ScenarioState) {
  const rule = String(s.rule);
  const parallel = String(s.mode) === "parallel";
  if (parallel && rule === "overwrite") {
    return {
      rows: [
        { label: "结果", value: "InvalidUpdateError", tone: "bad" as const },
        { label: "报错内容", value: "Can receive only one value per step", tone: "bad" as const },
        { label: "这是 bug 吗", value: "不是，是保护", tone: "muted" as const },
      ],
      lines: [{ text: "两个节点同时到达，谁是「后来的」？没有答案。LangGraph 不猜——它没有随便挑一个，也没有静默丢掉一个。错误比错误答案便宜。", tone: "bad" as const }],
      verdict: { text: "并行写同一个字段时，必须给它一条合并规则。", passed: false },
    };
  }
  if (parallel && rule === "add") {
    return {
      rows: [
        { label: "结果", value: "['数据库结果', '搜索结果']", tone: "good" as const },
        { label: "两条都在吗", value: "都在", tone: "good" as const },
        { label: "顺序可靠吗", value: "不可靠，别依赖", tone: "bad" as const },
      ],
      lines: [{ text: "注意顺序：db 在前、search 在后，和添加节点的顺序相反。要知道每条来自哪里，就把来源写进数据本身。", tone: "bad" as const }],
      verdict: { text: "对了。加上 reducer 后两条结果都保留。再试试自定义规则。", passed: false },
    };
  }
  if (parallel && rule === "custom") {
    return {
      rows: [
        { label: "结果", value: "{'source': '大模型', 'score': 0.91}", tone: "good" as const },
        { label: "合并依据", value: "保留分数更高的那个", tone: "good" as const },
        { label: "第一个分支到达时", value: "old 是初始值，要处理", tone: "muted" as const },
      ],
      lines: [{ text: "reducer 就是一个普通函数，签名是 (旧值, 新值) → 合并后的值。写它时只需回答一个问题：两个都来了怎么办？", tone: "good" as const }],
      verdict: { text: "对了。三种规则各自适合什么，你已经看全了。", passed: true },
    };
  }
  return {
    rows: [
      { label: "plain（无 reducer）", value: "2　← 后写的覆盖先写的", tone: "normal" as const },
      { label: "summed（operator.add）", value: "3　← 1 + 2 累加", tone: "normal" as const },
      { label: "「后跑」有定义吗", value: "有，顺序执行时是明确的", tone: "muted" as const },
    ],
    lines: [{ text: "顺序执行时「覆盖」是有意义的，因为「后跑」这件事有明确含义。切到并行，看它怎样失去意义。" }],
    verdict: { text: "先看顺序执行的基线，再切到并行。", passed: false },
  };
}

export function LessonThirteenArticle() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 13 · Reducer</p>
        <h1>两个分支同时改一个字段，<br />谁说了算？</h1>
        <p className="chapter-dek">没告诉 LangGraph 怎么合并，它不会随便挑一个——它直接报错。</p>
        <div className="chapter-meta"><span>预计 8 分钟</span><span>无需 API</span><span>承接第 12 课</span></div>
      </header>

      <Prose label="只看一句话的话">
        <h2>「覆盖」这个说法，只在有先后的时候成立。</h2>
        <p>第 01 课已经见过 Reducer：<code>count</code> 被覆盖，<code>log</code> 被累加。这一课要解释那条区别在什么时候会变成一个必须处理的问题。</p>
        <p className="term-hint">带虚线的词都可以悬停、聚焦或点击查看解释。</p>
      </Prose>

      <Prose className="lab-intro" label="自己切一次">
        <h2>同一个字段，两种执行方式，三种合并规则。</h2>
        <p>先看顺序执行的基线，再切到并行，观察「覆盖」怎样失去意义。</p>
      </Prose>

      <ScenarioLab
        kicker="INTERACTIVE 13"
        title="给字段配一条合并规则"
        storageKey="agent-lab-lesson-13"
        controls={[
          { kind: "segmented", id: "mode", label: "执行方式", options: [{ id: "serial", label: "顺序执行" }, { id: "parallel", label: "并行执行" }], initial: "serial" },
          { kind: "segmented", id: "rule", label: "合并规则", options: [{ id: "overwrite", label: "覆盖（无 reducer）" }, { id: "add", label: "operator.add" }, { id: "custom", label: "自定义" }], initial: "overwrite" },
        ]}
        compute={compute}
        rowsLabel="这一组的结果"
        note="全部来自 13_reducers.py 的实跑，包括并行合并的实际顺序——它由运行时决定，换个版本或节点名都可能变。"
        code={{
          summary: "展开自定义 reducer",
          text: `def keep_highest(old: dict, new: dict) -> dict:
    """两个分支各给一个打分，保留分数更高的那个来源。"""
    if not old:            # 第一个分支到达时 old 是初始值
        return new
    return new if new["score"] > old["score"] else old

class Scored(TypedDict):
    best: Annotated[dict, keep_highest]`,
        }}
      />

      <Prose className="after-lab" label="怎样为一个字段选规则">
        <h2>按字段的含义选，不是按顺手选。</h2>
        <CodeBlock>{`只有最新值有意义    不加 reducer     当前状态、开关、计数
每一条都要留下      operator.add     日志、消息、收集到的结果
需要去重或取优      自定义           检索结果合并、多模型投票
会被并行写入        必须有 reducer   任何扇出分支共同写的字段`}</CodeBlock>
        <p>最后一行是硬性的。第 21、22 课要做并行和 map-reduce，那时每一个被多个分支写的字段都得先想清楚合并规则。</p>
        <Callout tone="warn" title="messages 的 reducer 多做一件事">
          <code>add_messages</code> 按<strong>消息 id</strong> 合并：id 相同的消息会被当成「更新那条旧消息」，而不是追加新的。
          本课程写脚本化模型时真的踩到过——两个模型实例给出了相同的消息 id，结果新回答覆盖了旧回答，
          最后一条消息变成了用户的提问。排查这类问题时，先打印每条消息的 <code>id</code>，再看内容。
        </Callout>
      </Prose>

      <RunLocally file="lab/langgraph/examples/13_reducers.py" command="uv run python examples/13_reducers.py">
        <strong>不需要 API Key</strong>。建议自己加一个 reducer 试试，比如「最多保留 3 条」：<code>return (old + new)[-3:]</code>。
      </RunLocally>

      <Prose label="本课挑战：这个 reducer 有什么问题">
        <h2>它原地修改了旧值。</h2>
        <CodeBlock>{`def merge(old: list, new: list) -> list:
    old.extend(new)      # 危险
    return old`}</CodeBlock>
        <p>reducer 应该返回一个新值，而不是改动传进来的那个。原地修改会让 checkpoint 里保存的历史状态跟着变——第 18 课要做 Time Travel，那时你会发现「旧状态」已经被后来的运行改掉了。</p>
        <p>正确写法是 <code>return old + new</code>。</p>
      </Prose>

      <Prose label="三个常见误区">
        <h2>报错说明的是这个字段缺少合并规则。</h2>
        <Misconceptions
          items={[
            { claim: "并行报错说明并行不好用", verdict: "说反了", body: <p>加上 reducer 之后并行完全正常，第 21 课会大量使用。</p> },
            { claim: "reducer 只在并行时才需要", verdict: "顺序执行也在用", body: <p><code>log</code> 和 <code>messages</code> 的累加就是。并行只是让「没有 reducer」这件事变得无法忽略。</p> },
            { claim: "用 operator.add 就万无一失", verdict: "只会拼接", body: <p>列表会越来越长，直到撞上第 14 课的上下文长度问题；字典用它会直接报类型错误。</p> },
          ]}
        />
      </Prose>

      <Prose className="after-lab" label="本课带走">
        <h2>三句话。</h2>
        <Takeaways title="第十三课带走" items={["并行写无 reducer 的字段会报错，这是保护", "reducer 只需回答「两个都来了怎么办」", "不要依赖并行结果的顺序"]} />
      </Prose>

      <section className="chapter-bridge">
        <span>NEXT</span><i />
        <span>消息一直累加，迟早撞上上下文长度上限。下一课处理三种取舍。</span>
      </section>
    </article>
  );
}
