import { LessonOneLab } from "@/components/lesson-one-lab";
import { Term } from "@/components/term";

export function LessonOneArticle() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 01 · 图与 State</p>
        <h1>Agent 不是一次回答，<br />而是一条会改变 State 的路。</h1>
        <p className="chapter-dek">先别急着接模型。把一张没有 AI 的图跑明白，你就抓住了 LangGraph 最稳定的骨架。</p>
        <div className="chapter-meta"><span>预计 8 分钟</span><span>无需 API</span><span>零基础</span></div>
      </header>

      <section className="prose-block">
        <p className="section-label">只看一句话的话</p>
        <h2>Agent 每走到一个节点，就读一次 State，再写回一小块变化。</h2>
        <p>普通函数像一次性办完一件事：输入进去，结果出来，中间发生什么很难看见。</p>
        <p>图不一样。<Term definition="保存当前运行现场，让后续步骤能读取前面留下的消息和数据。">State（运行状态）</Term> 在步骤之间传递；<Term definition="读取 State、完成一种明确动作，再返回需要更新的字段。">Node（节点）</Term> 做一小步；<Term definition="连接节点，并决定流程固定前进、条件分支、循环还是结束。">Edge（边）</Term> 决定下一步去哪。</p>
        <p className="term-hint">带虚线的词可以悬停、聚焦或点击，查看它在本课中的职责。</p>
        <blockquote>把它想成接力赛：State 是接力棒，Node 是运动员，Edge 是跑道。每个人只完成自己的一段，然后把同一根棒交给下一个人。</blockquote>
      </section>

      <section className="concept-explainer" aria-label="三个核心概念">
        <article><span>STATE</span><h2>共享的数据</h2><p>所有节点都读它。节点返回的不是全新世界，而是要更新的字段。</p></article>
        <article><span>NODE</span><h2>做一小步</h2><p>一个节点就是一个函数：读取当前 State，完成一种明确动作。</p></article>
        <article><span>EDGE</span><h2>决定下一站</h2><p>固定 Edge 直接前进，条件 Edge 可以分支，也可以让流程再跑一圈。</p></article>
      </section>

      <section className="prose-block lab-intro">
        <p className="section-label">现在别只看</p>
        <h2>每点一次，只允许图走一步。</h2>
        <p>先盯住 <code>count</code> 和 <code>log</code>。前者每次被新值覆盖；后者通过 <Term definition="规定新值怎样与旧 State 合并；本实验用它把新日志追加到旧列表后面。">Reducer（归并规则）</Term> 把新记录接在旧记录后面。</p>
      </section>

      <LessonOneLab />

      <section className="prose-block after-lab">
        <p className="section-label">你刚刚看见了什么</p>
        <h2>循环不是 Agent 的神秘能力，只是一条条件 Edge。</h2>
        <p>当 <code>count &lt; threshold</code> 成立，work 又指向自己。不成立时，它才把接力棒交给 review。</p>
        <p>这也是第一课最重要的判断：节点负责做事，Edge 负责控制流程，State 负责让每一步看见前面发生过什么。</p>
        <div className="chapter-summary"><strong>第一课带走</strong><span>State 保存现场</span><span>Node 修改现场</span><span>Edge 推动下一步</span></div>
      </section>
    </article>
  );
}
