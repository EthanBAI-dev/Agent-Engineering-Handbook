import { OrderLab } from "@/components/lab-kit";
import { Prose } from "@/components/auto-term";
import { AsciiFigure, Callout, CodeBlock, Misconceptions, Takeaways } from "@/components/article-kit";

const steps = [
  { id: "fetch", label: "浏览器 fetch(\"/api/agent\")", detail: "浏览器｜只发问题，不带密钥" },
  { id: "validate", label: "校验输入", detail: "服务端｜外部输入永远不可信" },
  { id: "restore", label: "恢复这个 thread 的 checkpoint", detail: "服务端｜第 03 课的 thread_id 在这里用上" },
  { id: "model", label: "model 节点调用真实模型", detail: "服务端｜密钥只在这一侧" },
  { id: "tools", label: "tools 节点执行真实函数", detail: "服务端｜跑的是你写的代码" },
  { id: "save", label: "保存新的 checkpoint", detail: "服务端｜下次同一个 thread 才接得上" },
  { id: "respond", label: "返回挑选过的 JSON", detail: "服务端｜只返回你主动挑选的字段" },
];
const correct = ["fetch", "validate", "restore", "model", "tools", "save", "respond"];
// 固定的乱序起点：不随机，保证每个人看到的题目一样
const shuffled = ["save", "model", "fetch", "respond", "tools", "validate", "restore"];

export function LessonEightArticle() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 08 · Agent API</p>
        <h1>建立 /api/agent，<br />让网页真正调用得到图。</h1>
        <p className="chapter-dek">难点不在「怎样调用图」，在 Python 跑在哪里，以及哪些东西不许返回给前端。</p>
        <div className="chapter-meta"><span>预计 9 分钟</span><span>设计稿</span><span>承接第 07 课</span></div>
      </header>

      <Prose label="只看一句话的话">
        <h2>浏览器发一个普通的 HTTP 请求，服务端跑图，再把结果作为普通 JSON 返回。</h2>
        <p>这中间没有魔法。要先承认一个现实：课程的图是 Python 写的，网站是 Next.js 写的，它们不是同一个运行时。</p>
        <p className="term-hint">带虚线的词都可以悬停、聚焦或点击查看解释。</p>
      </Prose>

      <Prose label="两种现实做法">
        <h2>课程按方案 B 推进。</h2>
        <AsciiFigure caption="方案 A 部署简单但受平台限制；方案 B 多一跳，但 Python 服务能自己选环境、自己扩容。">{`方案 A：同一个项目，两种运行时
  网页（Node.js）  →  /api/agent（Python 函数）  →  图

方案 B：两个服务
  网页（Node.js）  →  /api/agent（Node.js 转发）  →  独立 Python 服务  →  图`}</AsciiFigure>
        <p>选 B 是因为它更接近你以后真的要维护的形态，也避免把课程绑死在某个平台的限制上。</p>
      </Prose>

      <Prose label="接口契约：先定，再写">
        <h2>契约定不清楚，前后端会各写各的。</h2>
        <CodeBlock caption="响应">{`{
  "thread_id": "a",
  "reply": "北京今天晴，24 度。",
  "steps": ["model", "tools", "model"],
  "model_calls": 2
}`}</CodeBlock>
        <p><code>thread_id</code> 原样回传，前端才能确认这是刚才那段会话的回复；<code>steps</code> 给第 09 课的进度提示用；<code>model_calls</code> 给第 10 课的限额用。</p>
        <Callout tone="warn" title="最容易做错的是最后一步">
          不要把整个 State 直接返回给前端。里面可能有系统提示、工具的原始返回、内部字段。
          接口返回什么，必须是你主动挑选的，不是顺手全给——第 12 课的 <code>output_schema</code> 能把这条变成结构约束。
        </Callout>
      </Prose>

      <Prose className="lab-intro" label="现在自己排一次">
        <h2>七个步骤，谁先谁后，各在哪一侧。</h2>
        <p>每张卡片的副标题写着它发生在浏览器还是服务端。排的时候顺便记住那条边界：<strong>校验之后的每一步都在服务端</strong>。</p>
      </Prose>

      <OrderLab
        kicker="INTERACTIVE 08"
        title="把请求路径排回去"
        storageKey="agent-lab-lesson-8"
        items={steps}
        correct={correct}
        initialOrder={shuffled}
        passText="顺序对了。注意「校验输入」之后的每一步都在服务端，密钥和 State 都不越过那条线。"
        note="这一课没有可实跑的脚本，这是有意为之：接口一旦上线，就必须同时具备第 10 课的限额和第 28 课的输入校验，否则等于把模型额度开放给互联网。"
        code={{
          summary: "展开服务端要做的四件事",
          text: `# 伪代码：说明顺序，不是可直接运行的完整服务
def handle(request):
    body = parse_json(request)                   # 1. 取出输入
    if not valid(body):                          # 2. 校验
        return error(400, "message 不能为空")
    config = {"configurable": {"thread_id": body["thread_id"]}}
    result = app.invoke(                         # 3. 跑图
        {"messages": [("user", body["message"])]}, config
    )
    return json({                                # 4. 只返回该返回的
        "thread_id": body["thread_id"],
        "reply": result["messages"][-1].content,
    })`,
        }}
      />

      <Prose className="after-lab" label="三个必须提前想清楚的问题">
        <h2>超时、冷启动、进程不连续。</h2>
        <p><strong>超时</strong>：无服务器平台对单次请求有时间上限，一个会调用多轮工具的 Agent 很容易撞上。解决方向是第 09 课的流式返回，或者改成「先返回任务 id，再轮询」。</p>
        <p><strong>冷启动</strong>：一段时间没人访问，下一次请求要先启动进程，第一个用户会等得更久。</p>
        <p><strong>进程不连续</strong>：这一点直接推翻第 03 课的结论——<code>InMemorySaver</code> 把快照放在进程内存里，而线上两次请求不保证落在同一个进程。上线的那一刻，会话记忆必须换成外部存储，那是第 15 课。</p>
      </Prose>

      <Prose label="本课挑战：找出这个响应的三个问题">
        <h2>它把不该给的全给了。</h2>
        <CodeBlock>{`{
  "state": {
    "messages": [
      {"role": "system", "content": "你是一个内部客服，可以查询订单表 orders"},
      {"role": "tool", "content": "SELECT * FROM orders WHERE id=1024 → 已发货"},
      {"role": "assistant", "content": "您的订单已发货。"}
    ]
  },
  "api_key_used": "sk-ant-abc123",
  "thread_id": "a"
}`}</CodeBlock>
        <p>一是返回了整个 State，把系统提示和内部表名暴露给前端；二是返回了工具的原始输出，里面有 SQL 和内部数据结构；三是返回了 API Key——这一条足以让密钥彻底作废。</p>
        <p>正确的响应只需要 <code>thread_id</code> 和 <code>reply</code>，加上你确实要显示的进度字段。</p>
      </Prose>

      <Prose label="三个常见误区">
        <h2>能跑通只证明顺路径没问题。</h2>
        <Misconceptions
          items={[
            { claim: "前端直接调用模型服务商的接口更简单", verdict: "也更贵", body: <p>简单，也等于把密钥发给每个访问者。第 07 课已经算过这笔账。</p> },
            { claim: "接口能跑通就算完成", verdict: "还差四样", body: <p>输入校验、调用上限、超时处理、错误响应格式。缺一样，第一个异常请求就会暴露它。</p> },
            { claim: "会话记忆已经在第 03 课解决了", verdict: "只解决了一半", body: <p>第 03 课解决的是「同一个进程里」。线上进程不连续，<code>InMemorySaver</code> 会让用户随机失忆。</p> },
          ]}
        />
      </Prose>

      <Prose className="after-lab" label="本课带走">
        <h2>三句话。</h2>
        <Takeaways title="第八课带走" items={["密钥和校验都在服务端", "契约先定再写，只返回挑选过的字段", "上线会打破「同一个进程」的假设"]} />
      </Prose>

      <section className="chapter-bridge">
        <span>NEXT</span><i />
        <span>接口能返回结果了，但用户要盯着转圈等十几秒。下一课让每一步都看得见。</span>
      </section>
    </article>
  );
}
