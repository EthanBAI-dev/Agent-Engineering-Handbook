"use client";

import { ScenarioLab, type ScenarioState } from "@/components/lab-kit";
import { Prose } from "@/components/auto-term";
import { Callout, CodeBlock, Misconceptions, RunLocally, Takeaways } from "@/components/article-kit";

function compute(s: ScenarioState) {
  const fails = Number(s.fails);
  const limit = Number(s.limit);
  const idem = Boolean(s.idem);
  const exhausted = fails >= limit;
  const attempts = exhausted ? limit : fails + 1;
  const ledger = idem ? 1 : attempts;
  return {
    rows: [
      { label: "节点被调用", value: `${attempts} 次 / 上限 ${limit} 次`, tone: "normal" as const },
      { label: "账本里的记录", value: `${ledger} 笔`, tone: (ledger > 1 ? "bad" : "good") as "bad" | "good" },
      { label: "这次的结局", value: exhausted ? "抛出异常，需要一条失败路径" : "成功", tone: (exhausted ? "bad" : "good") as "bad" | "good" },
    ],
    lines: exhausted
      ? [{ text: "重试次数用完，异常照样抛出来。外部服务可能宕机十分钟，你的重试全落在这十分钟里——失败路径是必须品，不是可选项。", tone: "bad" as const }]
      : ledger > 1
        ? [{ text: `失败点在「已扣款、还没收到回执」之间。图报告成功，用户被扣了 ${ledger} 次。失败的是回执，不是扣款——重试机制无法区分这两种情况。`, tone: "bad" as const }]
        : [{ text: "同一个业务 key 只生效一次。第二次进来时它发现这笔已经处理过，直接返回上次的结果。", tone: "good" as const }],
    verdict: {
      text: idem && fails > 0 && !exhausted
        ? "对了。节点跑了多次，钱只扣了一次。"
        : exhausted
          ? "调大重试次数不能解决这个——外部服务可能宕机很久。想想失败路径。"
          : "把失败次数调到 1 以上，看没有幂等键时账本变成什么样。",
      passed: idem && fails > 0 && !exhausted,
    },
  };
}

export function LessonNineteenArticle() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 19 · 错误恢复</p>
        <h1>重试很容易，<br />重试不重复扣款才难。</h1>
        <p className="chapter-dek">网络会抖，外部服务会返回 503。加重试是一行配置的事，难的是后面那一半。</p>
        <div className="chapter-meta"><span>预计 9 分钟</span><span>无需 API</span><span>承接第 18 课</span></div>
      </header>

      <Prose label="只看一句话的话">
        <h2>重试之前先问一句：这一步做第二次，外面看得见吗？</h2>
        <p>看得见，就需要一个幂等键——通常是订单号、请求 id 这类业务上唯一的东西。</p>
        <p className="term-hint">带虚线的词都可以悬停、聚焦或点击查看解释。</p>
      </Prose>

      <Prose label="加重试确实只要一行">
        <h2>但它挡不住副作用重复发生。</h2>
        <CodeBlock>{`graph.add_node("call_service", flaky,
    retry_policy=RetryPolicy(max_attempts=3, initial_interval=0.01, backoff_factor=1.0))`}</CodeBlock>
        <p><code>backoff_factor</code> 是每次重试之间等待时间的放大倍数。真实项目里要设成大于 1，让重试逐渐拉开间隔，避免在服务已经过载时继续猛打。</p>
      </Prose>

      <Prose className="lab-intro" label="自己调一次">
        <h2>失败次数、重试上限、幂等键。</h2>
        <p>失败点设在「扣款成功了，但回执没收到」——这是外部调用最常见的失败方式。先关掉幂等键，把失败次数调到 2 看看账本。</p>
      </Prose>

      <ScenarioLab
        kicker="INTERACTIVE 19"
        title="让重试变安全"
        storageKey="agent-lab-lesson-19"
        controls={[
          { kind: "slider", id: "fails", label: "外部服务失败次数", min: 0, max: 5, initial: 0, format: (v) => `${v} 次` },
          { kind: "slider", id: "limit", label: "重试上限", min: 1, max: 5, initial: 3, format: (v) => `${v} 次` },
          { kind: "switch", id: "idem", label: "幂等键", note: "key 用订单号，同一笔只生效一次", initial: false },
        ]}
        compute={compute}
        rowsLabel="这次调用的结果"
        note="数字对齐 19_retry_idempotency.py 的实跑：无幂等键、失败两次时账本出现三笔；加上幂等键后节点跑两次、账本只有一笔。"
        code={{
          summary: "展开幂等键的写法",
          text: `def charge_safe(state: State) -> dict:
    key = state["order_id"]          # 幂等键：同一笔业务永远同一个 key
    if key in safe_ledger:
        return {"status": "已存在，直接返回上次结果"}
    safe_ledger[key] = "charged"
    ...

# key 必须来自业务标识。用 uuid4() 或时间戳当 key，
# 每次重试都是一个新 key，等于没做。`,
        }}
      />

      <Prose className="after-lab" label="判断一个节点能不能安全重试">
        <h2>看它做第二次外面有没有反应。</h2>
        <CodeBlock>{`读文件、查数据库、算数    可以直接重试    没有副作用，跑一百次结果一样
写文件到固定路径          可以直接重试    覆盖写本身就是幂等的
扣款、发邮件、发消息      必须先加幂等键  重试等于再做一次，用户能看见
追加一行日志              看情况          重复的日志无害，但会干扰统计`}</CodeBlock>
        <p>注意第二行和第四行的对比：同样是写，<strong>覆盖写天然幂等，追加写不是</strong>。这条区别在设计工具时很有用——能用覆盖表达的操作，就别设计成追加。</p>
        <Callout title="把节点拆小，缩短危险区间">
          把「扣款 + 更新订单状态 + 发通知」拆成三个节点，重试的粒度更细，
          而且 checkpointer 会在每个节点之后存一次——失败时能从最近的那一步恢复，不用把前面已经成功的部分重做。
          这也呼应第 01 课那句「把节点写小」：当时的理由是好调试，现在多了一个是<strong>好恢复</strong>。
        </Callout>
      </Prose>

      <RunLocally file="lab/langgraph/examples/19_retry_idempotency.py" command="uv run python examples/19_retry_idempotency.py">
        <strong>不需要 API Key</strong>。建议把幂等键从 <code>state[&quot;order_id&quot;]</code> 改成 <code>uuid.uuid4().hex</code> 再跑一次——账本会重新变成 3 笔，直观说明「随机 key 等于没有 key」。
      </RunLocally>

      <Prose label="本课挑战：这个幂等键为什么无效">
        <h2>key 里含有当前时间。</h2>
        <CodeBlock>{`key = f"{state['to']}_{datetime.now().isoformat()}"`}</CodeBlock>
        <p>每次重试都是一个新的时间戳，因此永远命中不了「已发送过」那个分支，邮件会照发不误。</p>
        <p>幂等键必须由<strong>业务标识</strong>构成：收件人 + 这封邮件对应的业务 id，而不是「什么时候发的」。<strong>「唯一」不是要求，「同一笔业务永远相同」才是。</strong></p>
      </Prose>

      <Prose label="三个常见误区">
        <h2>加了重试不等于更可靠。</h2>
        <Misconceptions
          items={[
            { claim: "加了重试就更可靠了", verdict: "对有副作用的节点相反", body: <p>重试把「一次失败」放大成了「多次执行」——实跑里三笔扣款就是这么来的。</p> },
            { claim: "幂等键随便生成一个唯一值就行", verdict: "唯一不是要求", body: <p>随机值和时间戳都满足唯一，但都无效。要求是「同一笔业务永远相同」。</p> },
            { claim: "重试次数调大就不用管失败路径了", verdict: "总会用完", body: <p>外部服务可能宕机很久。失败路径是必须存在的，不是可选项。</p> },
          ]}
        />
      </Prose>

      <Prose className="after-lab" label="本课带走">
        <h2>三句话。</h2>
        <Takeaways title="第十九课带走" items={["先问「做第二次外面看得见吗」", "幂等键要来自业务标识", "重试次数总会用完，失败路径是必须品"]} />
      </Prose>

      <section className="chapter-bridge">
        <span>NEXT</span><i />
        <span>单元四的部件齐了。下一课把它们装成一个东西，并用五条验收路径证明它可信。</span>
      </section>
    </article>
  );
}
