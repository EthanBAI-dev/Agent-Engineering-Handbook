"use client";

import { ScenarioLab, type ScenarioState } from "@/components/lab-kit";
import { Prose } from "@/components/auto-term";
import { Callout, CodeBlock, Misconceptions, RunLocally, Takeaways } from "@/components/article-kit";

/** 行为对齐 29_identity.py 实跑：alice 拥有 t_alice，bob 拥有 t_bob，越权与不存在返回同一句话。 */
type Entry = { id: string; label: string; verb: string; api: string; main: boolean; damage: string };

const ENTRIES: Record<string, Entry> = {
  read: { id: "read", label: "读历史", verb: "读取 t_alice 的全部消息", api: "app.get_state(config)", main: true, damage: "读到「我的身份证号是 1234」" },
  send: { id: "send", label: "发消息", verb: "往 t_alice 追加一条消息", api: "app.invoke(msg, config)", main: true, damage: "在别人的会话里插话，还把上下文污染了" },
  resume: { id: "resume", label: "批准中断", verb: "恢复 t_alice 上暂停的那次执行", api: "app.invoke(Command(resume=True), config)", main: false, damage: "替 alice 批准了她那条待审批的删除操作（第 16 课）" },
  travel: { id: "travel", label: "回到旧快照", verb: "取 t_alice 的历史快照并从中间重跑", api: "app.get_state_history(config)", main: false, damage: "读到 alice 已经撤销的那一版内容（第 18 课）" },
};

function compute(s: ScenarioState) {
  const who = String(s.who);
  const e = ENTRIES[String(s.entry)];
  const check = String(s.check);
  const uniform = Boolean(s.uniform);

  const guarded = check === "all" || (check === "main" && e.main);
  const isOwner = who === "alice";

  const denyText = uniform ? "找不到这个会话" : "403 无权访问这个会话";
  const missingText = uniform ? "找不到这个会话" : "404 会话不存在";

  let result: string;
  let tone: "good" | "bad" | "muted";
  if (isOwner) {
    result = `允许：${e.verb}`;
    tone = "good";
  } else if (guarded) {
    result = `拒绝：${denyText}`;
    tone = "good";
  } else {
    result = `越权成功：${e.damage}`;
    tone = "bad";
  }

  const enumerable = !uniform;
  const passed = who === "bob" && check === "all" && uniform && !e.main;

  let verdict: string;
  if (passed) {
    verdict = `连「${e.label}」也挡住了，而且两种失败回同一句话。这两个次要入口最常被漏掉——漏掉的代价是：${e.damage}。`;
  } else if (who === "alice") {
    verdict = "本人访问当然是通的。切到 bob 才看得见缺口。";
  } else if (check === "none") {
    verdict = "换个参数就读到了别人的数据。这不是「攻击」，只是换了个参数——而 thread_id 常常出现在 URL 里、日志里、分享链接里。";
  } else if (check === "main" && e.main) {
    verdict = "主入口大家都会检查。切到「批准中断」或「回到旧快照」看看——它们同样按 thread_id 取数据。";
  } else if (check === "main" && !e.main) {
    verdict = "这就是漏掉的那类入口。它也带 thread_id，也要问一次「谁在问」。";
  } else if (!uniform) {
    verdict = "都挡住了，但两种拒绝说的不是同一句话——攻击者靠这个差别就能枚举出哪些 thread_id 是真的。";
  } else {
    verdict = "目标：让 bob 在「批准中断」或「回到旧快照」这类次要入口上也被挡住，且两种失败回同一句话。";
  }

  return {
    rows: [
      { label: "谁在请求", value: `${who}（来自服务端已验证的会话）`, tone: "muted" as const },
      { label: "做什么", value: `${e.label} · ${e.api}`, tone: "normal" as const },
      { label: "目标会话", value: "t_alice（归属表记录：owner = alice）", tone: "muted" as const },
      { label: "这个入口有没有归属检查", value: guarded ? "有" : "没有", tone: (guarded ? "good" : "bad") as "good" | "bad" },
      { label: "结果", value: result, tone },
      { label: "请求一个不存在的会话时", value: missingText, tone: "muted" as const },
      { label: "能否靠回答差别枚举 thread_id", value: enumerable ? "能——两种失败说的不是同一句话" : "不能", tone: (enumerable ? "bad" : "good") as "bad" | "good" },
    ],
    lines: [
      {
        text: tone === "bad"
          ? "数据库里躺着所有用户的对话，而取用它们只需要一个编号。thread_id 是编号，不是身份——这道缺口只能由服务端补上。"
          : isOwner
            ? "归属表在服务端，不来自请求。它记的是「这个 thread 属于谁」，和客户端传了什么无关。"
            : "拒绝是对的。注意检查要写成 if owner is None or owner != current_user——先挡住空值，再比较，否则第 12 课那个静默丢弃会让 None 一路放行。",
        tone: (tone === "bad" ? "bad" : "good") as "bad" | "good",
      },
    ],
    verdict: { text: verdict, passed },
  };
}

export function LessonTwentyNineArticle() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 29 · 账号与隔离</p>
        <h1>thread_id<br />不是身份验证。</h1>
        <p className="chapter-dek">这句话从第 03 课起说了五次。这一课把它兑现。</p>
        <div className="chapter-meta"><span>预计 9 分钟</span><span>无需 API</span><span>承接第 15、17、18 课</span></div>
      </header>

      <Prose label="只看一句话的话">
        <h2>数据库里躺着所有用户的对话，而取用它们只需要一个编号。</h2>
        <p>第 15 课把会话搬进了数据库。两个用户各说了一句话，然后 bob 请求 <code>t_alice</code>：</p>
        <CodeBlock>{`alice 在 t_alice：我的身份证号是 1234
bob   在 t_bob  ：我的银行卡尾号是 5678

bob 请求 t_alice → 拿到 2 条消息
第一条：我的身份证号是 1234`}</CodeBlock>
        <p><strong>这不是「攻击」，只是换了个参数。</strong>而 <code>thread_id</code> 常常出现在 URL 里、前端代码里、分享出去的链接里。</p>
        <p className="term-hint">带虚线的词都可以悬停、聚焦或点击查看解释。</p>
      </Prose>

      <Prose label="补上归属检查">
        <h2>归属表在服务端，不来自请求。</h2>
        <CodeBlock>{`OWNERSHIP: dict[str, str] = {}      # 服务端的表，不来自请求

def safe_read(app, thread_id: str, current_user: str):
    owner = OWNERSHIP.get(thread_id)
    if owner is None or owner != current_user:
        raise PermissionError("找不到这个会话")
    ...

alice  请求 t_alice          → 允许，2 条消息
bob    请求 t_alice          → 拒绝：找不到这个会话
bob    请求 t_bob            → 允许，2 条消息
bob    请求 t_nonexistent    → 拒绝：找不到这个会话`}</CodeBlock>
        <p>注意那个 <code>owner is None or</code>：<strong>先挡住空值，再比较。</strong>第 12 课那个静默丢弃在这里会要命——以为传了 <code>user_id</code>，其实字段名不在 schema 里，权限判断拿到 <code>None</code>，写成「owner != user 才拒绝」就一路放行了。</p>
      </Prose>

      <Prose label="为什么后两行是同一句话">
        <h2>回答的差别本身就是信息。</h2>
        <CodeBlock>{`t_alice   → 「无权访问」   ← 等于确认了这个 thread 存在
t_xxxxxx  → 「不存在」`}</CodeBlock>
        <p>攻击者可以靠这个差别<strong>枚举</strong>出哪些 <code>thread_id</code> 是真的，进而知道这个系统有多少用户、谁在什么时候用过。两种情况回同一句「找不到这个会话」，就不泄漏这个信息。</p>
      </Prose>

      <Prose label="当前用户从哪里来">
        <h2>这是最容易做错的一步。</h2>
        <CodeBlock>{`✗ 请求体里的 user_id      —— 客户端可以随便填
✗ URL 参数里的 user_id    —— 同上
✓ 服务端验证过的会话或令牌 —— 客户端改不了`}</CodeBlock>
        <p>把 <code>user_id</code> 当成一个普通参数接收，等于让每个人自称是任何人。</p>
        <Callout tone="warn" title="归属表不能放进 State">
          放进 State 的东西，第 17 课的 <code>update_state</code> 就能改。审批界面上多一个字段，就成了越权的入口——而那个界面本来是用来提升安全性的。
          <strong>谁拥有什么，只能由服务端单独保管。</strong>
        </Callout>
      </Prose>

      <Prose className="lab-intro" label="用两个账号试一次">
        <h2>四个入口，两个最常被漏掉。</h2>
        <p>先用 alice 走一遍（都通），再切到 bob。主入口你一定会检查；难的是后面两个——它们同样按 <code>thread_id</code> 取数据。</p>
      </Prose>

      <ScenarioLab
        kicker="INTERACTIVE 29"
        title="把四个入口都堵上"
        storageKey="agent-lab-lesson-29"
        rowsLabel="这一次请求发生了什么"
        controls={[
          { kind: "segmented", id: "who", label: "谁在请求", initial: "alice", options: [{ id: "alice", label: "alice（本人）" }, { id: "bob", label: "bob（他人）" }] },
          {
            kind: "segmented", id: "entry", label: "从哪个入口", initial: "read",
            options: [{ id: "read", label: "读历史" }, { id: "send", label: "发消息" }, { id: "resume", label: "批准中断" }, { id: "travel", label: "回到旧快照" }],
          },
          {
            kind: "segmented", id: "check", label: "归属检查覆盖到哪", initial: "none",
            options: [{ id: "none", label: "不检查" }, { id: "main", label: "只查主入口" }, { id: "all", label: "全部入口" }],
          },
          { kind: "switch", id: "uniform", label: "无权与不存在回同一句话", note: "都回「找不到这个会话」", initial: false },
        ]}
        compute={compute}
        note="越权读取与加上归属检查后的拒绝行为均已在 langgraph 1.2.11 + SqliteSaver 实跑验证；示例数据对齐 29_identity.py。"
        code={{
          summary: "展开四个入口各自的检查点",
          text: `# 判断方法很简单：代码里所有出现 thread_id 的地方，都要问一次「谁在问」。

读历史      app.get_state(config)                     ← 大家都会查
发消息      app.invoke(msg, config)                   ← 大家都会查
批准中断    app.invoke(Command(resume=...), config)   ← 常漏（第 16、17 课）
回到旧快照  app.get_state_history(config)             ← 常漏（第 18 课）
导出/分享/调试面板                                    ← 后加的，最常漏

def require_owner(thread_id: str, current_user: str) -> None:
    owner = OWNERSHIP.get(thread_id)
    if owner is None or owner != current_user:
        raise PermissionError("找不到这个会话")   # 两种失败，同一句话`,
        }}
      />

      <Prose className="after-lab" label="长期记忆也要隔离">
        <h2>命名空间里必须带 user_id。</h2>
        <CodeBlock>{`def memory_ns(user_id: str) -> tuple[str, ...]:
    return ("users", user_id, "memories")`}</CodeBlock>
        <p>这不只是为了隔离，也是为了<strong>删除</strong>——用户要求删除数据时，删掉一个前缀就够了。混在一起存，你永远说不清删干净了没有。第 30 课会用到这一行。</p>
      </Prose>

      <RunLocally file="lab/langgraph/examples/29_identity.py" command="uv run python examples/29_identity.py">
        <strong>不需要 API Key</strong>。它用真实的 SQLite checkpointer 存两个用户的对话，然后分别用两种读法访问。
      </RunLocally>

      <Prose label="本课挑战：这段检查为什么形同虚设">
        <h2>两个都由客户端提供的值，核对了也没用。</h2>
        <CodeBlock>{`def handle(request):
    user_id = request.json.get("user_id")
    thread_id = request.json.get("thread_id")
    if OWNERSHIP.get(thread_id) != user_id:
        return error(403)
    return read_thread(thread_id)`}</CodeBlock>
        <p>任何人都能把 <code>user_id</code> 填成 <code>&quot;alice&quot;</code>，检查就通过了。这段代码看起来在做权限判断，实际上只是在核对两个都由客户端提供的值。<strong>当前用户必须从服务端验证过的会话里取。</strong></p>
      </Prose>

      <Prose label="三个常见误区">
        <h2>不可预测不是访问控制。</h2>
        <Misconceptions
          items={[
            { claim: "thread_id 是 UUID，猜不到", verdict: "猜不到≠拿不到", body: <p>它会出现在 URL、浏览器历史、日志、分享链接、客服截图里。<strong>不可预测不是访问控制。</strong></p> },
            { claim: "前端已经只显示自己的会话了", verdict: "接口是公开的", body: <p>前端只是界面。绕过界面直接请求接口，一行命令的事。</p> },
            { claim: "小项目还没有账号，先不做隔离", verdict: "那就别公开暴露", body: <p>没有隔离的多用户系统，第一个发现的人就能读所有人的数据。</p> },
          ]}
        />
      </Prose>

      <Prose className="after-lab" label="本课带走">
        <h2>三句话。</h2>
        <Takeaways title="第二十九课带走" items={["当前用户从服务端会话取，永远不从请求参数取", "无权和不存在返回同一句话，否则等于确认了数据存在", "所有出现 thread_id 的地方都要问「谁在问」，包括恢复和时间旅行"]} />
      </Prose>

      <section className="chapter-bridge">
        <span>NEXT</span><i />
        <span>会话隔开了。最后一课把记忆从「这段对话」升到「这个人」，然后交付毕业项目。</span>
      </section>
    </article>
  );
}
