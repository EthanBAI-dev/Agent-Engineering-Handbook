---
title: "Agent（智能体）不是一次回答，而是一条会改变 State（运行状态）的路"
slug: "01-graph-and-state"
order: 1
status: "draft"
interactive: "graph-state"
verified_at: "2026-09-10"
---

# Agent（智能体）不是一次回答，而是一条会改变 State（运行状态）的路

> 本课结果：你能解释 State、Node（节点）和 Edge（边）的分工，并通过修改条件让 `work` 多执行两次。

## 只看一句话的话

Agent 每走到一个 Node，就读取一次 State，写回一小块变化，再沿着 Edge 去下一站。

State（运行状态）保存当前现场；Node（节点）完成流程中的一步工作；Edge（边）指定下一步路线。

所谓“循环执行”，不是模型拥有神秘意志。它只是图里有一条会返回前面节点的条件 Edge。

## 为什么第一课没有模型

一上来就接模型，会同时出现提示词、消息、工具、API Key（接口密钥）和不可预测输出。

API Key 的作用是验证程序是否有权调用模型服务。

你很容易看到程序跑了，却不知道究竟是谁决定了下一步。

所以第一课故意拿掉模型。流程完全确定，每次运行都得到同样结果。等这张图看懂以后，后面只是往图里增加不同节点。

## 把 Agent 想成一场接力赛

State 是接力棒，Node 是运动员，Edge 是跑道。

每个运动员拿到同一根棒，只完成自己负责的一段，然后把棒交给下一位。接力棒会带着前面留下的信息继续向前。

这个比喻有一个边界：真实 State 不是只能被一个人握住的实体。LangGraph（智能体流程编排框架）可以处理分支和并行，但本课先只看一条顺序路径。

LangGraph 按照图运行节点，并把每个节点返回的变化合并进 State。

## State：所有节点共享的现场

先看这份 State：

```python
class State(TypedDict):
    topic: str
    count: int
    log: Annotated[list[str], operator.add]
```

这段代码第一次出现了 `TypedDict`（类型字典）和 `Annotated`（附加规则标注）。

`TypedDict` 规定 State 有哪些字段以及各自的数据类型；`Annotated` 在类型之外给 `log` 绑定额外的合并规则。

它保存三样东西：

- `topic`：这次任务的主题
- `count`：流程已经推进到哪个计数
- `log`：每个节点留下的记录

初始值是：

```python
{"topic": "学 LangGraph", "count": 0, "log": []}
```

State 不是“模型的长期记忆”。它只是当前这次图运行时，节点共同读写的数据结构。怎样跨多次调用保存 State，要到第 03 课才讲。

## Node：只做一小步的函数

第一个函数是 `plan`（规划节点）。

`plan` 给计数加一并写下一条规划日志，完成流程的准备步骤。

```python
def plan(state: State) -> dict:
    return {
        "log": [f"planning: {state['topic']}"],
        "count": state["count"] + 1,
    }
```

注意它没有返回完整 State，只返回要更新的字段。

LangGraph 会把这些更新合并回当前 State。节点负责“做什么”，但它自己不决定下一站是谁。

`work`（执行节点）和 `review`（复核节点）也是普通函数：

```python
def work(state: State) -> dict:
    return {
        "log": [f"work pass #{state['count']}"],
        "count": state["count"] + 1,
    }

def review(state: State) -> dict:
    return {"log": ["review"]}
```

`work` 执行一轮工作并更新计数；`review` 在循环结束后追加复核记录。

把节点写小有一个直接好处：当结果不对时，你知道应该检查哪一步，而不是面对一个什么都做的大函数。

## Reducer（归并规则）：决定更新是覆盖还是累加

运行 `plan` 后，`count` 从 `0` 变成 `1`。

旧的 `0` 不再保留，因为普通字段采用新值覆盖旧值。

`log` 不一样。它使用了：

```python
Annotated[list[str], operator.add]
```

这里的 `operator.add` 是 Reducer。

Reducer 规定新数据怎样与旧 State 合并；这里它让新日志追加到旧列表后面，而不是覆盖旧列表。

因此节点返回：

```python
{"log": ["planning: 学 LangGraph"]}
```

合并后的结果是：

```python
{"log": ["planning: 学 LangGraph"]}
```

后面 `work` 再返回一项时，结果继续累加：

```python
{
    "log": [
        "planning: 学 LangGraph",
        "work pass #1",
    ]
}
```

这不是写法装饰。第 02 课的消息历史也必须累加，否则 Agent 会只剩最后一条消息。

## Edge：把节点连成执行路径

有了三个函数，它们还不会自己组成 Agent。

下面这些 Edge 才定义了执行顺序：

```python
graph.add_edge(START, "plan")
graph.add_edge("plan", "work")
graph.add_conditional_edges("work", should_continue, ["work", "review"])
graph.add_edge("review", END)
```

把它画出来就是：

```text
START → plan → work ──条件成立──→ work
                  └──条件不成立──→ review → END
```

`START`（图入口）和 `END`（图出口）不是你写的业务函数。

`START` 标记流程从哪里开始；`END` 标记流程在哪里结束。

固定 Edge 只有一个明确下一站。条件 Edge 则先运行判断函数，再根据返回值选择路径。

## 循环到底藏在哪里

判断函数只有一行：

```python
def should_continue(state: State) -> str:
    return "work" if state["count"] < 4 else "review"
```

当 `count < 4` 成立，它返回 `work`。

当前节点本来就是 `work`，下一站又是 `work`，所以流程形成循环。当条件不成立，它返回 `review`，循环才结束。

Agent 是否继续，不是由 `work` 函数决定。`work` 只更新 State；条件 Edge 读取更新后的 State，再决定路线。

## 互动实验：每次只执行一个节点

在网页动画中点击“执行下一步”。每次点击只做一件事：

1. 高亮当前执行的 Node
2. 高亮刚经过的 Edge
3. 显示 `count` 的旧值和新值
4. 显示 `log` 新追加的一项

第一次运行时，先不要点“自动运行”。单步观察下面这条变化：

```text
count: 0 → 1
log: [] → ["planning: 学 LangGraph"]
```

然后继续执行，直到流程进入 `END`。

默认阈值为 `4`。完整运行后，经过本机验证的结果是：

```text
work 执行 3 次
最终 count = 4
log 一共有 5 条
```

为什么不是 4 次？因为 `plan` 已经先把 `count` 从 0 加到了 1。`work` 从 1 开始执行，直到 count 达到 4。

## 自己运行真实代码

如果你已经完成第 00 课的环境配置，在 `lab/langgraph` 目录运行：

```powershell
uv run python examples/01_hello_graph.py
```

完整代码位于 [`lab/langgraph/examples/01_hello_graph.py`](../../lab/langgraph/examples/01_hello_graph.py)。

程序使用 `stream`（逐步流式运行）输出每一步，再用 `invoke`（完整调用）获取最终 State。

`stream` 逐步返回节点输出，用来观察运行过程；`invoke` 执行一次完整调用，用来取得最终结果。

现在不必记住这两个方法的全部参数。

## 本课挑战：让 work 多跑两次

把条件里的阈值从 `4` 改成 `6`：

```python
return "work" if state["count"] < 6 else "review"
```

重新运行后，正确结果应该是：

```text
work 执行 5 次
最终 count = 6
log 一共有 7 条
```

如果结果不是这样，按顺序检查：

1. 你改的是条件阈值，不是初始 `count`
2. `plan` 仍然会先执行一次
3. `work` 每次仍然只把 `count` 加一
4. `review` 只追加日志，不修改 `count`

能解释这四条，比碰巧得到数字 `6` 更重要。

## 什么时候不该画成 Agent 图

如果任务永远只有一步，没有分支、循环、暂停或共享状态，普通函数通常更简单。

不要因为 LangGraph 能画图，就把每段代码都包装成 Node。图的价值来自“控制流程”和“保留现场”，不是节点数量。

同样，本课的固定规则也还不是真正的工具型 Agent。下一课会让 model（模型节点）根据消息决定是否进入 tools（工具节点）。

model 提出工具调用意图；tools 执行真实函数。

## 本课带走三句话

- State 保存当前现场
- Node 读取 State，并返回局部更新
- Edge 决定下一步，条件 Edge 可以制造循环

如果你还能解释 reducer 为什么让 `log` 累加，而 `count` 会覆盖，这一课就真正完成了。

## 下一课

现在，路线是程序员提前写死的。

下一课把“要不要调用工具”交给 model，但真正执行工具的仍然不是模型。

[进入第 02 课：模型不会亲手算，它先决定要不要调用工具](02-tool-loop.md)
