import { LessonFourLab } from "@/components/lesson-four-lab";
import { Prose } from "@/components/auto-term";
import {
  AsciiFigure,
  Callout,
  Checklist,
  CodeBlock,
  Misconceptions,
  RunLocally,
  Takeaways,
} from "@/components/article-kit";

export function LessonFourArticle() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 04 · 人工审批</p>
        <h1>让 Agent 停下来，<br />等人点头再继续。</h1>
        <p className="chapter-dek">真正的人工审批不是弹一个确认框，而是让后端的执行流程能安全地停住——停在半路，等一天也没关系。</p>
        <div className="chapter-meta"><span>预计 11 分钟</span><span>无需 API</span><span>承接第 03 课</span></div>
      </header>

      <Prose label="只看一句话的话">
        <h2>interrupt 把问题交出去，checkpointer 保存现场。</h2>
        <p>人回答之后，用 <code>Command(resume=...)</code> 和<strong>同一个</strong> thread_id 把决定送回来，图从原地继续。</p>
        <p className="term-hint">带虚线的词都可以悬停、聚焦或点击查看解释。</p>
        <blockquote>像财务付款：员工能填申请，但超额之后交易会停在审批状态。审批人确认，系统才拿着同一笔申请继续。</blockquote>
        <p>这个比喻的边界是：本课示例只有 yes 和 no。真实审批还要记录审批人是谁、什么时候批的、依据是什么——那属于第 27 课的审计和第 29 课的账号。</p>
      </Prose>

      <Prose label="为什么不能只在前端放个按钮">
        <h2>按钮出现的时候，删除可能已经执行完了。</h2>
        <p>网页当然可以显示「批准」和「拒绝」。但如果后端的图没有真的停住，这两个按钮就只是装饰——它们不构成约束。</p>
        <p>人工审批必须进入执行逻辑：危险动作之前，图停止；拿不到批准值，后面的节点就跑不了。</p>
        <Callout title="这是本课和界面设计的分界线">
          界面负责把问题呈现给人，执行流程负责保证「没批准就没发生」。前者做得再好，也替代不了后者。
        </Callout>
      </Prose>

      <Prose label="本课的图很简单">
        <h2>三个业务节点，一个暂停点。</h2>
        <AsciiFigure caption="propose 说明要做什么，approval 停下来问人，report 在恢复之后整理结果。">{`START → propose → approval → report → END
                     ⏸
                  等待人类`}</AsciiFigure>
        <p>本课代码不会真的删除任何文件。它只把「已删除」或「已取消」写进一个字符串，用来安全地演示控制流。</p>
      </Prose>

      <Prose label="interrupt 把什么交给外面">
        <h2>一个你自己决定内容的 payload。</h2>
        <CodeBlock caption="审批节点">{`def approval(state: State) -> dict:
    answer = interrupt({
        "question": f"确认删除 {state['path']} ?",
        "type": "yes/no",
    })
    if answer != "yes":
        return {"result": "已取消"}
    return {"result": f"已删除 {state['path']}"}`}</CodeBlock>
        <p>传给 interrupt 的对象会暴露给图外的调用者，网页或命令行据此显示审批界面。所以它应该是可序列化的普通数据——不要把数据库连接、函数或复杂对象塞进去。</p>
        <p>第一次执行到这里时，<code>answer</code> 还不存在。LangGraph 保存 State，把中断信息返回给调用者，然后停住。</p>
      </Prose>

      <Prose label="为什么必须配 checkpointer">
        <h2>图停了，总得有地方记住「停在哪」。</h2>
        <p>暂停之后要记住两件事：当时的 State 是什么，以及哪个 thread 停在了哪个节点。</p>
        <CodeBlock>{`app = graph.compile(checkpointer=InMemorySaver())

cfg = {"configurable": {"thread_id": "t1"}}
out = app.invoke({"path": "/tmp/cache", "result": ""}, cfg)`}</CodeBlock>
        <p>没有 checkpointer，暂停现场无处保存。没有同一个 thread_id，恢复时找不到原来那份现场——第 03 课那两样东西，在这一课变成了「能不能暂停」的前提。</p>
      </Prose>

      <Prose className="lab-intro" label="现在自己停一次">
        <h2>批准一条，拒绝一条，看两条路径分开。</h2>
        <p>下面的实验有两个开关：选哪条操作，以及把副作用写在 interrupt 的哪一侧。第二个开关会让你看到本课最反直觉的那件事。</p>
      </Prose>

      <LessonFourLab />

      <Prose className="after-lab" label="最容易写错的地方">
        <h2>恢复不是从那一行原地苏醒。</h2>
        <p>包含 interrupt 的节点会<strong>从开头重新执行</strong>。运行再次到达 interrupt 时，LangGraph 取出你给的 resume 值，让这次调用直接返回它。</p>
        <p>所以写在 interrupt 前面的代码会跑第二次。实跑数出来的次数是：</p>
        <AsciiFigure>{`propose 节点                  执行 1 次   ← 暂停点之前的节点，不重跑
approval 中 interrupt 之前    执行 2 次   ← 这里是坑
approval 中 interrupt 之后    执行 1 次`}</AsciiFigure>
        <p>下面这种写法会扣两次款：</p>
        <CodeBlock caption="危险写法">{`def approval(state: State):
    charge_credit_card()          # 恢复时会再执行一次
    answer = interrupt("批准吗？")`}</CodeBlock>
        <p>两条修法：把不可逆动作放到批准之后的独立节点，或者让它幂等——重复调用不会产生第二次扣款、第二次发信、第二次删除。</p>
        <Callout tone="warn" title="还有一条顺序规则">
          一个节点里有多个 interrupt 时，恢复值按调用顺序匹配。改动它们的先后顺序，会让答案对应错问题。
        </Callout>
      </Prose>

      <Prose label="审批点应该放在哪里">
        <h2>判断标准不是「听起来危险吗」。</h2>
        <p>是「执行错了以后，代价是否难以恢复」。适合设审批的通常是这几类：</p>
        <Checklist
          title="值得停一下的动作"
          items={[
            "删除或覆盖文件",
            "向外部用户发送消息",
            "支付、退款或下单",
            "修改生产数据库",
            "发布内容或部署生产版本",
            "把敏感数据发送给第三方服务",
          ]}
        />
        <p>反过来，如果读文件、列目录也全部要审批，Agent 会退化成一个不停弹窗的遥控器——而人会在第五次弹窗之后开始闭眼点同意，审批就等于没有了。</p>
      </Prose>

      <RunLocally
        file="lab/langgraph/examples/04_human_in_loop.py"
        command="uv run python examples/04_human_in_loop.py"
      >
        它不调用模型，也不执行真实删除，所以不需要 API Key。脚本已在本机实跑通过，你会看到 <code>/tmp/cache</code> 收到 yes 得到「已删除」，<code>/etc/passwd</code> 收到 no 得到「已取消」。
      </RunLocally>

      <Prose label="三个常见误区">
        <h2>有 checkpointer，不等于安全。</h2>
        <Misconceptions
          items={[
            {
              claim: "有 checkpointer 就是安全的",
              verdict: "不是",
              body: <p>它负责保存和恢复，不负责验证审批人身份，也不阻止别人用一个 thread_id 去批准不属于他的操作。谁能批准，是另一个问题。</p>,
            },
            {
              claim: "拒绝就让程序直接崩掉",
              verdict: "不必",
              body: <p>拒绝也是一次明确的状态转移：更新结果、记录原因、走安全路径结束。让它抛异常，前端就得为这条正常路径写特殊分支。</p>,
            },
            {
              claim: "副作用放在 interrupt 前后都一样",
              verdict: "不一样",
              body: <p>实测差了整整一倍：前面执行 2 次，后面执行 1 次。不可逆的动作必须放在批准之后，或者做成幂等的。</p>,
            },
          ]}
        />
      </Prose>

      <Prose className="after-lab" label="本课带走">
        <h2>三句话，一个判断。</h2>
        <Takeaways
          title="第四课带走"
          items={["interrupt 暂停并交出问题", "checkpointer + 同一个 thread_id 才能恢复", "恢复会重跑节点，副作用要放对位置"]}
        />
        <p>这些规则让「人在回路中」成为执行约束，而不是界面装饰。</p>
      </Prose>

      <section className="chapter-bridge">
        <span>NEXT</span>
        <i />
        <span>四个部件都看懂了：图、工具、记忆、审批。下一课把它们拼起来。</span>
      </section>
    </article>
  );
}
