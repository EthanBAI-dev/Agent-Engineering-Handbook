import { ClassifyLab } from "@/components/lab-kit";
import { Prose } from "@/components/auto-term";
import { AsciiFigure, Callout, CodeBlock, Misconceptions, RunLocally, Takeaways } from "@/components/article-kit";

const items = [
  { id: "a", label: "计划 A：fetch → parse → summarize → save", detail: "四步，全部在允许清单内", correct: "pass", why: "步骤合法、长度合理，放行。校验的作用不是挑刺，是挡住明确非法的东西。" },
  { id: "b", label: "计划 B：fetch → rm_rf → save", detail: "含一个未登记的步骤", correct: "block", why: "rm_rf 不在 ALLOWED_STEPS 里，直接拦下。实跑结果是「一步都没执行」——校验发生在 planner 和 executor 之间。" },
  { id: "c", label: "计划 C：十二步，其中三步重复", detail: "全部步骤都在清单内，但太长", correct: "replan", why: "步骤都合法，问题是计划本身不好。退回重新规划比直接放弃合理——方向没错，只是绕了。" },
];

export function LessonTwentyFourArticle() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 24 · Planner–Executor</p>
        <h1>先把计划写下来，<br />才能检查它。</h1>
        <p className="chapter-dek">ReAct 每一步都现想下一步。灵活，但你无法在它动手之前看到全貌。</p>
        <div className="chapter-meta"><span>预计 9 分钟</span><span>无需 API</span><span>承接第 23 课</span></div>
      </header>

      <Prose label="只看一句话的话">
        <h2>计划是数据，不是想法。</h2>
        <p>写成数据，才能校验、展示、修改、重排。需要人先审一遍、需要预估成本、需要失败时换一条整体路线——这三件事 ReAct 一件都做不了，因为在它跑起来之前，计划不存在。</p>
        <p className="term-hint">带虚线的词都可以悬停、聚焦或点击查看解释。</p>
      </Prose>

      <Prose label="三个节点的结构">
        <h2>validate 夹在中间，这是整个模式最有价值的位置。</h2>
        <AsciiFigure>{`planner → validate → executor ⇄（失败）→ bump_replan → planner
                         ↓（做完）
                       finish`}</AsciiFigure>
        <CodeBlock caption="校验">{`def validate(state: State) -> dict:
    unknown = [s for s in state["plan"] if s not in ALLOWED_STEPS]
    if unknown:
        return {"status": f"计划非法：出现未知步骤 {unknown}"}
    if len(state["plan"]) > 6:
        return {"status": f"计划过长：{len(state['plan'])} 步，超出上限"}
    return {"status": "计划通过校验"}`}</CodeBlock>
        <p>给它一份含 <code>rm_rf</code> 的计划，实跑结果是<strong>一步都没执行</strong>。对比第 11 课的白名单：那里校验的是一个分支键，这里校验的是一整份计划。同一条原则，粒度不同。</p>
      </Prose>

      <Prose className="lab-intro" label="自己审三份计划">
        <h2>放行、拦下、还是退回重新规划？</h2>
        <p>第三份有点微妙：步骤全都合法，问题在计划本身。</p>
      </Prose>

      <ClassifyLab
        kicker="INTERACTIVE 24"
        title="审一份计划"
        storageKey="agent-lab-lesson-24"
        options={[{ id: "pass", label: "放行" }, { id: "block", label: "拦下并放弃" }, { id: "replan", label: "退回重新规划" }]}
        items={items}
        passText="三份都判断对了。注意 B 和 C 的区别：一个是非法，一个是不好——处理方式不一样。"
        note="校验规则来自 24_planner_executor.py：未知步骤直接拦下，超过 6 步判为过长。"
        code={{
          summary: "展开重规划与它的上限",
          text: `def route_after_step(state: State) -> str:
    if state["status"].endswith("失败"):
        return "bump_replan" if state["replans"] < MAX_REPLANS else "give_up"
    ...

# 没有上限的话，一个永远失败的步骤会让它无限重规划，
# 而且每次重规划都要调一次模型——第 10 课那条老规矩。`,
        }}
      />

      <Prose className="after-lab" label="重规划会重做已完成的步骤">
        <h2>实跑里 fetch 执行了两次。</h2>
        <p>这不是 bug，是重规划的固有代价：<strong>新计划从头开始，已经做过的步骤会被重做</strong>。如果 <code>fetch</code> 只是读数据，重做无害；如果它是扣款或发邮件，重做就是事故——第 19 课那个幂等键在这里又用上了。</p>
        <Callout tone="warn" title="凡是会被重规划重做的步骤，都必须是幂等的">
          另一种做法是让 planner 知道哪些步骤已完成，只规划剩下的。代价是 planner 的输入变复杂，
          而且它可能误判「已完成」的含义。
        </Callout>
      </Prose>

      <Prose label="和 ReAct 怎么选">
        <h2>两者不是对立的。</h2>
        <CodeBlock>{`步骤数量事先不知道      ReAct     计划写不出来，只能走一步看一步
需要人先审一遍再动手    Planner   计划是数据，能展示、能修改
需要预估成本和耗时      Planner   步数已知，可以先算再决定跑不跑
环境变化快，计划易过期  ReAct     写好的计划执行到一半就不适用了
失败时要换一条整体路线  Planner   重规划就是换一版计划`}</CodeBlock>
        <p>常见的混合做法是：用 Planner 定大步骤，每个大步骤内部用 ReAct 自由发挥。</p>
      </Prose>

      <RunLocally file="lab/langgraph/examples/24_planner_executor.py" command="uv run python examples/24_planner_executor.py">
        <strong>不需要 API Key</strong>。脚本里的 planner 写死了两版计划，为的是让结果可复现。接上真实模型后，planner 的输出质量成了变量——那时 <code>validate</code> 就不只是保险，而是必需品。
      </RunLocally>

      <Prose label="本课挑战：这个校验为什么形同虚设">
        <h2>validate 是个孤岛。</h2>
        <CodeBlock>{`graph.add_edge("planner", "executor")      # 直接连过去了
graph.add_node("validate", validate)`}</CodeBlock>
        <p>它被加进了图，但没有任何边把它接进执行路径。这类 bug 不会报错——<strong>没有入边的节点，<code>compile()</code> 不报错、运行也不报错，就是不执行</strong>（本仓库实测）。第 22 课那个「零扇出时 reduce 被跳过」是同一类失败。</p>
      </Prose>

      <Prose label="三个常见误区">
        <h2>Planner 不比 ReAct 高级。</h2>
        <Misconceptions
          items={[
            { claim: "Planner 比 ReAct 高级", verdict: "解决不同问题", body: <p>步骤数量事先不知道时，Planner 根本写不出计划。</p> },
            { claim: "重规划很智能，失败了自动换路", verdict: "会从头再来", body: <p>没有幂等保护的话，重规划次数越多，副作用重复得越多。</p> },
            { claim: "校验规则以后再补", verdict: "那是唯一收益", body: <p><code>validate</code> 是这个模式唯一的安全收益。没有它，Planner 只是把 ReAct 的不确定性提前打包了一下。</p> },
          ]}
        />
      </Prose>

      <Prose className="after-lab" label="本课带走">
        <h2>三句话。</h2>
        <Takeaways title="第二十四课带走" items={["计划写成数据才能在执行前校验", "重规划会重做，副作用必须幂等", "重规划次数要有上限"]} />
      </Prose>

      <section className="chapter-bridge">
        <span>NEXT</span><i />
        <span>单元五还剩最后一个问题，也是最容易被高估的一个。</span>
      </section>
    </article>
  );
}
