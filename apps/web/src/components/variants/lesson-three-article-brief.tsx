// 备份：补充正文之前的精简版，仅用于 /lessons/<slug>/brief 对照阅读。
// 不要在这里继续开发；正式版本在 src/components/lesson-*-article.tsx。
import { LessonThreeLab } from "@/components/lesson-three-lab";
import { Term } from "@/components/term";

export function LessonThreeArticleBrief() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 03 · 会话记忆</p>
        <h1>同一个 thread 记得，<br />换一个就忘了。</h1>
        <p className="chapter-dek">前两课的图跑完一次就把现场丢掉了。这一课加一行代码，让它把每一步存下来——再用一个编号决定「这段记忆属于谁」。</p>
        <div className="chapter-meta"><span>预计 9 分钟</span><span>模拟运行</span><span>承接第 01–02 课</span></div>
      </header>

      <section className="prose-block">
        <p className="section-label">先说清楚一件事</p>
        <h2>Agent 会「忘」，不是模型记性差。</h2>
        <p>是上一轮的 <Term definition="图运行时携带的那份数据，节点读它、也改它。">State（运行状态）</Term> 根本没有交给下一轮。第 02 课里所有消息都放在 <Term definition="一次图运行中按顺序累积用户、模型和工具消息。">MessagesState（消息状态）</Term> 里，但那只保证「这一次运行」不互相覆盖。下一次调用图，程序又从你新传进去的 State 开始。</p>
        <p>要让它接上，需要两样东西：一个负责存的人，和一个说明「存给谁」的编号。</p>
        <p className="term-hint">带虚线的词可以悬停、聚焦或点击，查看它在这一课里的职责。</p>
        <blockquote>像酒店前台：<strong>前台保存入住记录</strong>，<strong>房间号决定翻出哪一份</strong>。报同一个房间号，前台找得到你之前的记录；报另一个号，拿出的是别人的那份。</blockquote>
      </section>

      <section className="role-strip" aria-label="会话记忆的三个角色">
        <div><span>1</span><strong>checkpointer</strong><p>把每一步存下来</p></div>
        <i>→</i>
        <div><span>2</span><strong>checkpoint</strong><p>某一刻的 State 快照</p></div>
        <i>→</i>
        <div><span>3</span><strong>thread_id</strong><p>快照归到哪段会话</p></div>
      </section>

      <section className="prose-block">
        <p className="section-label">两行代码</p>
        <h2>节点一个字都不用改。</h2>
        <p>编译图的时候传入一个 <Term definition="负责在图运行的每一步保存和读取状态快照的组件。">checkpointer（检查点保存器）</Term>，图就开始在执行过程中写 <Term definition="图在某一步的状态快照，包含当时的 State 和继续运行需要的位置信息。">checkpoint（状态快照）</Term>。</p>
        <pre className="inline-code-block"><code>{`app = graph.compile(checkpointer=InMemorySaver())`}</code></pre>
        <p>调用的时候，再用 <Term definition="一段会话的编号。同一个编号接着上次继续，换一个编号就是全新对话。">thread_id（会话标识）</Term> 说明「这次运行属于哪段会话」。</p>
        <pre className="inline-code-block"><code>{`cfg = {"configurable": {"thread_id": "a"}}
out = app.invoke({"messages": [("user", text)]}, cfg)`}</code></pre>
        <p>保存和恢复由图的运行层处理。model 节点还是只干自己那件事：读消息、调一次模型。</p>
      </section>

      <section className="prose-block lab-intro">
        <p className="section-label">自己分一次</p>
        <h2>三条消息，你决定它们进哪个 thread。</h2>
        <p>下面的实验不调用真实模型。每次点「调用图」，你都能看到 checkpointer 先恢复了几条消息、model 这一步看到几条输入、以及这个 thread 写到第几版 checkpoint。</p>
      </section>

      <LessonThreeLab />

      <section className="prose-block after-lab">
        <p className="section-label">别把它想大了</p>
        <h2>这是会话记忆，不是长期记忆。</h2>
        <p>本课的「记忆」准确说是 thread 级别的 State 持久化：它让一段对话可以接着说下去，但不会自动从几十段历史里提炼你的偏好，也不会跨会话检索资料。那是后面课程的事。</p>
        <p>还有两条边界要记住。<Term definition="把 checkpoint 暂存在当前 Python 进程内存里，进程退出就清空。">InMemorySaver（内存检查点保存器）</Term> 进程一退就清空，线上函数还可能重启或换实例，所以它不是生产存储；换成 SQLite 或 Postgres 的 checkpointer，图本身一个字都不用改。</p>
        <p>另一条更重要：<code>thread_id</code> 只是运行配置，不是账号密码。知道一个编号，不代表就该被允许读取那段对话——真实产品要靠服务端判断当前用户能访问哪些 thread。</p>
        <p>调试记忆问题时，先用 <Term definition="读取指定会话最近保存的 State，让你直接检查里面到底有什么。">get_state（读取状态方法）</Term> 看看 State 里是不是真的有消息，再去怀疑模型。</p>
        <div className="chapter-summary"><strong>第三课带走</strong><span>checkpointer 保存快照</span><span>thread_id 决定归属</span><span>InMemorySaver 只够学习用</span></div>
      </section>

      <section className="chapter-bridge">
        <span>NEXT</span>
        <i />
        <span>存得下来，就停得下来：下一课让图中途暂停，等人批准后从原地继续。</span>
      </section>
    </article>
  );
}
