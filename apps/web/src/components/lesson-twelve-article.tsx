import { ClassifyLab } from "@/components/lab-kit";
import { Prose } from "@/components/auto-term";
import { Callout, CodeBlock, Misconceptions, RunLocally, Takeaways } from "@/components/article-kit";

const items = [
  { id: "c1", label: "调用时多传了 user_id，跑完 State 里没有它", detail: "invoke({\"question\": \"在吗\", \"user_id\": \"u_42\"})", correct: "input", why: "user_id 不在 schema 里，被静默丢掉了。没有报错，也没有进 State。" },
  { id: "c2", label: "节点返回 {\"answr\": ...}，answer 仍是空字符串", detail: "想写 answer，手滑写成 answr", correct: "typo", why: "字段名拼错，同样静默忽略。调试时你会一直去看模型，其实是拼写错了。" },
  { id: "c3", label: "internal_note 被写进了 State，接口却读不到", detail: "StateGraph(State, output_schema=Output)", correct: "design", why: "这是刻意的：output_schema 把内部字段挡在接口之外。前两种是错误，这一种是设计。" },
];

export function LessonTwelveArticle() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 12 · State Schema</p>
        <h1>写错字段名不会报错，<br />只会静静地什么都不发生。</h1>
        <p className="chapter-dek">静默失败比崩溃危险，因为没人会去查一件「看起来正常」的事。</p>
        <div className="chapter-meta"><span>预计 8 分钟</span><span>无需 API</span><span>承接第 11 课</span></div>
      </header>

      <Prose label="只看一句话的话">
        <h2>State 的字段清单是一份合同。</h2>
        <p>不在合同里的字段，传进去和写出来都会被静默丢掉。这一课先让你认出两种静默失败，再讲怎样把它们变成能发现的问题。</p>
        <p className="term-hint">带虚线的词都可以悬停、聚焦或点击查看解释。</p>
      </Prose>

      <Prose label="两种静默">
        <h2>都不报错，也都没生效。</h2>
        <CodeBlock caption="第一种：多传的字段被丢掉">{`app.invoke({"question": "在吗", "answer": "", "internal_note": "", "user_id": "u_42"})
# → {'question': '在吗', 'answer': '收到：在吗', 'internal_note': ''}
#    user_id 不见了，没有任何提示`}</CodeBlock>
        <CodeBlock caption="第二种：节点写错字段名">{`def typo_node(state: State) -> dict:
    return {"answr": "这句话永远不会出现"}
# → answer 仍然是 ''`}</CodeBlock>
        <Callout tone="warn" title="记住这条排查顺序">
          结果「没变化」时，<strong>先怀疑字段名拼写，再怀疑模型</strong>。
          第一种的后果会隔好几步才暴露成 <code>KeyError</code>，离真正的原因已经很远。
        </Callout>
      </Prose>

      <Prose label="把边界写清楚">
        <h2>同一张图，可以有三份字段清单。</h2>
        <CodeBlock>{`graph = StateGraph(State, input_schema=Input, output_schema=Output)

# State  节点内部能读写的全部字段
# Input  调用方需要提供的字段
# Output 调用方能拿到的字段`}</CodeBlock>
        <p>这正好解决第 08 课那个挑战题：接口不该把整个 State 抖给前端。有了 <code>output_schema</code>，「只返回你主动挑选的字段」从一条纪律变成了一个结构约束——就算以后有人往 State 里加了新的内部字段，也不会顺着接口漏出去。</p>
      </Prose>

      <Prose className="lab-intro" label="自己分辨一次">
        <h2>三次调用，每次都有一个字段没按预期出现。</h2>
        <p>两种是错误，一种是设计。分清楚它们，比记住语法有用。</p>
      </Prose>

      <ClassifyLab
        kicker="INTERACTIVE 12"
        title="找出消失的字段"
        storageKey="agent-lab-lesson-12"
        options={[
          { id: "input", label: "输入侧被丢掉" },
          { id: "typo", label: "字段名拼错" },
          { id: "design", label: "刻意挡在接口外" },
        ]}
        items={items}
        passText="三种分辨正确。前两种是错误，第三种是设计——这条区别决定了你该去改代码还是什么都不用改。"
        note="三种行为都在 langgraph 1.2.11 上实测过：多传的字段被丢掉、写错名字的返回被忽略、output_schema 之外的字段不出现在返回值里。"
        code={{
          summary: "展开三份清单怎么分",
          text: `用户的问题     Input ✓  Output ✗   调用方自己就有，不用还给它
最终回答       Input ✗  Output ✓   这才是调用方要的
系统提示       Input ✗  Output ✗   内部配置，不该进出
工具原始返回   Input ✗  Output ✗   给模型看的中间结果
调用次数       Input ✗  Output ?   前端要显示配额就给，否则不给

判断标准只有一条：这个字段，调用方有没有正当理由知道它？`,
        }}
      />

      <RunLocally file="lab/langgraph/examples/12_state_schema.py" command="uv run python examples/12_state_schema.py">
        <strong>不需要 API Key</strong>。建议把第 2 段的 <code>answr</code> 改回 <code>answer</code> 再跑一次，感受一下「有没有报错」和「有没有生效」是两件独立的事。
      </RunLocally>

      <Prose label="三个常见误区">
        <h2>TypedDict 不做运行时检查。</h2>
        <Misconceptions
          items={[
            { claim: "TypedDict 会在运行时检查类型", verdict: "不会", body: <p>它是给静态检查工具和读代码的人看的。运行时想要校验，得换 Pydantic——代价是每一步多做一次验证。</p> },
            { claim: "多传几个字段没关系，反正用不到", verdict: "会误导你", body: <p>麻烦在于它让人以为传进去了。第 29 课的 <code>user_id</code> 就是典型：以为传了，其实丢了，权限判断落空。</p> },
            { claim: "output_schema 是可选的，接口层再过滤就行", verdict: "靠人记得", body: <p><code>output_schema</code> 靠结构保证。两者都做最好，只做一个的话选后者——它不会因为有人加了新字段而失效。</p> },
          ]}
        />
      </Prose>

      <Prose className="after-lab" label="本课带走">
        <h2>三句话。</h2>
        <Takeaways title="第十二课带走" items={["不在 schema 里的字段会被静默丢掉", "结果没变化先查字段名，再查模型", "用 output_schema 把内部字段挡在接口外"]} />
      </Prose>

      <section className="chapter-bridge">
        <span>NEXT</span><i />
        <span>字段名对上了。还有一个更隐蔽的问题：两个分支同时改同一个字段，谁说了算？</span>
      </section>
    </article>
  );
}
