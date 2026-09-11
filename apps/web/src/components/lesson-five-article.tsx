import { LessonFiveLab } from "@/components/lesson-five-lab";
import { Prose } from "@/components/auto-term";
import {
  AsciiFigure,
  Callout,
  Checklist,
  CodeBlock,
  Misconceptions,
  Takeaways,
} from "@/components/article-kit";

export function LessonFiveArticle() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 05 · 完整 Agent 蓝图</p>
        <h1>把四块拼起来，<br />看它到底缺什么。</h1>
        <p className="chapter-dek">这一课不引入任何新 API。它只做一件事：把前四课的部件按正确顺序装好，然后诚实地标出教学版和生产版之间还差多少。</p>
        <div className="chapter-meta"><span>预计 10 分钟</span><span>无需 API</span><span>设计课</span></div>
      </header>

      <Prose label="只看一句话的话">
        <h2>没有哪个节点「负责整个 Agent」。</h2>
        <p>model 负责决定，tools 负责执行，Edge 负责控制路线，checkpointer 负责保存现场，人类负责承担不可逆的决策。</p>
        <p className="term-hint">带虚线的词都可以悬停、聚焦或点击查看解释。</p>
        <blockquote>先画蓝图，再写代码。蓝图能在十分钟里改五版；代码写完再发现审批点放错了，改的是每一个调用它的地方。</blockquote>
      </Prose>

      <Prose label="这次要设计什么">
        <h2>一个会整理文件的 Agent。</h2>
        <p>它能扫描目录、读文件、移动文件，也能删除文件。前三件事做错了还能补救，最后一件不能——这条区别决定了整张图的形状。</p>
        <Checklist
          title="先写清任务边界"
          items={[
            "它能做什么：扫描、读取、归档、删除",
            "哪些动作不可逆：删除",
            "谁来承担不可逆的决策：人，不是模型",
            "失败之后回到哪里：一条不碰副作用的安全路径",
          ]}
        />
        <p>第四条最容易漏。绝大多数 Agent 的事故不是「做错了一件事」，而是「做到一半失败，留下了一个说不清的中间状态」。</p>
      </Prose>

      <Prose label="五步装配">
        <h2>顺序不能换。</h2>
        <p>先定 State 保存什么，再列节点，然后闭合普通工具循环，再把危险工具单独拉出一条路，最后加 checkpointer 让等待成为可能。</p>
        <AsciiFigure caption="危险工具不在普通循环里——它要先经过一个会停住的节点。">{`                         ┌──────── safe_tools ────────┐
                         │                            │
START → model ───────────┼────────────────────────────┘
          │              │
          │              └── 没有调用 → report → END
          │
          └── 危险调用 → approval ⏸
                            │
                   ┌──批准──┴──→ risky_tools → model
                   │
                   └──拒绝────→ report → END`}</AsciiFigure>
        <Callout title="为什么要拆成两个工具节点">
          放在同一个 ToolNode 里，你就只能在「全部审批」和「全部不审批」之间选。
          拆开之后，路由按风险决定走哪条路——这正是第 16 课风险分级的雏形。
        </Callout>
      </Prose>

      <Prose className="lab-intro" label="现在自己拼一次">
        <h2>五张卡片，两个开关，五条约束。</h2>
        <p>通过标准不是「画得和上面那张图一模一样」，而是五条约束全部成立。同一组约束可以有不止一种画法。</p>
      </Prose>

      <LessonFiveLab />

      <Prose className="after-lab" label="失败时应该回到哪里">
        <h2>拒绝不是「什么都不做」。</h2>
        <p>它是一次明确的状态转移：写清结果、记下原因、走安全路径结束。让它抛异常，前端就得为一条正常路径写特殊分支。</p>
        <p>同样地，工具执行失败也要有去处。回到 model 让它换个办法，或者进 report 如实说明——但不能停在半路，把一个说不清的中间状态留在那里。</p>
        <CodeBlock caption="拒绝路径">{`def after_approval(state: AgentState) -> str:
    return "risky_tools" if state["approved"] else "report"`}</CodeBlock>
      </Prose>

      <Prose label="从教学版到生产版还差什么">
        <h2>四处差距，各占一课。</h2>
        <p>把它们写下来，比假装已经完整安全得多。</p>
        <AsciiFigure>{`内存 checkpointer  →  外部存储            第 15 课
没有账号           →  身份与数据隔离      第 29 课
工具参数不校验     →  参数白名单与路径限制  第 28 课
没有记录谁批准了   →  审计日志            第 27 课`}</AsciiFigure>
        <Misconceptions
          items={[
            {
              claim: "蓝图画完就可以照着写代码了",
              verdict: "还差一步",
              body: <p>先用几个真实场景走一遍：删除被拒绝会怎样？工具超时会怎样？同一个请求提交两次会怎样？走不通的地方，改蓝图比改代码便宜得多。</p>,
            },
            {
              claim: "所有工具都设成危险的更安全",
              verdict: "反而更不安全",
              body: <p>审批项太多，人会在第五次弹窗之后开始闭眼点同意。那时审批只剩下「出事后可以说用户同意过」的免责功能，不再提供任何保护。</p>,
            },
          ]}
        />
      </Prose>

      <Prose className="after-lab" label="本课带走">
        <h2>前六课真正学到的东西。</h2>
        <Takeaways
          title="第五课带走"
          items={["按风险分路，不按功能分路", "拒绝和失败都要有去处", "写下还差什么，比假装完整安全"]}
        />
        <p>到这里，Agent 的骨架已经完整了：图、工具、记忆、审批，以及把它们装在一起的判断。下一阶段开始，我们把教学版的部件一层层换成能上线的。</p>
      </Prose>

      <section className="chapter-bridge">
        <span>NEXT</span>
        <i />
        <span>骨架完整了。下一阶段接真实模型——先分清哪些事归模型、哪些归你的代码。</span>
      </section>
    </article>
  );
}
