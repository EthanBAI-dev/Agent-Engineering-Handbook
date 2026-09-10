# Agent Hands-on Lab · 课程文稿索引

> 状态：00–25 已有草稿，26–30 待写 ｜ 更新时间：2026-09-10

完整 01–30 课程顺序及外部来源映射见 [`course-dev/30-lesson-curriculum-map.md`](../../course-dev/30-lesson-curriculum-map.md)。第 00 课是前言，不计入正式 30 课。

| 课次 | 文稿 | 核心问题 | 实验依据 | 状态 |
| ---: | --- | --- | --- | --- |
| 00 | [总纲与环境配置](00-preface-and-setup.md) | 怎样开始学习并把第一个脚本跑起来？ | `lab/langgraph/README.md`、`pyproject.toml` | 已写 |
| 01 | [图与 State](01-graph-and-state.md) | Agent 为什么会一步步向前执行？ | `01_hello_graph.py` | 已写、已实跑 |
| 02 | [工具循环](02-tool-loop.md) | model 和 tools 怎样形成闭环？ | `02_tool_agent.py` | 已写、真实 LLM 待 Key |
| 03 | [会话记忆](03-memory-and-threads.md) | 同一个 thread 为什么记得？ | `03_memory.py` | 已写、真实 LLM 待 Key |
| 04 | [人工审批](04-human-in-the-loop.md) | 图怎样暂停并等待外部决定？ | `04_human_in_loop.py` | 已写、已实跑 |
| 05 | [完整 Agent 蓝图](05-complete-agent-blueprint.md) | 怎样把前四课拼成一个可信系统？ | 01–04 的编辑整合 | 已写、设计课 |
| 06 | [模型、Prompt 与 Messages](06-model-prompt-messages.md) | 哪些决定归模型，哪些归代码？ | `06_messages.py` | 已写、已实跑 |
| 07 | [安全连接模型 API](07-connect-model-api.md) | 密钥该放在哪一层？ | `_model.py` 报错路径 | 已写、真实调用待 Key |
| 08 | [建立 /api/agent](08-agent-api-and-deploy.md) | 一次请求怎样走完全程？ | 设计稿，未部署 | 已写、未验证 |
| 09 | [Streaming](09-streaming.md) | 该给用户看哪一种事件？ | `09_streaming.py` | 已写、已实跑 |
| 10 | [调用限额与成本](10-quota-and-cost.md) | 谁来让循环停下来？ | `10_budget.py` | 已写、已实跑 |
| 11 | [Router 与结构化输出](11-router-and-structured-output.md) | 分支键能不能信模型？ | `11_router.py` | 已写、已实跑 |
| 12 | [State Schema](12-state-schema.md) | 字段写错了为什么不报错？ | `12_state_schema.py` | 已写、已实跑 |
| 13 | [Reducer 与合并](13-reducers-and-merging.md) | 并行改同一个字段谁说了算？ | `13_reducers.py` | 已写、已实跑 |
| 14 | [上下文管理](14-context-management.md) | 消息太长该丢哪些？ | `14_long_messages.py` | 已写、已实跑 |
| 15 | [持久化会话](15-persistent-sessions.md) | 换个进程还记不记得？ | `15_persistence.py` | 已写、已实跑（含子进程验证） |
| 16 | [审批策略](16-approval-policy.md) | 什么动作必须问人？ | `16_approval_policy.py` | 已写、已实跑 |
| 17 | [人工修改 State](17-edit-state-and-feedback.md) | 方向对但参数不对怎么办？ | `17_edit_state.py` | 已写、已实跑 |
| 18 | [Time Travel](18-time-travel.md) | 能不能回到出错的那一步？ | `18_time_travel.py` | 已写、已实跑 |
| 19 | [Retry 与幂等](19-retry-and-idempotency.md) | 重试会不会扣两次款？ | `19_retry_idempotency.py` | 已写、已实跑 |
| 20 | [可信 Agent 项目](20-trusted-agent-project.md) | 怎样证明它不会做错事？ | `20_trusted_agent.py` | 已写、已实跑（五条验收） |
| 21 | [Parallelization](21-parallelization.md) | 能同时做的为什么在排队？ | `21_parallel.py` | 已写、已实跑（含耗时实测） |
| 22 | [Map-reduce](22-map-reduce.md) | 数量不固定怎么扇出？ | `22_map_reduce.py` | 已写、已实跑 |
| 23 | [Subgraph](23-subgraph.md) | 封装之后 State 怎么对接？ | `23_subgraph.py` | 已写、已实跑 |
| 24 | [Planner–Executor](24-planner-executor.md) | 怎样在动手前审查计划？ | `24_planner_executor.py` | 已写、已实跑 |
| 25 | [Multi-Agent](25-multi-agent.md) | 真的需要第二个 Agent 吗？ | `25_multi_agent.py` | 已写、已实跑 |

## 内容约定

- `00` 集中课程范围、环境配置和密钥安全，后续课不重复安装
- 每课只完整讲授自己拥有的概念，上一课内容只做必要回顾
- 文章中的确定数值必须来自可运行代码
- 第 02、03 课不会在缺少 API Key 时伪造模型输出
- 第 05 课明确标记为编辑综合，不声称存在新的独立源码实验
- 第 06 课起使用 `examples/_fake.py` 的脚本化模型：不需要 API Key，但图是真的在跑
- 第 07、08 课涉及真实 API 与部署，未验证的部分在正文和 frontmatter 里都明确标注
