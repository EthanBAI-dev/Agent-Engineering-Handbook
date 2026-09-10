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
| [`11_router.py`](examples/11_router.py) | 结构化输出 + 白名单校验，模型给非法类别也不会崩 | 否 |
| [`12_state_schema.py`](examples/12_state_schema.py) | 两种**静默失败**，以及 `input_schema` / `output_schema` | 否 |
| [`13_reducers.py`](examples/13_reducers.py) | 并行写同字段的 `InvalidUpdateError`，自定义 reducer | 否 |
| [`14_long_messages.py`](examples/14_long_messages.py) | `trim_messages`、过滤与总结三种取舍 | 否 |
| [`15_persistence.py`](examples/15_persistence.py) | SqliteSaver：**真的开一个子进程**验证跨进程持久化 | 否 |
| [`16_approval_policy.py`](examples/16_approval_policy.py) | 自动 / 审批 / 禁止三档风险分级，未登记工具默认拒绝 | 否 |
| [`17_edit_state.py`](examples/17_edit_state.py) | `update_state`：审批时直接改参数，或退回重新生成 | 否 |
| [`18_time_travel.py`](examples/18_time_travel.py) | `get_state_history`、重放与分叉 | 否 |
| [`19_retry_idempotency.py`](examples/19_retry_idempotency.py) | `RetryPolicy` 与幂等键：重试为什么会扣三次款 | 否 |
| [`20_trusted_agent.py`](examples/20_trusted_agent.py) | 单元四综合项目，五条验收路径 | 否 |
| [`21_parallel.py`](examples/21_parallel.py) | 扇出扇入，串行 0.91s 对并行 0.31s 实测 | 否 |
| [`22_map_reduce.py`](examples/22_map_reduce.py) | `Send` 动态扇出，以及**零扇出时下游被静默跳过** | 否 |
| [`23_subgraph.py`](examples/23_subgraph.py) | 子图封装，以及父子共享累加字段的**重复计数陷阱** | 否 |
| [`24_planner_executor.py`](examples/24_planner_executor.py) | 计划写成数据才能校验；重规划与它的上限 | 否 |
| [`25_multi_agent.py`](examples/25_multi_agent.py) | 交接损耗实测：什么时候才真的需要第二个 Agent | 否 |

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

**3. State 里写错字段名不会报错**
`{"answr": ...}` 拼错一个字母，没有异常、没有警告，只是什么都不发生。
排查「结果没变化」时，先怀疑字段名，再怀疑模型。见 `12_state_schema.py`。

**4. `stream_mode="messages"` 里混着 ToolMessage**
照单全收会把工具的原始返回拼进用户看到的答案里，必须按 `langgraph_node` 过滤。
见 `09_streaming.py`。

**5. 子图和父图共享带 reducer 的字段会重复计数**
子图只要在 schema 里**声明**了父图的累加字段，父图已有的值就会被回写并再累加一次，
即使子图什么都没写。接口用覆盖型字段传，累加型字段各留各的。见 `23_subgraph.py`。

**6. 没有入边的节点会被静默跳过**
`compile()` 不报错，运行时也不报错，那个节点就是不执行。
零扇出时 reduce 被跳过（`22_map_reduce.py`）是同一类问题。

**7. human-in-the-loop 必须配 checkpointer**
`interrupt()` 让图暂停，但「停在哪、state 是什么」得有地方存。
`compile()` 不传 checkpointer 的话，恢复无从谈起。

## 状态

- 01、04、06、09–25 已在本机实跑通过（无需 key）。
- 02、03 已验证能正确构图（`compile()` + 节点检查），**真实 LLM 调用待填 key 后验证**。
- 06 之后的例子统一使用 `_fake.py`，因此不需要 key 也能得到确定结果。
