# LangGraph 学习轨道

一条「先跑通、再补课、最后做项目」的 LangGraph 入门路线。
资源全部来自欧美一手教学材料，每节课都有可直接 `python xxx.py` 跑起来的代码。

| 文件 | 作用 |
| --- | --- |
| [`00-resources.md`](00-resources.md) | 欧美课程调研与横向对比，以及为什么选这条主线 |
| [`01-syllabus.md`](01-syllabus.md) | 官方大纲逐节还原 + 我的 4 周排期表 |
| [`lesson-01.md`](lesson-01.md) | **手把手第 1 课**：环境 + 最小图 + 记忆与中断 |
| [`NOTES.md`](NOTES.md) | 学习笔记：每节的总结、卡住的问题、踩过的坑 |
| [`code/`](code/) | 每课配套代码，已在 Python 3.11 + langgraph 1.2.11 实跑通过 |

## 一句话结论

**主线用官方的 `langchain-ai/langchain-academy`（Module 0–6，免费、代码开源、跟着 v1 更新）。**
DeepLearning.AI 的 4 小时短课用来开胃，freeCodeCamp 的长视频用来查漏。

## 三条铁律

1. **不看完再动手，边看边敲。** 每节课先跑通代码，再回头读解释。
2. **每节课写一条笔记进 `NOTES.md`。** 格式：学到什么 / 卡在哪 / 结论。
3. **不抄 v0 代码。** 2025 年 10 月 LangChain 与 LangGraph 双双发布 1.0，
   `langgraph.prebuilt` 已废弃，能力搬到了 `langchain.agents`。
   网上 2024 年的教程大量是旧 API，照抄会跑不通。

## 环境基线（本轨道全程使用）

- Python 3.11 / 3.12 / 3.13
- `langgraph` 1.2.x
- 第 1 课**不需要任何 API Key**，从第 3 课开始才需要模型
