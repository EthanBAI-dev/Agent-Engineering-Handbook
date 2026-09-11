"use client";

import { ScenarioLab, type ScenarioState } from "@/components/lab-kit";
import { Prose } from "@/components/auto-term";
import { Callout, CodeBlock, Misconceptions, RunLocally, Takeaways } from "@/components/article-kit";

function compute(s: ScenarioState) {
  const field = String(s.field);
  const writes = Boolean(s.writes);
  const dup = field === "shared-add";
  const trail = dup
    ? "['父图做了一件事', '父图做了一件事'" + (writes ? ", '子图做了一件事']" : "]")
    : field === "own"
      ? "父图 ['父图做了一件事']　子图 ['子图做了一件事']"
      : "父图 ['父图做了一件事']　status 'done'";
  return {
    rows: [
      { label: "父图轨迹", value: trail, tone: (dup ? "bad" : "good") as "bad" | "good" },
      { label: "触发条件", value: dup ? "子图在 schema 里声明了这个字段" : "不共享带 reducer 的字段", tone: "muted" as const },
      { label: "和子图写不写有关吗", value: dup && !writes ? "无关——它什么都没写，照样重复" : "—", tone: (dup && !writes ? "bad" : "muted") as "bad" | "muted" },
    ],
    lines: dup
      ? [{ text: "机制：子图把它看到的完整值写回父图，父图的 reducer 又累加了一次。这和 interrupt 无关，也和子图写不写这个字段无关——只要共享字段带 reducer，就会发生。", tone: "bad" as const }]
      : field === "own"
        ? [{ text: "各写各的字段，谁也不碰谁。要合并就在父图里显式合并——显式比隐式安全。", tone: "good" as const }]
        : [{ text: "覆盖型字段不会被累加，所以可以安全共享。这给出一条设计原则：父子接口用覆盖型传，累加型各留各的。", tone: "good" as const }],
    verdict: {
      text: !dup ? "对了。两种修法都能避开重复计数。" : "换一种字段设计，让父图轨迹不再重复。",
      passed: !dup,
    },
  };
}

export function LessonTwentyThreeArticle() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 23 · Subgraph</p>
        <h1>封装很简单，<br />State 对接才是坑。</h1>
        <p className="chapter-dek">语法只有一行：把编译好的图当节点加进去。真正会咬人的是父子共享字段时的合并行为。</p>
        <div className="chapter-meta"><span>预计 9 分钟</span><span>无需 API</span><span>承接第 22 课</span></div>
      </header>

      <Prose label="只看一句话的话">
        <h2>父子共享带 reducer 的字段，会被计两次。</h2>
        <CodeBlock>{`approval = approval_graph.compile()      # 子图，单独编译
main.add_node("approval", approval)      # 直接当节点用`}</CodeBlock>
        <p>没有特殊 API，也不用注册。子图和普通节点在父图眼里没有区别。<strong>难的不在这里。</strong></p>
        <p className="term-hint">带虚线的词都可以悬停、聚焦或点击查看解释。</p>
      </Prose>

      <Prose className="lab-intro" label="自己看那个坑">
        <h2>父图只写过一次，轨迹里却出现两次。</h2>
        <p>先看共享累加字段的默认行为，特别注意把「子图写不写」关掉之后——它什么都没写，照样重复。</p>
      </Prose>

      <ScenarioLab
        kicker="INTERACTIVE 23"
        title="找出重复的那一条"
        storageKey="agent-lab-lesson-23"
        controls={[
          { kind: "segmented", id: "field", label: "父子字段设计", options: [
            { id: "shared-add", label: "共享 + 带 reducer" },
            { id: "own", label: "子图用自己的字段名" },
            { id: "overwrite", label: "共享但改成覆盖型" },
          ], initial: "shared-add" },
          { kind: "switch", id: "writes", label: "子图往这个字段里写东西", initial: true },
        ]}
        compute={compute}
        rowsLabel="跑完之后"
        note="这个坑是写实验时真的踩到的：原本的审批子图和父图共享 audit，跑出来轨迹里「准备执行」出现两次。查清楚之后整个例子围绕这个发现重写了。"
        code={{
          summary: "展开一个真正能用的审批子图",
          text: `class ApprovalState(TypedDict):
    action: str                                    # 输入：覆盖型，安全共享
    approved: bool                                 # 输出：覆盖型，安全共享
    sub_audit: Annotated[list[str], operator.add]  # 子图私有的累加字段

# 三个字段分成两类，正好对应两条修法。`,
        }}
      />

      <Prose className="after-lab" label="什么时候该抽子图">
        <h2>理由是复用和单独测试，不是让主图看起来短。</h2>
        <CodeBlock>{`该抽    同一段流程出现第三次
该抽    这段流程需要单独测试
该抽    它有自己的失败与重试逻辑
不该抽  只是想让主图看起来短一点`}</CodeBlock>
        <p>最后一条值得展开：把节点从主图挪进子图，复杂度没有消失，只是换了个地方，而且多了一层 State 对接要操心。<strong>行数不是复杂度。</strong></p>
        <p>抽子图最实在的好处是<strong>能单独跑、单独测</strong>：审批逻辑可以脱离业务流程单独验收，第 20 课那五条验收路径可以只针对审批子图写一遍，业务流程改了也不用重跑。</p>
        <Callout title="子图里的 interrupt 会把整张图停住">
          checkpointer 在父图上编译即可，子图不用单独配。只有单独跑子图时才需要给它一个。
        </Callout>
      </Prose>

      <RunLocally file="lab/langgraph/examples/23_subgraph.py" command="uv run python examples/23_subgraph.py">
        <strong>不需要 API Key</strong>。
      </RunLocally>

      <Prose label="本课挑战：这个子图会怎样出错">
        <h2>messages 是父子共享的累加字段。</h2>
        <CodeBlock>{`class SubState(TypedDict):
    messages: Annotated[list, add_messages]     # 和父图共享
    draft: str`}</CodeBlock>
        <p>子图跑完之后，父图已有的消息会被再追加一遍。而且因为 <code>add_messages</code> 按 id 合并，具体表现取决于消息 id 是否相同，可能是重复，也可能是部分覆盖——<strong>比列表重复更难查</strong>。</p>
      </Prose>

      <Prose label="三个常见误区">
        <h2>判断依据是 schema，不是节点代码。</h2>
        <Misconceptions
          items={[
            { claim: "子图不写那个字段就不会有问题", verdict: "声明就会触发", body: <p>实跑证明只要在 schema 里声明就会。判断依据是 schema，不是节点代码。</p> },
            { claim: "抽成子图之后主图更简单了", verdict: "复杂度只是挪了地方", body: <p>主图行数少了，但多了一层 State 对接。只有需要复用或单独测试时，这个代价才划算。</p> },
            { claim: "子图需要自己的 checkpointer", verdict: "父图上编译即可", body: <p>子图里的 <code>interrupt</code> 会让整张图暂停。只有单独跑子图时才需要给它一个。</p> },
          ]}
        />
      </Prose>

      <Prose className="after-lab" label="本课带走">
        <h2>三句话。</h2>
        <Takeaways title="第二十三课带走" items={["共享的累加字段会被重复计数", "接口用覆盖型传，累加型各留各的", "抽子图的理由是复用和单独测试"]} />
      </Prose>

      <section className="chapter-bridge">
        <span>NEXT</span><i />
        <span>图的结构工具齐了。下一课换个角度——先把计划写下来，再执行。</span>
      </section>
    </article>
  );
}
