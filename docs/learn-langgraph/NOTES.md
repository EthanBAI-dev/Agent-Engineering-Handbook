# 学习笔记 · LangGraph

**每上完一节课追加一条。** 格式固定，不写就不算学完。

```
## [日期] 第 N 课 · 标题
**学到什么**（≤3 条）
**卡在哪**（原始报错 + 怎么解决的）
**结论 / 能对别人讲的一句话**
**待查**（没搞懂的，留着下次回来看）
```

---

## 2026-09-09 · 第 0 步 · 选路线

**学到什么**

1. 主线定了：官方 `langchain-ai/langchain-academy`，Module 0–6，共 30 个 notebook，免费。
   选它的唯一硬理由是**它跟着版本更新**（仓库 2026-06 还在动，依赖已经是 v1 时代）。
2. LangChain / LangGraph 在 2025-10 双双发 1.0，承诺 2.0 前不再破坏性变更。
   `langgraph.prebuilt` 废弃，能力搬到 `langchain.agents`（`create_agent`）。
3. 网上多数中文 LangGraph 教程停在 2024 年的 v0 写法，**不能直接抄**。

**卡在哪**

- `academy.langchain.com`、`docs.langchain.com`、`deeplearning.ai` 在本机网络策略下打不开，
  改成直接 clone GitHub 仓库、从 notebook 里抽标题拿到的真实大纲。**代码仓库比课程页面更可靠。**

**结论**

> 学 LangGraph 不要挑教程，挑**有配套代码仓库、且最近半年还在更新**的那一个。

**待查**

- Academy 的 Ambient Agents / Deep Research 两门项目课是否收费，官网打不开，学完主线再确认。

---

## 2026-09-09 · 第 1 课 · 最小图 + 记忆与中断

**学到什么**

1. 一张图 = State（共享白板）+ Node（普通函数，只返回要改的字段）+ Edge。
   条件边的函数**返回的是下一个节点的名字，不是状态**——这是最容易搞混的一处。
2. **Reducer 决定字段是覆盖还是合并。** 不写 `Annotated[list, operator.add]`，
   列表字段就只剩最后一个节点写的那一份。后面的 `add_messages` 就是这个东西的加强版。
3. **checkpointer 是一切「高级功能」的地基。** 记忆、`interrupt` 中断恢复、时间旅行，
   三个能力全部建立在「每一步都存档」之上。没有 checkpointer 一个都做不了。
   `thread_id` 则是会话的身份证，换 id = 换一份记忆。

**卡在哪**

- `graph.get_graph().draw_ascii()` 报 `ImportError: Install grandalf`。
  → 改用 `draw_mermaid()`，零依赖，输出 Mermaid 源码，正好能直接进文档。
- 原以为递归上限是 25，**实测 langgraph 1.2.11 上是 10007**。
  教训：版本相关的数字一律以本机实跑为准，不引用记忆里的值。

**结论**

> LangGraph 的价值是把「状态」和「控制流」从模型手里拿回到你手里。
> 模型只在某个节点里做判断；走哪条边、存什么、什么时候停下来问人，都由你写死。

**待查**

- `InMemorySaver` 换成 SQLite/Postgres saver 后，`get_state_history` 的性能如何？（Module 2 最后一节）
- 并行节点同时写同一个字段时，reducer 的执行顺序是否确定？（Module 4 `parallelization` 再看）

---

## 2026-09-09 · Q&A · 学 LangChain 还是学 LangGraph？

**问题**

两个库到底该学哪个，还是都要学？

**结论（不是二选一）**

2025-10 两库同发 1.0 之后，它们是一层套一层的关系，不是并列选项：

```
你的 Agent → langchain.agents.create_agent（高层 ReAct 封装）
           → LangGraph durable runtime（状态/存档/中断/恢复）
```

`create_agent` 就跑在 LangGraph 的 runtime 上；原 `langgraph.prebuilt` 废弃后
能力反向搬进了 `langchain.agents`。**两边在合流，不在竞争。**

**所以顺序是：LangGraph 优先，LangChain 按需查。**

| 阶段 | 学什么 | 投入 |
| --- | --- | --- |
| 1 | LangGraph 裸图：State / 条件边 / reducer / checkpointer / interrupt | 1–2 周 |
| 2 | LangChain 接口层：`ChatOpenAI`、`@tool`、`MessagesState`、结构化输出 | 边做边查，不专门学 |
| 3 | `create_agent` | 半天，本质是把你已会手写的循环包一层 |
| 4 | LangSmith 追踪 + 评测 | 越早接越好 |

理由：`create_agent` 是一行搞定的黑盒，但只要碰到**人工审批、上下文控制、并行/多智能体、
调试跑飞的 Agent**，就必须下沉到图这一层。**先学黑盒再拆黑盒，比先懂机制再用封装痛苦得多。**

**例外**

需求只是「能调工具的聊天机器人」→ 直接 `create_agent`，别学图。
LangGraph 的复杂度只在需要控制流时才回本。

> LangChain 是**接口层**，查着用就行；LangGraph 是**运行时**，是真正要理解的东西。
> 学 LangGraph 顺手就把 LangChain 用会了，反过来不成立。

**待查**

- `create_agent` 的中间件/钩子机制能覆盖到哪一步？超出后是不是只能改回裸图重写？（学完 Module 3 再验证）

---

## 模板（复制下面这段开新条目）

```
## [日期] 第 N 课 · 标题

**学到什么**
1.
2.
3.

**卡在哪**
-

**结论**
>

**待查**
-
```
