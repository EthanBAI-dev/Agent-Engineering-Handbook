import { LessonTwoLab } from "@/components/lesson-two-lab";
import { Term } from "@/components/term";

export function LessonTwoArticle() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 02 · 工具循环</p>
        <h1>模型不会亲手算。<br />它先决定要不要调用工具。</h1>
        <p className="chapter-dek">第一课的图已经会循环。现在把 plan 和 work 换成 model 和 tools，一个最小的 ReAct Agent 就出现了。</p>
        <div className="chapter-meta"><span>预计 10 分钟</span><span>模拟运行</span><span>承接第一课</span></div>
      </header>

      <section className="prose-block">
        <p className="section-label">最容易误解的一点</p>
        <h2>模型说“调用 add”，不等于模型执行了 add。</h2>
        <p><Term definition="读取消息，决定回答还是生成工具调用请求；它不直接执行 Python 函数。">model（模型节点）</Term> 能做的是生成一份 <Term definition="写明工具名称和参数的结构化调用请求。">tool call（工具调用请求）</Term>。真正运行 Python 函数的是 <Term definition="读取 tool call，找到并执行对应函数，再把结果写回消息列表。">ToolNode（工具执行节点）</Term>。</p>
        <p>工具跑完后，会把结果追加进 <Term definition="按顺序保存用户、模型和工具消息，让下一次判断看得见前文。">MessagesState（消息状态）</Term>。模型再读一次完整消息，决定继续调用工具，还是给出最终回答。</p>
        <p className="term-hint">带虚线的词可以悬停、聚焦或点击，查看它在循环里的职责。</p>
        <blockquote>像餐厅点单：model 是服务员，tools 是厨房。服务员决定点什么，但菜不是他炒的；厨房出菜后，还要交回服务员送到你面前。</blockquote>
      </section>

      <section className="role-strip" aria-label="工具循环角色分工">
        <div><span>1</span><strong>model</strong><p>提出 tool call</p></div>
        <i>→</i>
        <div><span>2</span><strong>tools</strong><p>执行真实函数</p></div>
        <i>→</i>
        <div><span>3</span><strong>model</strong><p>读取结果并回答</p></div>
      </section>

      <section className="prose-block lab-intro">
        <p className="section-label">跟着消息走</p>
        <h2>看清“谁决定、谁执行、谁回答”。</h2>
        <p>这个动画不调用真实模型，因此每次结果都一样。它保留了真实 LangGraph 的节点、条件边和 <Term definition="让模型经历“判断—行动—观察”，并重复到可以结束的工具循环。">ReAct（推理—行动循环）</Term> 更新方式。</p>
      </section>

      <LessonTwoLab />

      <section className="prose-block after-lab">
        <p className="section-label">闭环的关键</p>
        <h2>真正让它成为 Agent 的，是 <code>tools → model</code>。</h2>
        <p>如果工具执行完就结束，模型永远看不到结果，也就不能判断任务是否已经完成。</p>
        <p>回到 model 后，它可以继续调用工具，也可以停止。这个“观察结果，再决定下一步”的闭环，就是工具型 Agent 的核心。</p>
        <div className="chapter-summary"><strong>第二课带走</strong><span>model 决定</span><span>tools 执行</span><span>messages 传递结果</span></div>
      </section>
    </article>
  );
}
