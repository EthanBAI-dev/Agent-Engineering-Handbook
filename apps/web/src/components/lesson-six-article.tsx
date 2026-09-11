import { ClassifyLab } from "@/components/lab-kit";
import { Prose } from "@/components/auto-term";
import { AsciiFigure, Callout, CodeBlock, Misconceptions, RunLocally, Takeaways } from "@/components/article-kit";

const items = [
  { id: "s1", label: "模型输出了 get_weather 的调用请求", detail: "这一步之后，消息列表里多了一条带 tool call 的 AIMessage。", correct: "model", why: "调不调用工具由模型决定——它在回答里放不放 tool call。" },
  { id: "s2", label: "流程从 model 走向 tools", detail: "条件边读取最后一条消息。", correct: "code", why: "tools_condition 检查的是「有没有 tool call 这个结构」，不读语义。" },
  { id: "s3", label: "工具返回「北京：晴，24 度」", detail: "ToolNode 执行了真实的 Python 函数。", correct: "code", why: "执行的是你写的函数，模型碰不到它的内部。" },
  { id: "s4", label: "最终回答写成「北京今天晴，24 度。」", detail: "同一张图换个模型，这句话就变了。", correct: "model", why: "措辞归模型。图的结构、消息条数和类型都没变。" },
  { id: "s5", label: "这一轮之后结束运行", detail: "没有新的 tool call。", correct: "code", why: "还是那条条件边：没有 tool call 就去 END。模型不会自己停。" },
];

export function LessonSixArticle() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 06 · 模型与消息</p>
        <h1>哪些事归模型，<br />哪些事归你的代码。</h1>
        <p className="chapter-dek">从这一课起要接真实模型，行为会变得不稳定。动手之前先准备一把尺子，量一量「这次不对，到底是谁的问题」。</p>
        <div className="chapter-meta"><span>预计 9 分钟</span><span>无需 API</span><span>承接第 05 课</span></div>
      </header>

      <Prose label="只看一句话的话">
        <h2>一次运行里的决定，大部分是你的代码定死的。</h2>
        <p>模型只负责它那一小块：说什么，以及要不要提出工具调用。分不清这条边界，调试时就会一直问错问题——模型答得不对，你去改图；图接错了，你去改提示词。</p>
        <p className="term-hint">带虚线的词都可以悬停、聚焦或点击查看解释。</p>
      </Prose>

      <Prose label="消息不是一串纯文本">
        <h2>模型看到的是一个有类型的列表。</h2>
        <CodeBlock caption="三种角色">{`SystemMessage(content="你是一个只用一句话回答的助手。")
HumanMessage(content="LangGraph 是什么？")
AIMessage(content="它是一个编排框架。")`}</CodeBlock>
        <p>角色不是装饰，它决定模型怎么理解这段话是谁说的。第 02 课的 ToolMessage 是同一个体系里的第四种。</p>
        <Callout title="Prompt 不是一个字段">
          在 Agent 里，Prompt 是你这一轮决定交给模型的<strong>整个消息列表</strong>。
          多传一条系统消息，模型看到的输入就多一条；换一个 thread_id，恢复出来的历史不一样，交给它的列表就不一样。
          模型没有「记性好坏」，只有「这次收到了什么」。
        </Callout>
      </Prose>

      <Prose label="同一张图，换个模型">
        <h2>只有那句话会变。</h2>
        <AsciiFigure caption="图的结构一个字都没改，变的只有措辞。">{`模型 A: 它是编排多步骤流程的框架。
模型 B: 一个把 Agent 画成图来跑的库。
        消息条数 3，最后一条类型 AIMessage`}</AsciiFigure>
        <p>反过来也成立：换一条边、加一个节点，模型再聪明也走不到你没连的地方。</p>
      </Prose>

      <Prose className="lab-intro" label="现在自己分一次">
        <h2>五个决定，各归谁？</h2>
        <p>下面是一次固定运行的事件流。每一步只问一个问题：这一步的结果，是模型定的，还是代码定的？</p>
      </Prose>

      <ClassifyLab
        kicker="INTERACTIVE 06"
        title="把每个决定分给模型或代码"
        storageKey="agent-lab-lesson-6"
        options={[{ id: "model", label: "模型" }, { id: "code", label: "你的代码" }]}
        items={items}
        passText="五步全对。注意第 2 和第 5 条的依据是同一条条件边，不是模型的意愿。"
        note="事件流固定不变，因此每次判断的答案都一样。真实模型会让措辞变化，但这五步各归谁不会变。"
        code={{
          summary: "展开这次运行对应的代码",
          text: `def call_model(state: MessagesState) -> dict:
    return {"messages": [model.invoke(state["messages"])]}

graph.add_node("model", call_model)
graph.add_node("tools", ToolNode(TOOLS))
graph.add_edge(START, "model")
graph.add_conditional_edges("model", tools_condition)   # 读结构，不读语义
graph.add_edge("tools", "model")`,
        }}
      />

      <Prose className="after-lab" label="谁决定什么">
        <h2>这张表是本课要记住的全部。</h2>
        <AsciiFigure>{`这次要不要调用工具      模型      它在回答里放不放 tool call
有哪些工具可以调用      你的代码  bind_tools 交出去的那份清单
工具执行的结果是什么    你的代码  ToolNode 跑的是真的 Python 函数
回答用什么措辞          模型      同一张图换个模型就变了
跑完 model 之后去哪     你的代码  条件边读消息结构，不读语义
最多允许跑几轮          你的代码  模型不会自己停，见第 10 课`}</AsciiFigure>
      </Prose>

      <RunLocally file="lab/langgraph/examples/06_messages.py" command="uv run python examples/06_messages.py">
        它使用脚本化模型 <code>_fake.py</code>，<strong>不需要 API Key</strong>。图的其余部分都是真的 LangGraph 在跑，只有「模型说什么」被固定下来，好让结果可以反复验证。
      </RunLocally>

      <Prose label="三个常见误区">
        <h2>提示词写得好，也拦不住它。</h2>
        <Misconceptions
          items={[
            { claim: "提示词写得好，Agent 就不会乱调工具", verdict: "拦不住", body: <p>提示词只能影响倾向，不能构成约束。真正的约束是代码：工具清单里没有的工具，模型再想调也调不到。第 10、28 课会把这件事做实。</p> },
            { claim: "模型记不住上文，是因为它记性差", verdict: "不是", body: <p>它每次只看到你交给它的那个列表。上一轮的消息没进列表，就等于没发生过——那是第 03 课的 checkpoint 问题。</p> },
            { claim: "换个更强的模型，图就不用改了", verdict: "不成立", body: <p>更强的模型不会替你加上缺失的那条边。没有 <code>tools → model</code> 回边，再强的模型也拿不到工具结果。</p> },
          ]}
        />
      </Prose>

      <Prose className="after-lab" label="本课带走">
        <h2>三句话。</h2>
        <Takeaways title="第六课带走" items={["模型决定说什么、要不要调工具", "代码决定有哪些工具、走哪条路、最多几轮", "Prompt 是你这一轮交出去的整个消息列表"]} />
      </Prose>

      <section className="chapter-bridge">
        <span>NEXT</span><i />
        <span>分清职责之后就能接真实模型了。下一课的重点不是怎样调用，而是密钥放在哪里。</span>
      </section>
    </article>
  );
}
