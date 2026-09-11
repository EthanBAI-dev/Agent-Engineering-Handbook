import { ClassifyLab } from "@/components/lab-kit";
import { Prose } from "@/components/auto-term";
import { Callout, CodeBlock, Misconceptions, RunLocally, Takeaways } from "@/components/article-kit";

const items = [
  { id: "read_file", label: "read_file", detail: "读一个文件的内容", correct: "auto", why: "只读，可逆，范围可控——这类动作全部自动跑，审批才稀缺得起来。" },
  { id: "list_dir", label: "list_dir", detail: "列出目录里有什么", correct: "auto", why: "同上。如果连列目录都要确认，人会在第五次弹窗后开始乱点。" },
  { id: "move_file", label: "move_file", detail: "把文件挪到另一个目录", correct: "approve", why: "有外部可见的副作用，虽然可撤销，但撤销要人动手。" },
  { id: "delete_file", label: "delete_file", detail: "删除一个文件", correct: "approve", why: "副作用难撤销。这是审批级最典型的动作。" },
  { id: "send_email", label: "send_email", detail: "给客户群发通知", correct: "approve", why: "一旦发出无法收回。频繁不等于安全——用频率决定级别是最常见的错误。" },
  { id: "drop_table", label: "drop_table", detail: "删除数据库表", correct: "forbid", why: "后果不可接受。不要给人一个「点一下就能做」的机会。" },
  { id: "transfer_money", label: "transfer_money", detail: "未登记在风险表里的工具", correct: "forbid", why: "查不到的工具按最严格处理。新增工具时忘记登记是必然会发生的事。" },
  { id: "scan", label: "scan", detail: "扫描目录，找出超过 90 天的文件", correct: "auto", why: "只读。它是后面所有决策的输入，挡在审批后面只会拖慢一切。" },
];

export function LessonSixteenArticle() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 16 · 审批策略</p>
        <h1>什么动作必须问人，<br />什么动作根本不该给。</h1>
        <p className="chapter-dek">审批是一种稀缺资源：它值钱，是因为它少。</p>
        <div className="chapter-meta"><span>预计 8 分钟</span><span>无需 API</span><span>单元四开始</span></div>
      </header>

      <Prose label="只看一句话的话">
        <h2>三档，不是两档。</h2>
        <p>能自动跑的自动跑，危险的才问，绝不该做的直接不给。第 04 课让图在删除前停下来；这一课要解决的是：十几个工具，该在哪几个上停。</p>
        <p className="term-hint">带虚线的词都可以悬停、聚焦或点击查看解释。</p>
      </Prose>

      <Prose label="审批太多，等于没有审批">
        <h2>人会在第五次弹窗之后开始闭眼点同意。</h2>
        <p>这不是用户素质问题，是设计问题。一旦审批变成流水线上的例行动作，它就只剩下「出事后可以说用户同意过」的免责功能，不再提供任何保护。</p>
        <p>所以设计审批策略的第一步，不是列出哪些要问，而是<strong>尽可能多地划进「不用问」</strong>。</p>
        <CodeBlock caption="分级依据是后果，不是感觉">{`auto      没有副作用，或副作用完全可逆    读文件、查数据库、算数
approve   有外部可见的副作用，撤销代价高  删除、发邮件、扣款、改配置
forbid    后果不可接受，或不该由 Agent 决定  删库、改权限、转账`}</CodeBlock>
        <Callout tone="warn" title="forbid 那一档最容易被忽略">
          很多人把所有危险动作都放进 <code>approve</code>，觉得「反正有人把关」。
          但有些事的正确答案是<strong>根本不提供这个工具</strong>——人在疲劳时点错一次的代价，可能是不可逆的。
          而且 forbid 级<strong>不询问</strong>：给用户一个不该存在的按钮，就是在等它被按下。
        </Callout>
      </Prose>

      <Prose label="默认拒绝">
        <h2>这一行是本课最重要的一行。</h2>
        <CodeBlock>{`return {"decision": POLICY.get(state["tool"], "forbid")}`}</CodeBlock>
        <p>查不到的工具，按 <code>forbid</code> 处理。如果默认值写成 <code>auto</code> 或 <code>approve</code>，那么每当有人新增一个工具却忘了登记，它就会自动获得权限。<strong>新增工具时忘记登记是必然会发生的事</strong>，所以默认值必须站在安全那一边。</p>
        <p>还有一点：这张表写在代码里，不写在提示词里。第 06 课那条边界在这里再次成立——提示词是建议，代码是约束。一份写在系统提示里的「危险操作请先询问用户」，在长对话里失效是常态。</p>
      </Prose>

      <Prose className="lab-intro" label="自己分一次级">
        <h2>八个工具，三个档位。</h2>
        <p>这道题没有满分答案，只有可辩护的取舍——这正是本课要练的判断。注意最后两个：一个是未登记的工具，一个是很容易被误判成「需要审批」的只读操作。</p>
      </Prose>

      <ClassifyLab
        kicker="INTERACTIVE 16"
        title="给八个工具分级"
        storageKey="agent-lab-lesson-16"
        options={[{ id: "auto", label: "auto 自动" }, { id: "approve", label: "approve 审批" }, { id: "forbid", label: "forbid 禁止" }]}
        items={items}
        passText="八个全对。破坏性操作全部被拦截，同时审批只出现在三个动作上——审批稀缺，它才有效。"
        note="风险表是代码，不是提示词。模型改不了它，未登记的工具按 forbid 处理。"
        code={{
          summary: "展开审批提示该怎么写",
          text: `answer = interrupt({
    "question": f"允许执行 {state['tool']}({state['args']}) 吗？",
    "risk": "有副作用，可能无法撤销",
})

# 一个合格的审批提示至少要说清三件事：做什么、对谁做、做了之后能不能撤销。
# 「Agent 想执行一个操作，是否允许？」等于没问——人没有判断依据，只能凭心情点。`,
        }}
      />

      <RunLocally file="lab/langgraph/examples/16_approval_policy.py" command="uv run python examples/16_approval_policy.py">
        <strong>不需要 API Key</strong>。建议改一处再跑：把 <code>{`POLICY.get(state["tool"], "forbid")`}</code> 的默认值改成 <code>{`"auto"`}</code>，再运行最后那个未登记的 <code>transfer_money</code>——它会被直接执行，这就是「默认放行」的代价。
      </RunLocally>

      <Prose label="三个常见误区">
        <h2>「都交给人审批最安全」恰恰相反。</h2>
        <Misconceptions
          items={[
            { claim: "都交给人审批最安全", verdict: "保护为零", body: <p>审批太多会导致闭眼同意，还额外拖慢每一次运行。安全来自「危险动作少而明确」，不是弹窗多。</p> },
            { claim: "在提示词里写清楚就行", verdict: "会失效", body: <p>第 06 课验证过：提示词影响倾向，代码构成约束。风险表放代码里。</p> },
            { claim: "forbid 的工具也弹个窗，让用户自己决定", verdict: "在等它被按下", body: <p>给用户一个不该存在的按钮，就是在等它被按下。真正不该做的事，从工具清单里拿掉。</p> },
          ]}
        />
      </Prose>

      <Prose className="after-lab" label="本课带走">
        <h2>三句话。</h2>
        <Takeaways title="第十六课带走" items={["三档而不是两档，forbid 不能省", "未登记的工具默认按 forbid 处理", "审批提示要说清做什么、对谁做、能不能撤销"]} />
      </Prose>

      <section className="chapter-bridge">
        <span>NEXT</span><i />
        <span>现在人只能同意或拒绝。但真实反应往往是第三种：方向对，参数不对。</span>
      </section>
    </article>
  );
}
