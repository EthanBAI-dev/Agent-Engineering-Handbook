---
title: "模型不会亲手算：它先决定要不要调用工具"
slug: "02-tool-loop"
order: 2
status: "draft"
interactive: "tool-loop"
verified_at: "2026-09-10"
runtime_note: "图结构已验证；真实模型调用等待本地 API Key"
---

# 模型不会亲手算：它先决定要不要调用工具

> 本课结果：你能跟着一条消息走完 `model → tools → model`，理解 model（模型节点）和 tools（工具节点）的分工，并指出哪条 Edge（边）闭合了工具循环。

## 只看一句话的话

模型负责提出 tool call（工具调用请求），ToolNode（工具执行节点）负责执行函数，工具结果回到 messages（消息列表）后，模型才决定继续还是结束。

model 判断下一步是否需要调用工具；tools 承载并执行工具函数；Edge 控制消息接下来流向哪个节点；tool call 描述模型想调用什么工具以及传入哪些参数；ToolNode 执行模型提出的真实工具调用；messages 保存用户、模型和工具之间的来往记录。

模型说“我要调用 `add`”，不等于它已经运行了 Python（编程语言）代码。

Python 在本课中负责真正执行工具函数。

## 从第一课加两个节点

第一课的图由 `plan`、`work` 和 `review` 组成，路线由代码提前写好。

现在把中间换成两个新角色：

```text
START → model ──有 tool call──→ tools
          ↑                       │
          └──── tool result ──────┘
          │
          └──没有 tool call──→ END
```

图中还出现了 `START`（图入口）、`END`（图出口）和 tool result（工具返回结果）。

`START` 启动流程；`END` 结束流程；tool result 把工具执行结果送回 model。

State（运行状态）、Node（节点）和 Edge 没有消失。我们只是把 State 换成消息列表，把节点换成模型与工具。

State 保存当前消息现场；Node 完成一次模型或工具操作。

这也是为什么不能跳过第一课：ReAct（推理—行动循环）仍然是一张图。

ReAct 让模型反复经历“判断下一步—执行工具—观察结果”，直到能够给出最终回答。

> **配图 F02-1｜谁决定，谁执行**
> **形式**：职责对照图 · `assets/lessons/02-who-does-what.svg`
> **画什么**：左右两栏。左栏 model：一张写着 `tool: add / args: {a:128, b:349}` 的便签；
> 右栏 tools：一个真的在跑的函数框，输出 `477`。中间一条箭头从左到右，另一条从右回到左。
> **必须标注**：左栏「只写下想调用什么」，右栏「真的执行 Python 函数」；回边标 `tool result`。
> **不要出现**：model 里画计算器或算式——它不算，这正是本课要纠正的。
> **替代文本**：model 生成写明工具名和参数的调用请求，tools 执行真实函数并把结果送回 model。

## 先分清“决定”和“执行”

假设你问：

```text
先算 128 加 349，再数一下 “the quick brown fox jumps” 有几个词。
```

model 节点读到问题后，可以生成类似这样的结构化请求：

```text
tool: add
arguments: {a: 128, b: 349}
```

这就是 tool call。它用结构化数据写明“想调用什么，以及传什么参数”。

接下来 ToolNode 根据名字找到真实 Python 函数，把参数传进去，再得到 tool result `477`。

把它想成餐厅：model 是服务员，tools 是厨房。服务员听懂需求、写下菜单，但菜不是服务员炒的。厨房完成后，还要把菜交回服务员。

这个比喻的边界是：模型并不真正理解厨房内部。它只知道工具名称、参数说明和返回结果。

## 工具就是有说明书的 Python 函数

课程准备了两个简单工具：

```python
@tool
def add(a: float, b: float) -> float:
    """把两个数相加。"""
    return a + b

@tool
def word_count(text: str) -> int:
    """数一段文本有多少个词。"""
    return len(text.split())
```

`@tool`（工具装饰器）把普通函数包装成模型可识别的工具。

`@tool` 提取函数名、参数和说明，让模型知道这个函数何时可用。

函数名、参数类型和文档字符串共同构成工具说明。模型根据这份说明判断什么时候使用它。

工具说明写得模糊，model 就可能选错工具或传错参数。这个问题属于工具设计，后面会单独展开；本课只保证两个工具足够简单。

## `bind_tools`（绑定工具说明）只是把说明交给模型

下面这行常被误解：

```python
model = get_model().bind_tools(TOOLS)
```

`bind_tools` 不会立刻执行所有工具。

`bind_tools` 把工具说明注册到模型请求中，让模型可以生成合法的 tool call。

它只是把工具的名称、参数和说明交给模型，让模型有能力生成合法的 tool call。真正的 Python 函数仍然由 ToolNode 调用。

## `MessagesState`（消息状态）为什么不会丢掉前文

第一个例子自己定义了 `log` 的 Reducer（归并规则）。

这一课使用 LangGraph（智能体流程编排框架）内置的 `MessagesState`。它只有一个核心字段：

LangGraph 按照图组织模型和工具节点的运行；`MessagesState` 保存完整消息历史。

```text
messages
```

这个字段使用消息 Reducer（归并规则）。

Reducer 把新消息追加到历史后面，而不是覆盖整个列表。

一次工具调用后，消息大致按这个顺序累积：

HumanMessage（用户消息）保存用户问题；AIMessage（模型消息）保存 tool call、模型回答或下一次调用意图；ToolMessage（工具消息）保存工具执行结果。

如果每次更新都覆盖 `messages`，model 就看不到用户原问题，也看不到工具刚返回的结果。

所以 Reducer 在这里不是实现细节。它直接决定 Agent（智能体）能否保持一条连续的推理与行动记录。

Agent 根据当前消息决定下一步，并在得到工具结果后继续处理任务。

## model 节点只负责问一次模型

节点本身非常短：

```python
def call_model(state: MessagesState) -> dict:
    return {"messages": [model.invoke(state["messages"])]}
```

`model.invoke` 把当前 messages 发送给模型，并取得一条新的模型消息。

它做三件事：

1. 读取当前所有 messages
2. 调用一次模型
3. 把模型的新消息追加回 State

这里没有 `while`。

是否再次调用 model，不由这个函数控制，而由图里的 Edge 控制。

## ToolNode 真正运行函数

加入节点时，model 和 tools 的职责被明确分开：

```python
graph.add_node("model", call_model)
graph.add_node("tools", ToolNode(TOOLS))
```

`ToolNode` 会读取最后一条模型消息中的 tool call，找到对应工具，执行函数，再生成 ToolMessage。

如果一条模型消息包含多个 tool call，ToolNode 可以处理多个调用。具体是一次发出多个，还是拆成多轮，取决于模型响应和运行配置。

因此网页演示选择固定路径，只为了让角色更容易观察，不代表真实模型永远以同样顺序调用工具。

## `tools_condition`（工具路由条件）决定去工具还是结束

model 运行完以后，图需要检查最后一条消息：

```python
graph.add_conditional_edges("model", tools_condition)
```

`tools_condition` 会检查最后一条模型消息有没有工具调用。

`tools_condition` 根据是否存在 tool call 选择下一条 Edge。

用大白话表达就是：

```text
最后一条 AIMessage 有 tool call → 去 tools
最后一条 AIMessage 没有 tool call → 去 END
```

它不会判断回答“聪不聪明”。它只根据消息里是否存在工具调用结构选择 Edge。

## 闭环的关键是 tools → model

整张图里最容易漏掉的是：

```python
graph.add_edge("tools", "model")
```

为什么工具执行完不能直接去 `END`？

因为 ToolMessage 只是原始结果。`477` 本身不知道用户的问题，也不会组织一句完整回答。

工具结果必须回到 model。model 读到结果后，可能直接回答，也可能发现还需要另一个工具。

这条回边让流程拥有“观察结果，再决定下一步”的能力。没有它，只有一次工具执行，没有 Agent 循环。

> **配图 F02-2｜一次工具调用产生四条消息**
> **形式**：消息序列图 · `assets/lessons/02-message-sequence.svg`
> **画什么**：自上而下四张消息卡：HumanMessage（问题）、AIMessage（带 tool call，正文为空）、
> ToolMessage（`477`）、AIMessage（最终回答）。左侧一条竖线标出它们属于同一个 messages 列表。
> **必须标注**：四种消息类型名；第二条「正文是空的，只有调用意图」。
> **不要出现**：把 ToolMessage 画成用户说的话。
> **替代文本**：一次工具调用后，消息列表依次是用户提问、模型的工具调用、工具结果、模型的最终回答。

## 互动实验：跟着一条消息走

网页动画使用固定的演示路径：

1. 用户问题进入 MessagesState
2. model 生成 `add` 和 `word_count` 的 tool call
3. tools 返回 `477` 和 `5`
4. 结果沿 `tools → model` 回去
5. model 生成最终回答，然后进入 END

动画最终显示 5 条消息：

```text
1 条用户消息
1 条包含 tool call 的模型消息
2 条工具结果
1 条最终模型回答
```

这里的数值由真实 Python 函数可确定：

```text
128 + 349 = 477
word_count("the quick brown fox jumps") = 5
```

模型最终如何措辞并不固定。真实模型也可能先调用一个工具，再进行第二轮调用。

> **互动 U02-1｜跟着一条消息走完闭环**
> **状态**：已实现 · `apps/web/src/components/lesson-two-lab.tsx`
> **用户做什么**：单步执行 model → tools → model → END，每步只推进一格。
> **屏幕上变什么**：当前节点高亮；刚走过的边高亮；右侧 MessagesState 同步增长，新消息带角色标签。
> **通过条件**：在三条边里选出闭合循环的那条（`tools → model`），并说出删掉它的后果。
> **小屏**：图与消息列表上下排列，图允许横向滚动。

## 自己运行真实代码

完整代码位于 [`lab/langgraph/examples/02_tool_agent.py`](../../lab/langgraph/examples/02_tool_agent.py)。

这一步会调用模型，请先按第 00 课配置 `ANTHROPIC_API_KEY`（Anthropic 模型接口密钥）。然后在 `lab/langgraph` 目录运行：

`ANTHROPIC_API_KEY` 用来验证程序是否有权调用 Anthropic 模型服务。

```powershell
uv run python examples/02_tool_agent.py
```

当前仓库已经验证图能正确构建，两个工具函数也能得到 `477` 和 `5`。由于本地没有配置真实 API Key（接口密钥），课程不声称已经验证某一种模型措辞或固定调用轮数。

运行时你要观察的不是答案写得漂不漂亮，而是消息类型的顺序：

```text
HumanMessage → AIMessage(tool call) → ToolMessage → AIMessage
```

如果模型把两个工具拆开，你可能看到更多轮 `AIMessage ↔ ToolMessage`。这仍然符合相同的图结构。

## 本课挑战：哪条 Edge 闭合了循环

从下面三条里选择：

```text
A. model → END
B. tools → model
C. tools → END
```

正确答案是 B。

验证方法不是背答案，而是问自己：工具结果出现以后，谁负责判断任务是否完成？

答案是 model。结果必须回到 model，model 才能继续调用工具或生成最终回复。

## 三个常见误区

### “模型会算，所以 add 没必要”

模型可能给出正确算术结果，但它的文本生成不是可靠计算器。

工具的价值是把需要确定性的工作交给确定性代码。数据库查询、文件读写和外部 API（应用程序编程接口）更是如此。

API 让 Agent 与数据库或外部服务交换请求和结果。

### “ToolNode 会自己决定用哪个工具”

不会。

model 生成 tool call，ToolNode 按请求执行。ToolNode 不负责理解用户意图。

### “用了 ReAct 就一定正确”

循环只保证流程能继续，不保证模型选对工具、参数合法或外部服务成功。

生产 Agent 还需要超时、重试、权限、限流和可观察性。这些不属于本课。

## 本课带走三句话

- model 生成工具调用意图
- ToolNode 执行真实函数，并追加 ToolMessage
- `tools → model` 让结果回到决策者，闭合 ReAct 循环

你不需要背 `create_react_agent`（预构建 ReAct Agent 工厂函数）的全部参数。

`create_react_agent` 用来快速生成常见的模型—工具循环。

先能手动画出这张图，之后使用封装才不会像使用魔法。

## 下一课

现在的 messages 只存在于这一次运行。

下一次重新调用时，Agent 为什么会忘记刚才说过的话？第 03 课会加入 checkpoint（状态快照）和 thread（会话线程）。

checkpoint 保存某一刻的运行现场；thread 把状态快照归到正确会话。

[进入第 03 课：同一个 thread 为什么记得，换一个就忘了](03-memory-and-threads.md)
