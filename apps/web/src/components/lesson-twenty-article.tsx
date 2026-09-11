import { ClassifyLab } from "@/components/lab-kit";
import { Prose } from "@/components/auto-term";
import { AsciiFigure, Callout, CodeBlock, Misconceptions, RunLocally, Takeaways } from "@/components/article-kit";

const items = [
  { id: "readonly", label: "只读操作不打扰人", detail: "scan 是 auto 级，直接执行，没有弹窗", correct: "usability", why: "如果扫描也要审批，人会在真正危险的操作到来之前就失去耐心——审批就废了。" },
  { id: "once", label: "批准后执行，且只执行一次", detail: "重复提交同一个 op_id 被跳过", correct: "duplicate", why: "用户点了两下按钮，或者网络重发了一次请求。没有幂等键的话，文件会被删两次。" },
  { id: "reject", label: "拒绝后不产生任何副作用", detail: "断言磁盘没有变化", correct: "halfdone", why: "拒绝路径最容易出的 bug 是「已经做了一半」——先备份、先改状态、先发通知。" },
  { id: "retry", label: "中途失败，重试后恢复且不重复", detail: "副作用那一步失败两次才成功，台账只有一条", correct: "sideeffect", why: "重试次数和最终记录数的关系，是判断幂等有没有做对的唯一硬指标。" },
  { id: "forbid", label: "禁止级操作，连问都不问", detail: "format_disk 不在允许清单内", correct: "unregistered", why: "未登记的工具按 forbid 处理。新增工具时忘记登记是必然会发生的事。" },
];

export function LessonTwentyArticle() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 20 · 可信 Agent 项目</p>
        <h1>五条验收路径，<br />证明它不会做错事。</h1>
        <p className="chapter-dek">这一课不引入任何新 API，只把前面的部件按正确顺序装起来，然后证明它可信。</p>
        <div className="chapter-meta"><span>预计 10 分钟</span><span>无需 API</span><span>单元四收尾</span></div>
      </header>

      <Prose label="只看一句话的话">
        <h2>「可信」不是感觉，是每条理由都有一次实跑作证。</h2>
        <p>验收标准不是「能跑」——跑通的通常只有批准路径。拒绝路径和失败路径才是事故的来源，而它们不会在正常使用中自己暴露。</p>
        <p className="term-hint">带虚线的词都可以悬停、聚焦或点击查看解释。</p>
      </Prose>

      <Prose label="装配清单">
        <h2>顺序不能换。</h2>
        <AsciiFigure caption="分级在最前，幂等在最后，checkpointer 贯穿全程。">{`风险分级（16）  →  人工审批与改参数（17）  →  幂等副作用（19）
        全程 checkpointer（03 / 15），调用有上限（10）`}</AsciiFigure>
        <p>分级在最前面，否则禁止级操作也会走到审批那一步；幂等在最后面，因为它保护的是真正产生副作用的那一步；checkpointer 贯穿全程，否则暂停和恢复都不成立。</p>
      </Prose>

      <Prose className="lab-intro" label="每条验收挡住什么">
        <h2>写下来，才知道少了哪条。</h2>
        <p>下面是五条验收路径。给每一条选出它能挡住的那一类线上事故——想不出来的那条，通常就是可以删掉的那条。</p>
      </Prose>

      <ClassifyLab
        kicker="INTERACTIVE 20"
        title="每条验收挡住哪一类事故"
        storageKey="agent-lab-lesson-20"
        options={[
          { id: "usability", label: "审批疲劳" },
          { id: "duplicate", label: "重复提交" },
          { id: "halfdone", label: "做了一半" },
          { id: "sideeffect", label: "重试重复副作用" },
          { id: "unregistered", label: "未登记的工具" },
        ]}
        items={items}
        passText="五条都对上了。只测批准路径的验收清单，挡不住其中四类。"
        note="五条路径全部在 20_trusted_agent.py 上实跑通过，包括拒绝路径对外部世界的断言。"
        code={{
          summary: "展开验收记录该长什么样",
          text: `输入      ：固定的、可重复的
操作      ：包括人的回答
预期结果  ：状态里该有什么
外部断言  ：外部世界有没有发生变化

第四栏最常被漏掉，也最重要。
只检查返回值的验收，挡不住「说了没做」和「说没做却做了」。`,
        }}
      />

      <Prose className="after-lab" label="这张图为什么可信">
        <h2>四条理由，每条对应一次实跑。</h2>
        <CodeBlock>{`1. 风险表是代码，模型改不了它，未登记的操作按 forbid 处理
2. 危险操作前必然经过审批，拒绝路径不碰任何副作用
3. 副作用那一步有幂等键，重试和重复提交都只生效一次
4. 全程有 checkpointer，失败可以从原地恢复，而不是从头再来`}</CodeBlock>
        <Callout tone="warn" title="它仍然是教学版">
          台账在内存里（第 15 课换外部存储）、没有账号谁都能审批（第 29 课）、
          工具参数没有校验（第 28 课）、没有记录谁批准了什么（第 27 课）。
          <strong>知道自己缺什么的系统，比自以为完整的系统安全得多。</strong>
        </Callout>
      </Prose>

      <RunLocally file="lab/langgraph/examples/20_trusted_agent.py" command="uv run python examples/20_trusted_agent.py">
        <strong>不需要 API Key</strong>。建议做两个破坏性实验：把 <code>apply</code> 里的幂等检查删掉，重跑验收 2 和 4；再把 <code>ask</code> 节点从图里去掉，看验收 3 怎样失败。<strong>亲手把它弄坏一次，比读五遍说明更能记住这些部件为什么在那里。</strong>
      </RunLocally>

      <Prose label="三个常见误区">
        <h2>「跑通了就是完成了」跑通的只有批准路径。</h2>
        <Misconceptions
          items={[
            { claim: "跑通了就是完成了", verdict: "只跑了一条", body: <p>拒绝路径和失败路径才是事故的来源，而它们不会在正常使用中自己暴露。</p> },
            { claim: "教学版和生产版差距不大，改改就能上", verdict: "差四课", body: <p>持久化、身份、审计、参数校验。差距不在代码量，在这些东西缺失时你不会看到任何报错。</p> },
            { claim: "有了人工审批就安全了", verdict: "取决于人能否判断", body: <p>审批项太多，人会闭眼点同意；提示写得不清楚，人也判断不了。第 16 课那条仍然成立。</p> },
          ]}
        />
      </Prose>

      <Prose className="after-lab" label="本课带走">
        <h2>三句话。</h2>
        <Takeaways title="第二十课带走" items={["分级在前，幂等在后，checkpointer 贯穿", "验收要包含拒绝路径和失败路径", "验收要断言外部世界没有变化"]} />
      </Prose>

      <section className="chapter-bridge">
        <span>NEXT</span><i />
        <span>单元四结束。下一课进入单元五：任务本身太复杂，一条线跑不完。</span>
      </section>
    </article>
  );
}
