# Agent Hands-on Lab · 课程文稿索引

> 状态：00–10 已有草稿，11–30 待写 ｜ 更新时间：2026-09-10

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

## 内容约定

- `00` 集中课程范围、环境配置和密钥安全，后续课不重复安装
- 每课只完整讲授自己拥有的概念，上一课内容只做必要回顾
- 文章中的确定数值必须来自可运行代码
- 第 02、03 课不会在缺少 API Key 时伪造模型输出
- 第 05 课明确标记为编辑综合，不声称存在新的独立源码实验
- 第 06 课起使用 `examples/_fake.py` 的脚本化模型：不需要 API Key，但图是真的在跑
- 第 07、08 课涉及真实 API 与部署，未验证的部分在正文和 frontmatter 里都明确标注
