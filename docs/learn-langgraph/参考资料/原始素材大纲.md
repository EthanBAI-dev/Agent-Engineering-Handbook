# 大纲：官方 Introduction to LangGraph（Module 0–6）

下面的模块与小节，逐条对应 `langchain-ai/langchain-academy` 仓库里的 notebook 文件名，
不是我编的目录，是从仓库实际抓下来的。右列是我补的「这一节到底在解决什么问题」。

## Module 0 · Basics

| Notebook | 解决什么问题 |
| --- | --- |
| `basics.ipynb` | 装环境、配 3 个 Key（OpenAI / LangSmith / Tavily），确认能调通模型 |

## Module 1 · 从一个函数到一个 Agent

| Notebook | 解决什么问题 |
| --- | --- |
| `simple-graph.ipynb` | **最重要的一节**。State、Node、Edge、条件边，图到底是什么 |
| `chain.ipynb` | 把消息列表接进图，认识 `MessagesState` 和 `add_messages` reducer |
| `router.ipynb` | 让模型决定「走哪条边」——路由的雏形 |
| `agent.ipynb` | 把路由接回自己，形成 ReAct 循环：思考 → 调工具 → 再思考 |
| `agent-memory.ipynb` | 加 checkpointer，让 Agent 记得住上一轮 |
| `deployment.ipynb` | 第一次把图跑成服务 |

## Module 2 · 状态与记忆（大多数人真正卡住的地方）

| Notebook | 解决什么问题 |
| --- | --- |
| `state-schema.ipynb` | State 可以是 TypedDict / dataclass / Pydantic，各有什么代价 |
| `state-reducers.ipynb` | **关键概念**。节点返回值是覆盖还是合并，由 reducer 决定 |
| `multiple-schemas.ipynb` | 输入 schema、输出 schema、内部 schema 分开，避免把脏数据暴露出去 |
| `trim-filter-messages.ipynb` | 上下文窗口撑爆了怎么办：裁剪与过滤 |
| `chatbot-summarization.ipynb` | 用「摘要」代替全量历史，长对话不炸 |
| `chatbot-external-memory.ipynb` | 记忆落到外部数据库（SQLite/Postgres），进程重启也还在 |

## Module 3 · 人在环里（Human-in-the-loop）

| Notebook | 解决什么问题 |
| --- | --- |
| `streaming-interruption.ipynb` | 流式输出：token 级、状态级两种流 |
| `breakpoints.ipynb` | 在指定节点前停下来，等人批准 |
| `edit-state-human-feedback.ipynb` | 停下来之后，人直接改状态再继续 |
| `dynamic-breakpoints.ipynb` | 由代码条件决定要不要停（比如金额 > 1000 才要人批） |
| `time-travel.ipynb` | 回到任意一个历史存档点，换个决策重跑 |

## Module 4 · 并行与多智能体

| Notebook | 解决什么问题 |
| --- | --- |
| `parallelization.ipynb` | 多个节点同时跑，结果怎么合并（又回到 reducer） |
| `sub-graph.ipynb` | 图里套图，把复杂系统拆成模块 |
| `map-reduce.ipynb` | 用 `Send` 动态扇出 N 个任务再收拢 |
| `research-assistant.ipynb` | **本课程的毕业设计**：多角色研究助手 |

## Module 5 · 长期记忆

| Notebook | 解决什么问题 |
| --- | --- |
| `memory_store.ipynb` | Store：跨会话的长期记忆，区别于 checkpointer 的「单线程存档」 |
| `memoryschema_profile.ipynb` | 把用户画像存成结构化 profile |
| `memoryschema_collection.ipynb` | 存成可增长的集合（记忆条目） |
| `memory_agent.ipynb` | Agent 自己决定「什么值得记下来」 |

## Module 6 · 部署

| Notebook | 解决什么问题 |
| --- | --- |
| `creating.ipynb` | 创建一个 LangGraph Platform 部署 |
| `connecting.ipynb` | 用 SDK 连上去调用 |
| `assistant.ipynb` | 同一张图配不同参数 = 不同 Assistant |
| `double-texting.ipynb` | 用户连发两条消息怎么处理（打断 / 排队 / 合并） |

---

# 我的 4 周排期

每周 4 次，每次 60–90 分钟。**每次结束必须往 `NOTES.md` 写一条。**

| 周 | 内容 | 产出物 |
| --- | --- | --- |
| **W1** | 先看 DeepLearning.AI 短课（1.5h）建立直觉；然后 Module 0 + Module 1 全部 | 一个能调工具、有记忆的 ReAct Agent |
| **W2** | Module 2 全部 + Module 3 前三节 | 一个长对话不炸、能被人打断批准的助手 |
| **W3** | Module 3 剩余 + Module 4 全部 | 跑通 `research-assistant`，并改成自己的题目 |
| **W4** | Module 5 + Module 6 | 部署一个自己的 Agent，能通过 API 调用 |

**验收标准**（做不到就别往下走）：

- W1 末：不看教程，白纸上手写出 `StateGraph` → `add_node` → `add_edge` → `compile` 四步。
- W2 末：能讲清楚「reducer 是什么，不写 reducer 会发生什么」。
- W3 末：能讲清楚 checkpointer / Store / thread_id 三者的区别。
- W4 末：有一个部署在线、别人能调的 Agent。

## 从第 1 课开始

→ [`lesson-01.md`](lesson-01.md)
