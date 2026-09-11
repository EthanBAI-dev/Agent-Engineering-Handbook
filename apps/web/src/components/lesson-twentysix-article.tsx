"use client";

import { ScenarioLab, type ScenarioState } from "@/components/lab-kit";
import { Prose } from "@/components/auto-term";
import { Callout, CodeBlock, Misconceptions, RunLocally, Takeaways } from "@/components/article-kit";

const QUESTIONS = [
  { id: "hit", label: "年假有几天？" },
  { id: "miss", label: "公司几点下班？" },
  { id: "stale", label: "年假有几天？（库里还留着 v3 旧版）" },
];

function compute(s: ScenarioState) {
  const q = String(s.question);
  const guarded = Boolean(s.guard);
  if (q === "miss") {
    return {
      rows: [
        { label: "检索命中", value: "0 条", tone: "muted" as const },
        { label: "回答", value: guarded ? "知识库里没有找到相关内容。" : "公司一般下午六点下班。", tone: (guarded ? "good" : "bad") as "good" | "bad" },
        { label: "引用", value: "（无）", tone: (guarded ? "muted" : "bad") as "muted" | "bad" },
      ],
      lines: guarded
        ? [{ text: "这条路径由条件边保证，模型根本没有被调用——没有被调用，就没有机会编。", tone: "good" as const }]
        : [{ text: "语气笃定，没有出处，内容是编的。用户没有任何办法分辨这一句和上一句的区别。", tone: "bad" as const }],
      verdict: { text: guarded ? "对了。拒绝要由条件边保证，不是靠提示词里那句「不知道就说不知道」。" : "打开条件边保护，让检索落空时模型不参与。", passed: guarded },
    };
  }
  if (q === "stale") {
    return {
      rows: [
        { label: "检索命中", value: "2 条（v3 与 v4 同时在库）", tone: "bad" as const },
        { label: "回答", value: "年假每年 10 天。", tone: "bad" as const },
        { label: "引用", value: "员工手册 v3 第 2 章", tone: "bad" as const },
      ],
      lines: [{ text: "条件边只能判断「有没有命中」，判断不了「命中的对不对」。带引用的错误答案比不带引用的更危险——它看起来是可信的。挡住它要在入库那一层：带上版本和生效日期，检索时过滤掉失效的。", tone: "bad" as const }],
      verdict: { text: "这一档挡不住。它的解法在检索工程，不在图里。", passed: false },
    };
  }
  return {
    rows: [
      { label: "检索命中", value: "1 条", tone: "good" as const },
      { label: "回答", value: "年假从入职满一年起算，每年 10 天。", tone: "good" as const },
      { label: "引用", value: "doc-1 · 员工手册 v3 第 2 章", tone: "good" as const },
    ],
    lines: [{ text: "引用不是在答案后面缀一句「来源：员工手册」，是能定位到具体哪一条。用户点进去要能看到原文。" }],
    verdict: { text: "命中的情况当然没问题。换成库里没有的问题试试。", passed: false },
  };
}

export function LessonTwentySixArticle() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 26 · Search 与 RAG</p>
        <h1>让它答「不知道」，<br />比让它答得漂亮更难。</h1>
        <p className="chapter-dek">决定 RAG 能不能上线的不是答得好不好，是检索不到时会不会编。</p>
        <div className="chapter-meta"><span>预计 8 分钟</span><span>无需 API</span><span>单元六开始</span></div>
      </header>

      <Prose label="只看一句话的话">
        <h2>引用的前提在检索之前。</h2>
        <p>每条资料<strong>入库时</strong>就带着 <code>id</code> 和 <code>source</code>。这不是细节——如果知识库里只有正文，那么答案生成之后你无论如何也补不出出处，只能让模型猜一个，那就成了另一种编造。</p>
        <p className="term-hint">带虚线的词都可以悬停、聚焦或点击查看解释。</p>
      </Prose>

      <Prose className="lab-intro" label="三个问题，三种结果">
        <h2>第三种最危险。</h2>
        <p>库里有的、库里没有的、库里有但过期的。关掉条件边保护，看第二种会发生什么。</p>
      </Prose>

      <ScenarioLab
        kicker="INTERACTIVE 26"
        title="引用还是拒绝"
        storageKey="agent-lab-lesson-26"
        controls={[
          { kind: "segmented", id: "question", label: "问什么", options: QUESTIONS, initial: "hit" },
          { kind: "switch", id: "guard", label: "条件边保护", note: "命中不足时走 refuse，不调用模型", initial: true },
        ]}
        compute={compute}
        rowsLabel="这次问答"
        note="拒绝路径上模型根本不会被调用——这是结构保证，不是提示词约束。提示词里那句「只根据以下资料回答」仍然要写，它降低模型在「检索到但不相关」时自由发挥的概率，两者是叠加关系。"
        code={{
          summary: "展开拒绝路径怎么接",
          text: `def route(state: State) -> str:
    return "answer" if len(state["hits"]) >= MIN_HITS else "refuse"

graph.add_conditional_edges("retrieve", route, ["answer", "refuse"])
# refuse 这条路上没有模型节点`,
        }}
      />

      <Prose className="after-lab" label="检索质量决定上限">
        <h2>RAG 答错了，先看检索回来的是什么。</h2>
        <p>条件边只能判断「有没有命中」，判断不了「命中的对不对」。检索回来三条不相关的资料，Agent 会一本正经地基于错资料作答。</p>
        <p>这一层的改进手段不在 LangGraph 里：切分粒度、向量模型、混合检索、重排。但有一条判断可以现在就用：<strong>绝大多数「模型不行」的抱怨，查下去是检索不行。</strong></p>
        <Callout tone="warn" title="知识库会过期">
          手册从 v3 换成 v4，年假从 10 天改成 15 天。旧文档还在库里，Agent 会同时检索到两个版本，
          然后给出一个笃定的错误答案，还带着看起来很正规的引用。
          入库时除了 <code>source</code>，通常还要有版本和生效日期，检索时过滤掉失效的。
        </Callout>
      </Prose>

      <RunLocally file="lab/langgraph/examples/26_rag.py" command="uv run python examples/26_rag.py">
        <strong>不需要 API Key</strong>。检索用关键词匹配而不是向量，是为了让结果可复现。换成真实检索后，本课的结构一个字都不用改。
      </RunLocally>

      <Prose label="本课挑战：这个 RAG 哪里会出事">
        <h2>一个假引用。</h2>
        <CodeBlock>{`context = "\\n".join(h["text"] for h in state["hits"])     # 只拼正文
return {"answer": reply.content, "citations": ["知识库"]}`}</CodeBlock>
        <p>一是 <code>context</code> 里没有 <code>id</code>，模型无法指出哪句话来自哪条资料，你也无法核对。二是 <code>citations</code> 写死成 <code>{`["知识库"]`}</code>——这是一个<strong>看起来像引用的假引用</strong>，比不给引用更糟，因为它让用户以为核对过了。</p>
      </Prose>

      <Prose label="三个常见误区">
        <h2>提示词挡不住编造。</h2>
        <Misconceptions
          items={[
            { claim: "在提示词里写了「不知道就说不知道」就够了", verdict: "照样编", body: <p>实跑的反面示范就是这么写的。结构上不给它机会才有效。</p> },
            { claim: "检索回来越多越好", verdict: "会稀释", body: <p>无关资料会稀释相关资料，还会撞上第 14 课的上下文预算。命中数要有下限，也要有上限。</p> },
            { claim: "RAG 答错了是模型的问题", verdict: "先看检索", body: <p>绝大多数情况下，模型忠实地基于错资料回答了。</p> },
          ]}
        />
      </Prose>

      <Prose className="after-lab" label="本课带走">
        <h2>三句话。</h2>
        <Takeaways title="第二十六课带走" items={["资料入库时就要带 id 和来源", "拒绝路径由条件边保证，模型不参与", "带引用的错误答案比不带引用的更危险"]} />
      </Prose>

      <section className="chapter-bridge">
        <span>NEXT</span><i />
        <span>它答得有依据了。但「这次改动到底变好还是变差」，你还是说不清。</span>
      </section>
    </article>
  );
}
