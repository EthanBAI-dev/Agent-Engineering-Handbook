"use client";

import { ClassifyLab } from "@/components/lab-kit";
import { Prose } from "@/components/auto-term";
import { Callout, Checklist, CodeBlock, Misconceptions, RunLocally, Takeaways } from "@/components/article-kit";

export function LessonThirtyArticle() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 30 · 长期记忆与毕业项目</p>
        <h1>记住这个人，<br />而不只是这段对话。</h1>
        <p className="chapter-dek">第 03、15 课的记忆都绑在 thread 上，换个会话就从头开始。但用户不会觉得「换了个会话」是重新认识一次的理由。</p>
        <div className="chapter-meta"><span>预计 12 分钟</span><span>无需 API</span><span>课程终点</span></div>
      </header>

      <Prose label="只看一句话的话">
        <h2>thread 记的是「这段对话说了什么」，长期记忆记的是「这个人是谁」——两者存在不同的地方。</h2>
        <p className="term-hint">带虚线的词都可以悬停、聚焦或点击查看解释。</p>
      </Prose>

      <Prose label="三层记忆，分别管什么">
        <h2>三层不是替代关系，是叠加。</h2>
        <CodeBlock>{`管什么                      谁负责          哪一课        生命周期
这一次调用带上哪些消息      上下文管理      第 14 课      跑完就不管了
这段对话说了什么            checkpointer    第 03、15 课  按 thread 存，会话结束仍在
这个人是谁                  store           本课          按 user 存，跨所有会话`}</CodeBlock>
        <p><strong>大多数「Agent 忘了」的抱怨，先要判断问的是哪一层。</strong>三层的修法完全不同：第一层改裁剪策略，第二层换持久化后端，第三层要设计存什么。</p>
      </Prose>

      <Prose label="接上 store 只多一个参数">
        <h2>它和 checkpointer 并列，不是替代。</h2>
        <CodeBlock>{`app = graph.compile(checkpointer=InMemorySaver(), store=store)

def recall(state, config, *, store: BaseStore) -> dict:
    user_id = config["configurable"]["user_id"]
    items = store.search(memory_ns(user_id))
    ...`}</CodeBlock>
        <p>注意 <code>user_id</code> 和 <code>thread_id</code> 一样，放在 <code>configurable</code> 里——它是<strong>运行配置</strong>，不是 State 字段。第 29 课那条仍然成立：它必须由服务端填，不能由客户端提供。</p>
      </Prose>

      <Prose label="命名空间带上 user_id">
        <h2>这一行做了两件事，都不是可选项。</h2>
        <CodeBlock>{`def memory_ns(user_id: str) -> tuple[str, ...]:
    return ("users", user_id, "memories")`}</CodeBlock>
        <p><strong>隔离</strong>：bob 搜不到 alice 的命名空间。<strong>删除</strong>：用户要求删除数据时，删掉一个前缀就够了。第二件是法律要求——混在一起存，你永远说不清删干净了没有。</p>
      </Prose>

      <Prose label="回忆 → 回答 → 记住">
        <h2>换个 thread，会话历史没了，但人还记得。</h2>
        <CodeBlock>{`START → recall → respond → remember → END

=== 1. 第一段会话：什么都不知道，然后学到两件事 ===
alice 在 t1 说：我在学 LangGraph，顺便说我喜欢咖啡
  [recall] 关于 alice 已知 0 条：[]
  → （我还不了解你）

=== 2. 换一个 thread：会话历史没了，但人还记得 ===
alice 在 t2 说：还记得我吗
  [recall] 关于 alice 已知 2 条：['喜欢咖啡', '在学 LangGraph']
  → （我记得：喜欢咖啡、在学 LangGraph）

=== 3. 换一个用户 ===
bob 在 t3 说：还记得我吗
  [recall] 关于 bob 已知 0 条：[]
  → （我还不了解你）`}</CodeBlock>
        <p>这就是和第 03 课的区别：thread 换了，checkpoint 是空的，但 store 里关于 alice 的事实还在。而 bob 一条都不该看见——这是第 29 课那条隔离，在长期记忆这一层的落法。</p>
      </Prose>

      <Prose label="同一条事实说三次，只存一条">
        <h2>key 用事实本身。</h2>
        <CodeBlock>{`store.put(memory_ns(user_id), fact, {"fact": fact})   # key 用事实本身

alice 的长期记忆共 2 条：['喜欢咖啡', '在学 LangGraph']`}</CodeBlock>
        <p>说了三次咖啡，只存一条。重复写入就是覆盖——<strong>这是第 19 课的幂等换了个场景</strong>。如果 key 用时间戳或随机 id，记忆库会被同一件事塞满，检索时还要去重。</p>
      </Prose>

      <Prose className="lab-intro" label="三层记忆各管一段">
        <h2>先判断病因在哪一层，再谈修法。</h2>
        <p>下面六种「它忘了」，各自由哪一层负责？判断标准只有一个：<strong>这件事本该存在哪里。</strong></p>
      </Prose>

      <ClassifyLab
        kicker="INTERACTIVE 30"
        title="六种「它忘了」，病因在哪一层"
        storageKey="agent-lab-lesson-30"
        passText="六种都归对了。三层的修法完全不同，先定位再动手"
        prompt={<p>把每种症状归到负责它的那一层。归错了也会显示依据——重点是看出「这件事本该存在哪里」。</p>}
        options={[
          { id: "ctx", label: "上下文管理（第 14 课）" },
          { id: "ckpt", label: "会话记忆 checkpointer（第 03、15 课）" },
          { id: "store", label: "长期记忆 store（本课）" },
        ]}
        items={[
          {
            id: "m1", label: "同一段对话里，二十轮之前提到的订单号它没用上", correct: "ctx",
            why: "对话还在同一个 thread 里，checkpoint 有这条消息。是裁剪策略把它排除在这次调用之外了——改的是「带哪些消息进去」。",
          },
          {
            id: "m2", label: "重启进程后回到同一个会话，它不记得刚才聊到哪", correct: "ckpt",
            why: "同一个 thread 却断了，说明 checkpoint 没落盘。用的是 InMemorySaver——换成第 15 课的 SqliteSaver。",
          },
          {
            id: "m3", label: "换了个新会话，它不知道我喜欢咖啡", correct: "store",
            why: "偏好是「这个人是谁」，不属于任何一段对话。thread 换了 checkpoint 当然是空的——这类事实本来就该存在 store 里。",
          },
          {
            id: "m4", label: "一次调用里消息超了 token 上限，开头的系统约束被截掉了", correct: "ctx",
            why: "存的东西一条没少，是这一次带进去的部分被截了。第 14 课那条：系统约束要固定保留，只裁中间。",
          },
          {
            id: "m5", label: "bob 在自己的新会话里看到了 alice 的偏好", correct: "store",
            why: "跨用户串了，说明命名空间没带 user_id。memory_ns 那一行就是为这件事存在的（第 29 课）。",
          },
          {
            id: "m6", label: "同一件事在记忆库里存了 12 条，检索出来全是重复", correct: "store",
            why: "写入不幂等：key 用了时间戳或随机 id。key 用事实本身，重复写入就是覆盖（第 19 课）。",
          },
        ]}
        note="三层的划分与实跑输出对齐 30_long_term_memory.py；事实提取用关键词而不是模型，为的是可复现。"
        code={{
          summary: "展开三层各自的代码位置",
          text: `# 第一层：这一次调用带上哪些消息（第 14 课）
def build_messages(state):
    return [SYSTEM] + trim(state["messages"], max_tokens=8000)

# 第二层：这段对话说了什么（第 03、15 课）
app = graph.compile(checkpointer=SqliteSaver.from_conn_string("agent.db"))
config = {"configurable": {"thread_id": "t1"}}

# 第三层：这个人是谁（本课）
app = graph.compile(checkpointer=saver, store=store)
config = {"configurable": {"thread_id": "t1", "user_id": "alice"}}

def memory_ns(user_id: str) -> tuple[str, ...]:
    return ("users", user_id, "memories")`,
        }}
      />

      <Prose className="after-lab" label="最难的不是存，是判断">
        <h2>存一条事实是一行代码。</h2>
        <p><strong>什么值得记？</strong>把每句话都记下来，等于没记——检索时全是噪声。通常只记「稳定的、会影响以后回答的」事实：偏好、身份、长期目标。一次性的信息（这次要查的订单号）不该进长期记忆。</p>
        <p><strong>记错了怎么办？</strong>用户换了口味，旧事实要能被覆盖或删除。这意味着提取事实时要考虑「它和已有的哪一条冲突」，而不只是往里加。</p>
        <p><strong>用户要求删除时，你知道该删哪些吗？</strong>命名空间设计决定了这一步做不做得到。</p>
        <Callout title="交给模型之前先想想">
          真实项目里，「什么值得记」通常交给模型判断——那就是又一次模型调用，也就是又一个会出错的地方，还要算进第 10 课的预算。
          <strong>先用规则能解决的部分，剩下的再交给模型。</strong>而且这一步的质量成了变量，要用第 27 课的数据集评估它提取得准不准。
        </Callout>
      </Prose>

      <RunLocally file="lab/langgraph/examples/30_long_term_memory.py" command="uv run python examples/30_long_term_memory.py">
        <strong>不需要 API Key</strong>。跨 thread 记忆、跨用户隔离与重复事实去重都能在输出里直接看到。
      </RunLocally>

      <Prose label="毕业项目">
        <h2>交付验收记录，不是「它能跑」。</h2>
        <p>把三十课装成一个你自己要用的 Agent。八项能力，每一项都要有对应的验收方式：</p>
        <CodeBlock>{`能力                          来自      验收方式
一张能循环的图                01、02    单步执行能说清每一步改了什么
会话记忆，进程重启后还在      03、15    重启进程后接着上次继续
危险操作前人工审批            04、16    批准和拒绝各跑一次
单次请求调用上限              10        失控请求被截断并给出说明
副作用幂等                    19        重复提交只生效一次
输入与工具参数校验            11、28    越界参数被拒绝
用户隔离                      29        两个账号读不到对方的数据
一个五条以上的数据集          27        能说出上次改动修好和弄坏了什么`}</CodeBlock>
      </Prose>

      <Prose label="验收记录长什么样">
        <h2>第四栏最常被漏掉。</h2>
        <CodeBlock>{`输入      ：固定的、可重复的
操作      ：包括人的回答
预期结果  ：状态里该有什么
外部断言  ：外部世界有没有发生变化`}</CodeBlock>
        <p>只检查返回值的验收，挡不住「说了没做」和「说没做却做了」。</p>
        <Checklist
          title="交付前自查"
          items={[
            <>八项能力各有一条可重复的验收记录，四栏都填了</>,
            <>危险操作的批准与拒绝<strong>各跑过一次</strong>，不是只跑通过的那条</>,
            <>重复提交同一个请求，外部世界只变了一次</>,
            <>用第二个账号试过每一个出现 <code>thread_id</code> 的入口</>,
            <>写出了一张「教学版 vs 生产版」的差距表（第 20 课）</>,
          ]}
        />
      </Prose>

      <Prose label="明确写出还没做的部分">
        <h2>这一条和上面同样重要。</h2>
        <p>还没做监控？没做备份？没做速率限制？写下来。<strong>知道自己缺什么的系统，比自以为完整的系统安全得多。</strong></p>
      </Prose>

      <Prose label="三个常见误区">
        <h2>关于长期记忆。</h2>
        <Misconceptions
          items={[
            { claim: "有了 store 就不需要 checkpointer 了", verdict: "三层是叠加", body: <p>store 记的是「这个人是谁」，它不知道你上一句说了什么。两者管的是不同的东西。</p> },
            { claim: "把对话都存进 store，检索的时候再捞", verdict: "会变成噪声", body: <p>长期记忆存的是稳定事实，不是聊天记录。全存进去，检索出来的东西会淹没真正有用的那两条。</p> },
            { claim: "记忆的 key 用时间戳最稳妥", verdict: "会重复", body: <p>key 用事实本身，重复写入就是覆盖。用时间戳的话，同一件事说三次就存三条。</p> },
          ]}
        />
      </Prose>

      <Prose className="after-lab" label="本课带走">
        <h2>三句话。</h2>
        <Takeaways title="第三十课带走" items={["三层记忆是叠加不是替代，先判断「它忘了」属于哪一层", "命名空间带 user_id，既为隔离也为删除", "毕业项目交付的是验收记录，以及一张写清楚还缺什么的表"]} />
      </Prose>

      <section className="chapter-bridge">
        <span>END</span><i />
        <span>三十课到此结束。剩下的部分，写在你那张「还没做」的表上。</span>
      </section>
    </article>
  );
}
