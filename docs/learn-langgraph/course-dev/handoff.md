# 交接清单

## 已完成

| 文件 | 状态 |
| --- | --- |
| `00-resources.md` | ✅ 资源调研，主线定为官方 langchain-academy |
| `01-syllabus.md` | ✅ 从仓库 30 个 notebook 还原的真实大纲 + 4 周排期 |
| `lesson-00-setup.md` | ✅ 零基础环境课（Windows 为主），含第二阶段环境 |
| `lesson-01.md` | ✅ 已去重，环境部分指回 L0 |
| `code/l01_simple_graph.py` | ✅ 实跑通过 |
| `code/l02_state_memory.py` | ✅ 实跑通过 |
| `NOTES.md` | ✅ 学习笔记 + 两条 Q&A |
| `course-dev/curriculum-spine.md` | ✅ 骨架 + 概念归属地图 |

## 下一步：写 L2

**动手前必须先做的事（顺序不能换）：**

1. 读 `course-dev/curriculum-spine.md` 的概念归属地图，确认 L2 只讲 ReAct 循环，
   **不重复 reducer / checkpointer 的完整定义**。
2. 写 L2 的 lesson brief（模板见骨架文件第五节），brief 跟骨架对齐了才能动笔。
3. **先写代码并实跑，再把输出抄进课文。** 顺序反了就是编数据。

**L2 的技术难点**：需要模型 Key。设计成双路——
有 `OPENAI_API_KEY` 跑真模型，没有则用假模型（fake chat model）跑通逻辑，
保证零成本也能学完。

**验证命令**：

```
cd docs/learn-langgraph
python code/l01_simple_graph.py     # 应输出两条不同分支
python code/l02_state_memory.py     # 应先停在 interrupt，resume 后跑完
```

## 已经定下、不要再改的决定

- 主线是官方 `langchain-academy`，不换。
- 环境课以 **Windows** 为主，Mac 放在「特殊情况」一节。（依据：用户环境为 Windows）
- L0 和 L1 都不需要 API Key，零成本。Key 推迟到第二阶段。
- 版本相关的数字**一律以本机实跑为准**，不引用记忆值（已在递归上限上栽过一次）。

## 不要覆盖的文件

- `code/` 下两个脚本已实跑验证，输出被课文引用。**改动后必须重跑并同步课文里的输出。**
- `NOTES.md` 是学习者本人的笔记，**只追加，不重写已有条目**。

## 已知风险

- `academy.langchain.com` / `docs.langchain.com` / `deeplearning.ai` 在当前网络策略下不可达，
  大纲是从 GitHub 仓库还原的。**如需核对课程页面，得换个网络环境。**
- `langgraph-supervisor` / `langgraph-swarm-py` 在 1.x 下的维护状态未实测，
  写到多 agent 那几课之前必须先验证。
