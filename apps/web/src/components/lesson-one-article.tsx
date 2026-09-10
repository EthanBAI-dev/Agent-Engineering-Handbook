import { LessonOneLab } from "@/components/lesson-one-lab";
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

export function LessonOneArticle() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 01 · 图与 State</p>
        <h1>Agent 不是一次回答，<br />而是一条会改变 State 的路。</h1>
        <p className="chapter-dek">先别急着接模型。把一张没有 AI 的图跑明白，你就抓住了 LangGraph 最稳定的骨架。</p>
        <div className="chapter-meta"><span>预计 12 分钟</span><span>无需 API</span><span>零基础</span></div>
      </header>

      <Prose label="只看一句话的话">
        <h2>Agent 每走到一个节点，就读一次 State，再写回一小块变化。</h2>
        <p>普通函数像一次性办完一件事：输入进去，结果出来，中间发生了什么很难看见。</p>
        <p>图不一样。State 在步骤之间传递；Node 做一小步；Edge 决定下一步去哪。所谓「循环执行」，不是模型拥有什么神秘意志——只是图里有一条会绕回前面节点的条件 Edge。</p>
        <p className="term-hint">带虚线的词都可以悬停、聚焦或点击查看解释。同一个词重复出现时，提示依然在，不用往回翻。</p>
        <blockquote>把它想成接力赛：State 是接力棒，Node 是运动员，Edge 是跑道。每个人只完成自己的一段，然后把同一根棒交给下一个人。</blockquote>
        <p>这个比喻有一个边界：真实的 State 不是只能被一个人握住的实体。LangGraph 也能处理分支和并行，本课先只看一条顺序路径。</p>
      </Prose>

      <section className="concept-explainer" aria-label="三个核心概念">
        <article><span>STATE</span><h2>共享的数据</h2><p>所有节点都读它。节点返回的不是全新世界，而是要更新的字段。</p></article>
        <article><span>NODE</span><h2>做一小步</h2><p>一个节点就是一个函数：读取当前状态，完成一种明确动作。</p></article>
        <article><span>EDGE</span><h2>决定下一站</h2><p>固定连线直接前进，条件连线可以分支，也可以让流程再跑一圈。</p></article>
      </section>

      <Prose label="为什么第一课没有模型">
        <h2>一上来就接模型，你会同时被五件事绊住。</h2>
        <p>提示词、消息格式、工具、API Key、还有不可预测的输出。程序确实跑起来了，但你说不清究竟是谁决定了下一步。</p>
        <p>所以第一课故意把模型拿掉。流程完全确定，每次运行都得到同样的结果。等这张图看懂以后，后面几课只是往图里换不同的节点。</p>
      </Prose>

      <Prose label="State：所有节点共享的现场">
        <h2>先看这份 State 长什么样。</h2>
        <CodeBlock caption="State 定义">{`class State(TypedDict):
    topic: str
    count: int
    log: Annotated[list[str], operator.add]`}</CodeBlock>
        <p>这里出现了 TypedDict 和 Annotated：前者规定 State 有哪些字段、各自是什么类型，后者在类型之外给 log 绑定了一条额外的合并规则。</p>
        <p>它保存三样东西：<code>topic</code> 是这次任务的主题，<code>count</code> 是流程推进到哪个计数，<code>log</code> 是每个节点留下的记录。初始值是：</p>
        <CodeBlock>{`{"topic": "学 LangGraph", "count": 0, "log": []}`}</CodeBlock>
        <Callout title="State 不是模型的长期记忆">
          它只是当前这一次图运行时，节点共同读写的数据结构。跑完就没了。怎样跨多次调用把它保存下来，是第 03 课的事。
        </Callout>
      </Prose>

      <Prose label="Node：只做一小步的函数">
        <h2>节点就是普通函数，而且刻意写得很小。</h2>
        <CodeBlock caption="plan 节点">{`def plan(state: State) -> dict:
    return {
        "log": [f"planning: {state['topic']}"],
        "count": state["count"] + 1,
    }`}</CodeBlock>
        <p>注意它没有返回完整的 State，只返回要更新的字段。LangGraph 会把这些更新合并回当前 State。节点负责「做什么」，但它自己不决定下一站是谁。</p>
        <CodeBlock caption="work 与 review 节点">{`def work(state: State) -> dict:
    return {
        "log": [f"work pass #{state['count']}"],
        "count": state["count"] + 1,
    }

def review(state: State) -> dict:
    return {"log": ["review"]}`}</CodeBlock>
        <p>把节点写小有一个直接好处：结果不对时，你知道该去检查哪一步，而不是面对一个什么都做的大函数。</p>
      </Prose>

      <Prose label="Reducer：覆盖，还是累加">
        <h2>同一次更新，两个字段的命运完全不同。</h2>
        <p>运行 plan 之后，<code>count</code> 从 <code>0</code> 变成 <code>1</code>。旧的 <code>0</code> 不再保留——普通字段就是新值覆盖旧值。</p>
        <p><code>log</code> 不一样，因为它带着一条规则：</p>
        <CodeBlock>{`Annotated[list[str], operator.add]`}</CodeBlock>
        <p>这里的 operator.add 就是 Reducer。于是节点返回一项时，结果是追加而不是替换：</p>
        <CodeBlock caption="plan 之后 → work 之后">{`{"log": ["planning: 学 LangGraph"]}

{"log": [
    "planning: 学 LangGraph",
    "work pass #1",
]}`}</CodeBlock>
        <p>这不是写法上的装饰。第 02 课的消息历史也必须累加，否则 Agent 会只剩最后一条消息，看不到自己刚才做过什么。</p>
      </Prose>

      <Prose label="Edge：把节点连成执行路径">
        <h2>有了三个函数，它们还不会自己组成 Agent。</h2>
        <p>真正定义执行顺序的是这几行：</p>
        <CodeBlock caption="图的连线">{`graph.add_edge(START, "plan")
graph.add_edge("plan", "work")
graph.add_conditional_edges("work", should_continue, ["work", "review"])
graph.add_edge("review", END)`}</CodeBlock>
        <AsciiFigure caption="固定 Edge 只有一个明确下一站；条件 Edge 先运行判断函数，再按返回值选路。">{`START → plan → work ──条件成立──→ work
                  └──条件不成立──→ review → END`}</AsciiFigure>
        <p>START 和 END 不是你写的业务函数，它们只标记流程从哪里开始、在哪里结束。</p>
      </Prose>

      <Prose label="循环到底藏在哪里">
        <h2>就藏在这一行判断里。</h2>
        <CodeBlock caption="条件函数">{`def should_continue(state: State) -> str:
    return "work" if state["count"] < 4 else "review"`}</CodeBlock>
        <p>当 <code>count &lt; 4</code> 成立，它返回 <code>work</code>。当前节点本来就是 work，下一站又是 work——流程就这样绕了回去。条件不成立时它返回 <code>review</code>，循环才结束。</p>
        <p>请注意责任的划分：Agent 是否继续，不由 work 函数决定。work 只更新 State；条件 Edge 读取更新后的 State，再决定路线。</p>
      </Prose>

      <Prose className="lab-intro" label="现在别只看">
        <h2>每点一次，只允许图走一步。</h2>
        <p>先盯住 <code>count</code> 和 <code>log</code>。前者每次被新值覆盖，后者靠 Reducer 把新记录接在旧记录后面。第一遍先不要点「自动运行」，单步观察这条变化：</p>
        <AsciiFigure>{`count: 0 → 1
log:   [] → ["planning: 学 LangGraph"]`}</AsciiFigure>
      </Prose>

      <LessonOneLab />

      <Prose className="after-lab" label="你刚刚看见了什么">
        <h2>循环不是 Agent 的神秘能力，只是一条条件 Edge。</h2>
        <p>默认阈值为 <code>4</code>。完整跑完后，经过本机验证的结果是：</p>
        <AsciiFigure>{`work 执行 3 次
最终 count = 4
log 一共 5 条`}</AsciiFigure>
        <p>为什么 work 不是跑 4 次？因为 plan 已经先把 <code>count</code> 从 0 加到了 1。work 从 1 开始，加到 4 就停。</p>
        <p>这也是第一课最重要的判断：节点负责做事，Edge 负责控制流程，State 负责让每一步都看得见前面发生过什么。</p>
      </Prose>

      <Prose label="本课挑战：让 work 多跑两次">
        <h2>把阈值从 4 改成 6，先预测，再运行。</h2>
        <CodeBlock>{`return "work" if state["count"] < 6 else "review"`}</CodeBlock>
        <p>正确结果应该是：</p>
        <AsciiFigure>{`work 执行 5 次
最终 count = 6
log 一共 7 条`}</AsciiFigure>
        <Checklist
          title="如果结果对不上，按顺序检查这四条"
          items={[
            "你改的是条件阈值，不是初始 count",
            "plan 仍然会先执行一次，count 从 1 起步",
            "work 每次仍然只把 count 加一",
            "review 只追加日志，不修改 count",
          ]}
        />
        <p>能解释这四条，比碰巧得到数字 <code>6</code> 更重要。</p>
      </Prose>

      <RunLocally
        file="lab/langgraph/examples/01_hello_graph.py"
        command="uv run python examples/01_hello_graph.py"
      >
        完成第 00 课的环境配置后，在 <code>lab/langgraph</code> 目录运行它。程序先用 stream 逐步打印每一步，再用 invoke 取回最终 State。现在不必记住这两个方法的全部参数。
      </RunLocally>

      <Prose label="什么时候不该画成 Agent 图">
        <h2>图的价值来自控制流程，不是节点数量。</h2>
        <p>如果一个任务永远只有一步，没有分支、循环、暂停，也不需要共享现场，那普通函数通常更简单。不要因为 LangGraph 能画图，就把每段代码都包装成 Node。</p>
        <Misconceptions
          items={[
            {
              claim: "节点越多，Agent 越聪明",
              verdict: "不成立",
              body: <p>节点数量只影响流程被切得多细。真正决定质量的是每一步是否明确、State 里是否有它需要的信息。</p>,
            },
            {
              claim: "本课这张图已经是一个 Agent 了",
              verdict: "还不是",
              body: <p>它的路线是程序员提前写死的。下一课会把「要不要调用工具」交给 model 决定，但真正执行工具的仍然不是模型。</p>,
            },
          ]}
        />
      </Prose>

      <Prose className="after-lab" label="本课带走">
        <h2>三句话，以及一个检验标准。</h2>
        <Takeaways title="第一课带走" items={["State 保存现场", "Node 修改现场", "Edge 推动下一步"]} />
        <p>如果你还能解释 Reducer 为什么让 <code>log</code> 累加、而 <code>count</code> 会被覆盖，这一课就真正完成了。</p>
      </Prose>

      <section className="chapter-bridge">
        <span>NEXT</span>
        <i />
        <span>现在路线是写死的。下一课把「要不要调用工具」交给模型。</span>
      </section>
    </article>
  );
}
