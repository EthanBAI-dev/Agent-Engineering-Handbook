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

## 2026-09-09 · Q&A · 想搞多 Agent，学习路线是什么？

**问题**

目标是多 agent 系统，路线怎么排？

**先记一条反直觉的结论**

多 agent 不是起点是终点。**大多数多 agent 项目失败不是编排写得差，是根本不该拆**——
agent 之间传的是压缩过的文本，上下文一路损耗，一个强单体 + 好的上下文管理
常常打得过五个协作的弱 agent。所以路线前半段全在练单体，这不是绕路。

**三层地基（跳过必翻车）**

| 层 | 内容 | 为什么是前置 |
| --- | --- | --- |
| 状态 | reducer、多 schema 隔离 | 多 agent 本质是**多个写者写同一份 state**，reducer 决定它们打不打架 |
| 控制流 | 条件边、`Command`、子图、`Send` | 「交接」不是概念，就是 `Command(goto=...)` 一行 |
| 可观测 | LangSmith 追踪 | 单 agent 出错还能猜，五个 agent 出错不看 trace 就是抓瞎 |

**路线表**

| 阶段 | 学什么 | 资源 |
| --- | --- | --- |
| 0 | 单 agent 打穿：ReAct、checkpointer、interrupt | Academy M1–M3 |
| 1 | 并行 + 合流 | M4 `parallelization` |
| 2 | **子图（分水岭）** | M4 `sub-graph` |
| 3 | `Send` 动态扇出 map-reduce | M4 `map-reduce` |
| 4 | 完整多角色系统 | M4 `research-assistant` |
| 5 | Supervisor 架构 | `langgraph-supervisor` |
| 6 | Swarm 架构 | `langgraph-swarm-py` |
| 7 | Deep Agents（规划 + 子 agent + 虚拟文件系统） | `langchain-ai/deepagents` |
| 8 | 评测 | Academy `Deep Research with LangGraph` |

**阶段 2 是分水岭**：想通「一个 agent 就是一个能当节点用的子图」，后面全是配方问题。

**Supervisor vs Swarm**

- Supervisor：中央主管路由，每轮回主管。**准但慢**（多一次 LLM 调用），职责清楚。**先学这个**，好定位问题。
- Swarm：agent 之间直接交接（`Command(goto=..., graph=Command.PARENT)`）。**快、LLM 调用少**
  （有团队实测端到端降约 40%），但错了不好查。
- 判据：**瓶颈是延迟 → swarm；瓶颈是路由错 → supervisor。**

**Deep Agents**

官方重型 agent 骨架，跑在 LangGraph runtime 上，打包了规划（`write_todos`）、子 agent、
**虚拟文件系统**。第三样最关键：用文件卸载大块结果，子 agent 之间传引用而非对话历史，
正好治上面说的上下文损耗。任务步数 >10、需长期规划的场景直接上，别从零编排。

**四个坑**

1. 过早拆分——先把单 agent 做到明显不够用再拆。
2. 所有 agent 共写一份大 state——用多 schema 隔离，各看各的。
3. 靠对话历史传中间结果——大结果落文件/store，只传引用。
4. 没 baseline 就说「多 agent 更好」——拆之前先建评测。

**结论**

> **多 agent = 子图 + reducer + Command 交接，没有第四样东西。**
> 三样都在 Module 4，M1–M3 是为了让你看懂它们。先把单 agent 榨干，再拆。

**待查**

- `langgraph-supervisor` / `langgraph-swarm-py` 在 1.x 下的维护状态与最新用法，学到阶段 5 时实跑确认。
- Deep Agents 的虚拟文件系统与 LangGraph Store（Module 5 长期记忆）是什么关系，能否互替？

---

## 2026-09-09 · Q&A · 学 agent 应用，先学 agent 还是直接学 harness？

**问题**

目标是做 agent 应用。是先学 agent 机制再学 harness，还是直接上 harness？

**结论**

**先学 agent，再学 harness。但「先」只需要一两周，不是三个月。**

**为什么不能直接上 harness**

harness 里每一个特性，都是对 agent 循环某个具体痛点的回应：

| harness 特性 | 解决的痛点 |
| --- | --- |
| 待办清单 | 任务一长就忘了要干嘛，做到一半跑偏 |
| 虚拟文件系统 | 工具返回一大坨全塞进对话，两轮撑爆上下文 |
| 子 agent | 一个循环塞五种职责，提示词互相打架 |
| 权限确认 | 它真把文件删了 |
| 可恢复 | 跑到第 40 步崩了，前面全白跑 |

**没撞过墙就学 harness = 背药品说明书但从没生过病。**

**反过来的坑更常见**

多数人在「学 agent」这层泡三个月，刷完五门课三个框架，什么都没做出来。
**agent 核心机制很小**：调模型 → 看要不要调工具 → 调工具 → 结果塞回去 → 再调。
50 行，一天写完。**剩下的复杂度全在 harness 层，那才是真正的工程和产品价值。**

**具体方法**

| 阶段 | 做什么 | 关键 |
| --- | --- | --- |
| 第 0 周（全程并行） | 当重度用户，每天用现成 harness 干真活 | 免费、不可替代，多数人跳过。见过好的才做得出好的 |
| 第 1 周 | 手写 50 行 agent，零框架 | 做完即理解本质 |
| **第 2–4 周** | **故意把它用崩，记录每个痛点** | **最关键也最常被跳过的阶段。这份清单是后面所有学习的地图** |
| 第 5–8 周 | 用 LangGraph 逐个解决痛点 | 每一课变成「有的放矢」而非「又一个新概念」 |
| 第 9 周起 | 读 harness 源码 | 看什么都是「原来是这么解的」 |

**前提**

**先选一个自己真需要的任务**，不是练习题。没有真需求就撞不出墙——因为不会真的用。
整套方法的发动机是真需求，不是课程进度。

**例外**

目标是尽快交付而非搞懂 → 直接用现成 harness + MCP + skills 拼，别自己写循环。
这条路正当，只是天花板取决于现成 harness 的边界，碰到边界时再回来补第 1–4 周。

**一句话**

> **agent 的机制要「写过」，harness 的设计要「疼过」。**
> 写只要一周，疼要三周，之后每一课都会变容易。直接学 harness 不是学得快，是学了个寂寞。

**对课程的影响（待办）**

- 脉络表应在第 05 讲（ReAct 循环）之前插入一讲「不用框架手写 agent」，编号顺延。
  这一讲的价值可能比后面二十讲加起来都高。
- 课程定位应是「用 LangGraph 讲清楚 agent 工程」，不是「LangGraph 说明书」。

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
