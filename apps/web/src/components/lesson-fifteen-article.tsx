"use client";

import { ScenarioLab, type ScenarioState } from "@/components/lab-kit";
import { Prose } from "@/components/auto-term";
import { Callout, CodeBlock, Misconceptions, RunLocally, Takeaways } from "@/components/article-kit";

function compute(s: ScenarioState) {
  const store = String(s.store);
  const restarted = Boolean(s.restart);
  const thread = String(s.thread);
  const lost = store === "memory" && restarted;
  const otherThread = thread === "b";
  const count = lost ? 0 : otherThread ? 0 : 2;
  return {
    rows: [
      { label: `thread ${thread} 的消息数`, value: `${count} 条`, tone: (count ? "good" : "bad") as "good" | "bad" },
      { label: "用户看到", value: count ? "它记得我" : "它忘了我", tone: (count ? "good" : "bad") as "good" | "bad" },
      { label: "真正的原因", value: lost ? "数据没了" : otherThread ? "数据在，但不属于这个 thread" : "—", tone: "muted" as const },
    ],
    lines: lost
      ? [{ text: "内存里的东西不会跨进程存在。线上换个实例，用户就随机失忆——而这个 bug 几乎没法靠本地复现，因为本地进程一直开着。", tone: "bad" as const }]
      : otherThread
        ? [{ text: "数据好好地在数据库里，只是不属于 thread b。用户看到的同样是「它忘了我」，但排查方向完全相反。", tone: "bad" as const }]
        : restarted
          ? [{ text: "子进程只拿到一个文件路径，没有继承任何内存，照样读到了 2 条消息——这才叫真的持久化。", tone: "good" as const }]
          : [{ text: "同一个进程里，两种存储都正常。差别只有换进程时才显出来。" }],
    verdict: {
      text: store === "sqlite" && restarted && thread === "a"
        ? "对了。换个进程还记得，才算真的记住。"
        : "把存储换成文件，重启进程，再看 thread a 还在不在。",
      passed: store === "sqlite" && restarted && thread === "a",
    },
  };
}

export function LessonFifteenArticle() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 15 · 持久化会话</p>
        <h1>换个进程还记得，<br />才算真的记住。</h1>
        <p className="chapter-dek">本地开发时进程一直开着，所以内存里的东西一直在。线上不是这样。</p>
        <div className="chapter-meta"><span>预计 8 分钟</span><span>无需 API</span><span>承接第 14 课</span></div>
      </header>

      <Prose label="只看一句话的话">
        <h2>InMemorySaver 只在这个进程里有效。</h2>
        <p>第 03 课演示了 thread 隔离，但有一句话没展开：进程一退，全部清空。第 08 课列过三条——冷启动、超时、<strong>进程不连续</strong>。无服务器平台的两次请求根本不保证落在同一个实例上。</p>
        <p className="term-hint">带虚线的词都可以悬停、聚焦或点击查看解释。</p>
      </Prose>

      <Prose className="lab-intro" label="自己重启一次">
        <h2>两种存储 × 重启 × 换 thread。</h2>
        <p>注意区分两种「它忘了我」：一种是数据没了，另一种是数据在但不属于这个 thread。用户看到的一样，排查方向完全相反。</p>
      </Prose>

      <ScenarioLab
        kicker="INTERACTIVE 15"
        title="重启之后还在不在"
        storageKey="agent-lab-lesson-15"
        controls={[
          { kind: "segmented", id: "store", label: "checkpointer", options: [{ id: "memory", label: "InMemorySaver" }, { id: "sqlite", label: "SqliteSaver" }], initial: "memory" },
          { kind: "switch", id: "restart", label: "重启进程", note: "新进程只拿到文件路径", initial: false },
          { kind: "segmented", id: "thread", label: "读哪个 thread", options: [{ id: "a", label: "thread a" }, { id: "b", label: "thread b" }], initial: "a" },
        ]}
        compute={compute}
        rowsLabel="这次读到什么"
        note="15_persistence.py 里的「重启」不是模拟——脚本真的用 subprocess 另起一个 Python 进程，只把文件路径交给它。换个 saver 实例是模拟，另起一个进程才是证明。"
        code={{
          summary: "展开上线前必须换掉的那一行",
          text: `# 教学版
app = graph.compile(checkpointer=InMemorySaver())

# 上线版
app = graph.compile(checkpointer=SqliteSaver.from_conn_string(path))

# 节点、边、条件判断、消息处理，全都不动。
# 存储是部署问题，不是业务逻辑问题——这正是 checkpointer 被设计成可替换的原因。`,
        }}
      />

      <Prose className="after-lab" label="选哪一种存储">
        <h2>问一句：会不会有第二个进程需要读到同一份数据？</h2>
        <CodeBlock>{`InMemorySaver      单元测试、本地实验、教学    任何线上场景都不行
SQLite             单机服务、小规模、自用工具  多实例部署会撞
Postgres 等共享库  多实例、需要备份和运维      只想跑个脚本就太重了`}</CodeBlock>
        <p>会，就不能用内存；有多个实例同时写，就不能用单文件的 SQLite。</p>
        <Callout tone="warn" title="持久化解决了「记得住」，没解决「谁能看」">
          第 03 课那条边界仍然成立：<code>thread_id</code> 是运行配置，不是身份验证。
          现在状态落到了数据库里，这条边界反而更要紧了——数据库里躺着所有用户的对话，凭一个编号就能取。
          这是第 29 课的内容，在那之前，接口不要公开暴露。
        </Callout>
        <p>另外两件事也要提前想：<strong>数据要能删</strong>（用户要求删除时，你得知道该删哪些行），<strong>数据会一直长</strong>（没有清理策略的话，checkpoint 表只增不减）。</p>
      </Prose>

      <RunLocally file="lab/langgraph/examples/15_persistence.py" command="uv run python examples/15_persistence.py">
        <strong>不需要 API Key</strong>。它需要 <code>langgraph-checkpoint-sqlite</code>，已经加进本仓库依赖。脚本会自己创建临时数据库、写入、开子进程读取，跑完自动清理。
      </RunLocally>

      <Prose label="本课挑战：这段代码为什么还是会丢">
        <h2>存储本身被重建了。</h2>
        <CodeBlock>{`def handle_request(message, thread_id):
    saver = InMemorySaver()                       # 每个请求新建
    app = graph.compile(checkpointer=saver)
    return app.invoke({"messages": [("user", message)]},
                      {"configurable": {"thread_id": thread_id}})`}</CodeBlock>
        <p>就算这个服务一直不重启、所有请求都落在同一个进程，历史照样每次清零。这段代码里 <code>thread_id</code> 完全没起作用，它指向的记忆永远是空的。</p>
        <p>这也说明一件事：<strong>「换成外部存储」不只是换个类名，还要保证同一份存储被复用。</strong></p>
      </Prose>

      <Prose label="三个常见误区">
        <h2>本地永远测不出这个失败。</h2>
        <Misconceptions
          items={[
            { claim: "本地测试没问题，线上应该也没问题", verdict: "测不出来", body: <p>本地进程一直在，线上不是。这个差异恰恰是内存存储唯一的失败方式。</p> },
            { claim: "用了数据库就等于安全了", verdict: "另一回事", body: <p>数据库解决「存不存得住」。凭 <code>thread_id</code> 就能取走别人的对话，这个洞在第 29 课之前一直开着。</p> },
            { claim: "SQLite 太简单，直接上 Postgres", verdict: "看有没有多实例", body: <p>单机服务用 SQLite 完全够，而且少一个要运维的组件。判断标准不是「看起来专不专业」。</p> },
          ]}
        />
      </Prose>

      <Prose className="after-lab" label="本课带走">
        <h2>三句话。</h2>
        <Takeaways title="第十五课带走" items={["内存存储一换进程就清空，本地测不出", "换存储只改一行，但要保证同一份被复用", "存得住不等于看得对"]} />
      </Prose>

      <section className="chapter-bridge">
        <span>NEXT</span><i />
        <span>单元三结束。下一课进入单元四：什么动作必须问人。</span>
      </section>
    </article>
  );
}
