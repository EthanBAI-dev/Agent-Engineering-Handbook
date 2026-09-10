# Agent Hands-on Lab · 00–05 文稿索引

> 状态：第一轮完整草稿 ｜ 更新时间：2026-09-10

完整 01–30 课程顺序及外部来源映射见 [`course-dev/30-lesson-curriculum-map.md`](../../course-dev/30-lesson-curriculum-map.md)。第 00 课是前言，不计入正式 30 课。

| 课次 | 文稿 | 核心问题 | 实验依据 | 状态 |
| ---: | --- | --- | --- | --- |
| 00 | [总纲与环境配置](00-preface-and-setup.md) | 怎样开始学习并把第一个脚本跑起来？ | `lab/langgraph/README.md`、`pyproject.toml` | 已写 |
| 01 | [图与 State](01-graph-and-state.md) | Agent 为什么会一步步向前执行？ | `01_hello_graph.py` | 已写、已实跑 |
| 02 | [工具循环](02-tool-loop.md) | model 和 tools 怎样形成闭环？ | `02_tool_agent.py` | 已写、真实 LLM 待 Key |
| 03 | [会话记忆](03-memory-and-threads.md) | 同一个 thread 为什么记得？ | `03_memory.py` | 已写、真实 LLM 待 Key |
| 04 | [人工审批](04-human-in-the-loop.md) | 图怎样暂停并等待外部决定？ | `04_human_in_loop.py` | 已写、已实跑 |
| 05 | [完整 Agent 蓝图](05-complete-agent-blueprint.md) | 怎样把前四课拼成一个可信系统？ | 01–04 的编辑整合 | 已写、设计课 |

## 内容约定

- `00` 集中课程范围、环境配置和密钥安全，后续课不重复安装
- 每课只完整讲授自己拥有的概念，上一课内容只做必要回顾
- 文章中的确定数值必须来自可运行代码
- 第 02、03 课不会在缺少 API Key 时伪造模型输出
- 第 05 课明确标记为编辑综合，不声称存在新的独立源码实验
