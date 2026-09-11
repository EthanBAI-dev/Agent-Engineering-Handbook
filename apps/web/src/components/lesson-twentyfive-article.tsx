"use client";

import { ScenarioLab, type ScenarioState } from "@/components/lab-kit";
import { Prose } from "@/components/auto-term";
import { Callout, CodeBlock, Misconceptions, RunLocally, Takeaways } from "@/components/article-kit";

const FACTS = 5;

function compute(s: ScenarioState) {
  const shape = String(s.shape);
  if (shape === "single") {
    return {
      rows: [
        { label: "结构", value: "一张图，两步共享 State", tone: "normal" as const },
        { label: "事实完整度", value: `${FACTS} / ${FACTS} 条`, tone: "good" as const },
        { label: "模型调用", value: "2 次", tone: "muted" as const },
      ],
      lines: [{ text: "第二步能看到第一步的全部现场，不是摘要。共享 State 没有损耗，调试也简单。", tone: "good" as const }],
      verdict: { text: "这是基线。切到多 Agent，看交接会丢掉什么。", passed: false },
    };
  }
  const kept = shape === "full" ? 5 : shape === "long" ? 4 : 2;
  const calls = shape === "full" ? 3 : shape === "long" ? 3 : 3;
  return {
    rows: [
      { label: "结构", value: "两个 Agent，中间一次交接", tone: "normal" as const },
      { label: "事实完整度", value: `${kept} / ${FACTS} 条`, tone: (kept === FACTS ? "good" : "bad") as "good" | "bad" },
      { label: "模型调用", value: `${calls} 次（交接摘要也要一次）`, tone: "bad" as const },
    ],
    lines: shape === "full"
      ? [{ text: "交接内容就是完整 State——那它和一张图没有区别，只是多了一次调用和一次序列化。你付出了成本，没换来任何隔离。", tone: "bad" as const }]
      : [{ text: `丢掉了 ${FACTS - kept} 条事实。摘要的定义就是丢东西。没有第三种可能：交接是完整 State 就等于一张图，是摘要就一定丢信息。`, tone: "bad" as const }],
    verdict: {
      text: "两档都试过了吗？无论选哪一档，问题都是「为了换来什么，值得丢这些」。",
      passed: shape === "short" || shape === "long",
    },
  };
}

export function LessonTwentyFiveArticle() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 25 · Multi-Agent</p>
        <h1>先证明你真的<br />需要第二个 Agent。</h1>
        <p className="chapter-dek">「多 Agent 协作」听起来比「一张图」高级，所以它常被当成默认选择。</p>
        <div className="chapter-meta"><span>预计 8 分钟</span><span>无需 API</span><span>单元五收尾</span></div>
      </header>

      <Prose label="只看一句话的话">
        <h2>多一个 Agent 就多一层交接，而交接一定会丢东西。</h2>
        <p>这一课不教怎么搭多 Agent，教怎么判断该不该搭。</p>
        <p className="term-hint">带虚线的词都可以悬停、聚焦或点击查看解释。</p>
      </Prose>

      <Prose className="lab-intro" label="自己数一次">
        <h2>五条事实，看有几条活着通过交接。</h2>
        <p>先看一张图的基线，再把交接内容从「完整现场」一路收到「一句话摘要」。</p>
      </Prose>

      <ScenarioLab
        kicker="INTERACTIVE 25"
        title="数一数丢了什么"
        storageKey="agent-lab-lesson-25"
        controls={[{
          kind: "segmented", id: "shape", label: "结构与交接",
          options: [
            { id: "single", label: "一张图" },
            { id: "full", label: "交接完整现场" },
            { id: "long", label: "三句话摘要" },
            { id: "short", label: "一句话摘要" },
          ],
          initial: "single",
        }]}
        compute={compute}
        rowsLabel="这一档的代价"
        note="实跑对比：一张图 3/3 条事实全部保留，两个 Agent 一句话摘要只剩 2/3——丢掉的那条是「日期」。A 知道它，但没写进交接文本，B 就再也看不到了。"
        code={{
          summary: "展开这条推理为什么没有第三种可能",
          text: `交接 = 完整 State  →  等于一张图，白付成本
交接 = 摘要        →  一定丢信息（摘要的定义就是丢东西）

所以问题永远是：为了换来什么，值得丢这些？`,
        }}
      />

      <Prose className="after-lab" label="什么时候值得">
        <h2>三个硬理由，两个假理由。</h2>
        <CodeBlock>{`步骤多但目标单一        一张图      共享 State 没有损耗，调试也简单
需要不同的工具权限      多 Agent    把危险工具关在一个 Agent 里
需要不同的模型或成本档  多 Agent    简单活给便宜模型，难的给贵的
由不同团队维护和发布    多 Agent    边界即接口，能各自升级
只是想让流程看起来清晰  一张图      用子图就够了，第 23 课
想让 Agent 互相检查      看情况      先试同一张图里加一个检查节点`}</CodeBlock>
        <p>第二行是最硬的理由，也和第 16、28 课直接相关：<strong>如果一个 Agent 根本拿不到删除工具，它就不可能误删。</strong>这种隔离是结构性的，比任何提示词都可靠。</p>
        <Callout title="一个判断标准">
          <strong>能用一句话说清「这两个 Agent 各自不许知道什么」吗？</strong><br />
          说得清 → 这条边界是真的，多 Agent 有意义。<br />
          说不清 → 你要的其实是子图，不是第二个 Agent。<br />
          「A 负责收集，B 负责撰写」不是边界，那只是分工——分工用子图就能表达，不需要切断信息。
        </Callout>
      </Prose>

      <Prose label="三笔额外成本">
        <h2>调试变难、成本上升、失败面变大。</h2>
        <p><strong>调试</strong>：出了问题要先判断是 A 给错了还是 B 理解错了。第 18 课的时间旅行还能用，但你要在两条时间线之间对照。</p>
        <p><strong>成本</strong>：交接本身往往要一次模型调用来生成摘要。两个 Agent 常常意味着三次调用而不是两次。</p>
        <p><strong>失败面</strong>：每个交接点都是一个可能出错的地方，而且这类错误是「信息悄悄少了一块」，不会报错。</p>
      </Prose>

      <RunLocally file="lab/langgraph/examples/25_multi_agent.py" command="uv run python examples/25_multi_agent.py">
        <strong>不需要 API Key</strong>。建议改 <code>FACTS</code> 加几条事实再跑，观察交接损耗怎样随现场规模放大——<strong>现场越复杂，交接丢得越多</strong>。
      </RunLocally>

      <Prose label="本课挑战：这个多 Agent 有意义吗">
        <h2>大概率没有。</h2>
        <CodeBlock>{`Agent 1：判断是技术问题还是账务问题
Agent 2：技术问题，查文档并回答
Agent 3：账务问题，查订单并回答`}</CodeBlock>
        <p>这是第 11 课的 Router 加两个分支。三个「Agent」共享同一个目标、同一份用户问题，也没有任何一个需要对另一个隐藏信息。写成一张图，代码更短、没有交接损耗、调试也简单。</p>
        <p><strong>除非</strong>——Agent 3 需要访问订单数据库，而你不希望 Agent 2 有这个权限。那这条边界就是真的。判断依据不是流程图长什么样，是<strong>有没有一条必须切断的信息边界</strong>。</p>
      </Prose>

      <Prose label="三个常见误区">
        <h2>Agent 不会主动追问。</h2>
        <Misconceptions
          items={[
            { claim: "多 Agent 更接近真实团队协作", verdict: "人会追问，它不会", body: <p>真实团队协作也有交接损耗，只是人会主动追问。Agent 拿到什么就用什么，缺了什么它不知道。</p> },
            { claim: "让 Agent 互相审查，质量会更高", verdict: "检查方看得更少", body: <p>同一张图里加一个检查节点通常够了，而且检查节点能看到完整现场。</p> },
            { claim: "先按多 Agent 设计，以后好扩展", verdict: "第一天就开始收费", body: <p>多出来的交接层从第一天就开始收费，而扩展需求可能永远不来。第 23 课的子图已经让拆分很便宜了。</p> },
          ]}
        />
      </Prose>

      <Prose className="after-lab" label="本课带走">
        <h2>三句话。</h2>
        <Takeaways title="第二十五课带走" items={["交接不是完整 State 就一定丢信息", "真正的理由是权限隔离、成本分档、团队边界", "说不清各自不许知道什么，你要的是子图"]} />
      </Prose>

      <section className="chapter-bridge">
        <span>NEXT</span><i />
        <span>单元五结束。下一课进入单元六：先解决它凭什么知道答案。</span>
      </section>
    </article>
  );
}
