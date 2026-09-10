# LangGraph 实验室

> 从零学 LangGraph 的代码区。四课，每课一个可跑的文件，从「图是什么」到「Agent 停下来等人审批」。
> 环境搭建日期：2026-09-09 ｜ langgraph **1.2.11**

学习过程、真实问题和踩坑统一记录在 [`course-dev/conversation-log.md`](../../course-dev/conversation-log.md)。

## 环境

已装好，不用再折腾：

| 组件 | 版本 |
| --- | --- |
| Python | 3.12.10 |
| uv | 0.11.3 |
| langgraph | 1.2.11 |
| langchain-anthropic | 已装 |

```bash
cd lab/langgraph
cp .env.example .env     # 填 ANTHROPIC_API_KEY
uv run python examples/01_hello_graph.py
```

`uv run` 会自己按 `pyproject.toml` 装依赖并用项目的 venv，**不需要手动 activate**。

## 四课

| 文件 | 学什么 | 要 API key |
| --- | --- | --- |
| [`01_hello_graph.py`](examples/01_hello_graph.py) | State / Node / Edge，条件边如何造出循环，**reducer 为什么是核心** | 否 |
| [`02_tool_agent.py`](examples/02_tool_agent.py) | 手写 ReAct 循环：`model → tools → model`。最后给出 prebuilt 等价写法 | 是 |
| [`03_memory.py`](examples/03_memory.py) | checkpointer + `thread_id`，Agent 为什么会忘、怎么让它记住 | 是 |
| [`04_human_in_loop.py`](examples/04_human_in_loop.py) | `interrupt()` / `Command(resume=)`，危险操作前暂停等人点头 | 否 |
| [`06_messages.py`](examples/06_messages.py) | 消息类型、Prompt 到底是什么，**哪些决定归模型、哪些归代码** | 否 |
| [`09_streaming.py`](examples/09_streaming.py) | 三种 `stream_mode` 的区别，以及 `messages` 流为什么必须按节点过滤 | 否 |
| [`10_budget.py`](examples/10_budget.py) | 单次请求的调用上限：模型不会自己停 | 否 |

建议顺序就是 01 → 04。**别跳过 01** —— 02 之后的一切都只是给 01 那张图加节点。

## 无需 API Key 的脚本化模型

[`_fake.py`](examples/_fake.py) 提供 `ScriptedModel`：你提前写好它每一轮返回什么，
图的其余部分——节点、条件边、`ToolNode`、`checkpointer`——全都是真的 LangGraph 在跑。

课程规则是「文章里的确定数值必须来自可运行代码」，但第一阶段又不接真实模型 API。
这个模型就是两者的交集：它不模拟智能，只让「图怎样运转」可以被反复验证。

```python
from _fake import ScriptedModel, ai, ai_tool_call

model = ScriptedModel(script=[
    ai_tool_call("add", {"a": 128, "b": 349}),
    ai("128 + 349 = 477。"),
]).bind_tools(TOOLS)
```

两个设计选择值得说明：

- **剧本用完就报错**（`loop=False`）。图比预期多跑一轮时立刻暴露，而不是悄悄给出旧答案。
- **每次返回的消息都带新 id**。`add_messages` 按 id 合并，复用同一个消息对象会被当成
  「更新那条旧消息」而不是「追加一条新消息」——这个坑在写 `10_budget.py` 时真的踩到了。

## 三个已经踩到的坑

**1. Windows 中文输出 `UnicodeEncodeError`**
日文/中文 Windows 控制台默认 cp932/gbk，`print("最终")` 直接崩。
每个例子开头都有 `sys.stdout.reconfigure(encoding="utf-8")`，就是为了这个。

**2. reducer 决定字段是「覆盖」还是「累加」**
第 1 课里 `count` 被覆盖、`log` 被累加，差别只在 `Annotated[list[str], operator.add]`。
写 Agent 时消息必须累加，所以内置的 `MessagesState` 用 `add_messages` 做 reducer。
搞错这个，Agent 会「只记得最后一句话」。

**3. human-in-the-loop 必须配 checkpointer**
`interrupt()` 让图暂停，但「停在哪、state 是什么」得有地方存。
`compile()` 不传 checkpointer 的话，恢复无从谈起。

## 状态

- 01、04、06、09、10 已在本机实跑通过（无需 key）。
- 02、03 已验证能正确构图（`compile()` + 节点检查），**真实 LLM 调用待填 key 后验证**。
- 06 之后的例子统一使用 `_fake.py`，因此不需要 key 也能得到确定结果。
