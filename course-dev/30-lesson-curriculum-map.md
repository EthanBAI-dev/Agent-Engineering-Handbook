# Agent Hands-on Lab · 30 课课程地图与来源说明

> 版本：2026-09-10 ｜ 第 00 课为前言，不计入第 01–30 课

> 完成状态：00–20 已有 Markdown 初稿。06、09–20 附可实跑实验（无需 API Key，需要模型的地方用 `_fake.py` 脚本化模型）；07 仅报错路径已验证；08 为未部署的设计稿。21–30 目前是经过来源映射的课程计划，还没有写成正文。

## 先说清楚：这 30 课从哪里来

“30 课”是本项目选定的课程容量，不是某个外部课程原封不动的课数，也不是从一份目录机械拆分出来的。

课程主骨架来自 LangChain Academy 的官方 LangGraph 课程；实践项目顺序参考 DeepLearning.AI；入门和结课闭环参考 Hugging Face；设计模式、可信性和生产化范围参考 Microsoft。每一课还必须以 LangGraph 官方文档和本仓库可运行代码校验，不能只凭二手教程写作。

本项目的原创部分是：面向中文初学者重新排序；先做无 API 的确定性动画；每课使用“读、动、改、证”；把同一份 State、消息或 checkpoint 同时画出来；再逐步接入真实 API、限额、账号、数据库和长期记忆。

## 参考课程与各自承担的角色

| ID | 参考来源 | 我们借鉴什么 | 不直接照搬什么 |
| --- | --- | --- | --- |
| A | [LangChain Academy：Introduction to LangGraph](https://academy.langchain.com/courses/intro-to-langgraph) | Simple Graph、Router、Agent、State/Reducer、Memory、HITL、并行、子图、Map-reduce、长期记忆、部署的主顺序 | 55 个视频单元的粒度和 LangSmith 托管路径 |
| B | [DeepLearning.AI：AI Agents in LangGraph](https://www.deeplearning.ai/courses/ai-agents-in-langgraph) | 从零理解 Agent、LangGraph 组件、搜索工具、持久化、HITL、Essay Writer 综合项目 | 1.5 小时中级 Python 课程的节奏 |
| C | [Hugging Face Agents Course](https://huggingface.co/learn/agents-course/en/unit0/introduction) | Onboarding → Agent Fundamentals → Frameworks → Use Cases → Final Project，以及小测和作品证明 | 多框架横向教学和认证机制 |
| D | [Microsoft AI Agents for Beginners](https://github.com/microsoft/ai-agents-for-beginners) | Tool Use、RAG、Planning、Multi-Agent、Trustworthy、Production、Context、Memory、Security | Azure 与 Microsoft Agent Framework 的特定实现 |
| E | [LangGraph 官方文档](https://docs.langchain.com/oss/python/langgraph/overview) | 当前 API 语义、能力边界和生产注意事项 | 把文档章节直接当成初学者课程 |
| L | `lab/langgraph/` 本地实验 | 00–04 的命令、代码和可复现实验结果 | 未运行、无来源的“看起来合理”示例 |

## 为什么这样排序

课程遵循一条难度曲线：

```text
看懂确定性流程
  → 接入真实模型与 `/api/agent`
  → 部署并限制调用成本
  → 保存和控制运行状态
  → 处理复杂工作流
  → 加上搜索、评测和安全
  → 最后加入账号、数据库与长期记忆
```

这条顺序同时服从产品路线：先做不需要 API 的流程动画；再加入 `/api/agent` 和真实 Python LangGraph；再加入调用限额；最后加入账号、数据库和长期记忆。

## 单元一：先看懂 Agent 怎样运行（01–05，无 API 动画优先）

| 课 | 标题 | 本课唯一主概念 | 主要来源 | 学习者证据 |
| ---: | --- | --- | --- | --- |
| 01 | 图、State、Node 与 Edge | 最小状态图 | A：Simple Graph；E：Graph API；L01 | 改变阈值并正确预测节点次数 |
| 02 | 工具调用与 ReAct 循环 | `model ⇄ tools` | A：Agent；B：Agent from Scratch；C：Tools/Actions；L02 | 找出闭合工具循环的回边 |
| 03 | Thread、Checkpoint 与会话记忆 | thread 级持久化 | A：Agent with Memory；B：Persistence；L03 | 解释同 thread 记得、换 thread 忘记 |
| 04 | Interrupt、Resume 与人工审批 | 动态暂停和恢复 | A：Dynamic Breakpoints；B：HITL；L04 | 分别批准和拒绝危险操作 |
| 05 | 拼出第一个完整 Agent 蓝图 | 四部分组合与边界 | B：综合项目方法；C：Use Case | 交付含工具、记忆和审批的蓝图 |

## 单元二：接入真实模型（06–10）

| 课 | 标题 | 本课唯一主概念 | 主要来源 | 学习者证据 |
| ---: | --- | --- | --- | --- |
| 06 | 模型、Prompt 与 Messages | 模型和编排器的职责边界 | B：Agent from Scratch；C：LLM/Messages | 能指出哪些决定属于模型、哪些属于代码 |
| 07 | 安全连接第一个模型 API | 服务端密钥与真实调用 | A：Chain/Agent；E：模型集成 | API Key 不进入浏览器，完成一次真实回答 |
| 08 | 建立 `/api/agent` 并部署到 Vercel | 网页到 Python LangGraph API | A：Deployment；D：Deploying Agents | 获得可访问的 HTTPS Agent 接口 |
| 09 | Streaming：让用户看见 Agent 正在做什么 | 流式事件 | A：Streaming；B：Persistence and Streaming | 页面逐步显示 token、节点和工具事件 |
| 10 | 调用限额、成本与第一个在线 Agent | 资源配额 | D：Production/Security；C：Use Case | 超限请求被拒绝，正常请求可完成 |

## 单元三：把 State 和短期记忆做扎实（11–15）

| 课 | 标题 | 本课唯一主概念 | 主要来源 | 学习者证据 |
| ---: | --- | --- | --- | --- |
| 11 | Router 与结构化输出 | 可验证的分支选择 | A：Router；E：Graph API | 三类请求进入正确分支 |
| 12 | State Schema：给状态定合同 | typed state schema | A：State Schema / Multiple Schemas | 错误字段能被发现，输入输出边界清楚 |
| 13 | Reducer：并行更新怎样合并 | 状态合并规则 | A：State Reducers | 比较覆盖、追加和自定义 reducer |
| 14 | 消息太长怎么办 | trim、filter、summarize | A：Trim/Filter/Summarizing | 在预算内保留关键上下文 |
| 15 | 持久化会话项目 | 外部 checkpointer 与恢复 | A：Chatbot with Memory；B：Persistence；E：Persistence | 进程重启后恢复并切换两个 thread |

## 单元四：让 Agent 可控、可恢复（16–20）

| 课 | 标题 | 本课唯一主概念 | 主要来源 | 学习者证据 |
| ---: | --- | --- | --- | --- |
| 16 | 审批策略：什么动作必须问人 | 风险分级 | A：Breakpoints；D：Trustworthy Agents | 为工具表配置自动/审批/禁止策略 |
| 17 | 人工修改 State 与反馈 | 审批时编辑输入 | A：Editing State and Human Feedback | 修改参数后从 checkpoint 继续 |
| 18 | Time Travel：回到旧状态再走一遍 | replay 与 fork | A：Time Travel；E：Persistence | 从旧 checkpoint 分叉出另一结果 |
| 19 | Retry、错误节点与幂等性 | 可恢复副作用 | E：Durable Execution；D：Production | 重试不会重复扣款或重复写入 |
| 20 | 项目：可信文件整理 Agent | 可控工作流验收 | D：Trustworthy/Security；L01–L04 | 通过批准、拒绝、失败恢复三条测试 |

## 单元五：复杂任务怎样拆开（21–25）

| 课 | 标题 | 本课唯一主概念 | 主要来源 | 学习者证据 |
| ---: | --- | --- | --- | --- |
| 21 | Parallelization：能同时做的不要排队 | 并行分支 | A：Parallelization | 比较串行与并行的事件时间线 |
| 22 | Map-reduce：批量处理再汇总 | 扇出与汇聚 | A：Map-reduce | 并行分析多份材料并生成总览 |
| 23 | Subgraph：把复杂图拆成部件 | 子图边界 | A：Sub-graphs | 将审批子流程封装并复用 |
| 24 | Planner–Executor：先规划再执行 | 规划模式 | D：Planning；B：Essay Writer | 计划可检查，失败后能重新规划 |
| 25 | Multi-Agent：什么时候才需要多个 Agent | 角色协作与交接 | D：Multi-Agent | 证明多 Agent 比单图更合适或更不合适 |

## 单元六：把教程 Agent 变成网站产品（26–30）

| 课 | 标题 | 本课唯一主概念 | 主要来源 | 学习者证据 |
| ---: | --- | --- | --- | --- |
| 26 | Search 与 Agentic RAG | 外部知识检索 | B：Agentic Search；D：Agentic RAG | 回答带来源，检索失败时不编造 |
| 27 | 测试、Evaluation 与 Observability | 运行质量证据 | C：Final Project/Bonus Eval；D：Production | 建立数据集并定位一次失败路径 |
| 28 | 工具权限、提示注入与安全边界 | 最小权限和不可信输入 | D：Trustworthy/Security | 越权工具调用与恶意内容被阻止 |
| 29 | 账号、身份与数据隔离 | 用户边界 | D：Production/Security | 两个账号无法读取对方的 thread |
| 30 | 数据库、长期记忆与毕业项目 | 跨 thread 的用户记忆 | A：Long-Term Memory / Store；D：Memory | 登录后跨会话记住资料，并通过最终验收 |

## 00–05 是否按这张地图写了

是，但要分清“概念顺序”和“文章事实来源”。

- 概念顺序与 A、B 的基础主线一致：Simple Graph → Agent/Tools → Persistence/Memory → HITL → 综合项目。
- 具体代码、命令和预期输出以 L01–L04 为准，因此文章不会假装复现外部课程的私有代码。
- 05 是编辑综合课，没有伪造一份不存在的独立实验；它只组合 01–04 已经验证的部件。
- 互动方式来自本项目，不来自上述课程：每次点一步，同时展示当前节点、消息和 State diff。

## 后续每课开写前的硬规则

1. 先给该课指定一个“唯一主概念”，避免 30 课反复讲同一件事。
2. 至少绑定一个官方来源；涉及版本行为时重新核对当前 LangGraph 文档。
3. 先写实验契约：输入、固定项、操作、预期输出和通过条件。
4. 真实 API 未运行就明确写“未验证”，不能把示意结果写成实测。
5. 每课必须留下学习者作品或可检查结果，不以“读完了”作为完成标准。
