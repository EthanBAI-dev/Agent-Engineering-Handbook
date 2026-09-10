---
title: "Map-reduce：数量不固定的任务怎么扇出"
slug: "22-map-reduce"
order: 22
status: "draft"
interactive: "dynamic-fanout"
verified_at: "2026-09-10"
runtime_note: "Send 动态扇出、零扇出时下游被跳过的行为均已在 langgraph 1.2.11 实跑验证；不需要 API Key"
---

# Map-reduce：数量不固定的任务怎么扇出

> 本课结果：你能用 `Send` 在运行时派发任意数量的任务，并处理好「一份都没有」这个边界。

## 只看一句话的话

`Send` 让扇出的分支数量在运行时才决定，而不是写死在图里。

> **术语说明**
>
> - **Send**：运行时生成一个「派给某个节点的任务」，可以一次生成很多个。
> - **map**：把同一种处理分别应用到每一份数据上。
> - **reduce**：等所有 map 完成后，把结果汇总成一个。

第 21 课的并行有个前提：三个来源就是三个节点，写死在图里。但用户传了几份文件、搜索返回了几条结果，这些数量要到运行时才知道。

## 用 Send 动态扇出

```python
def fan_out(state: Overall):
    return [Send("review_one", {"document": doc}) for doc in state["documents"]]

graph.add_conditional_edges(START, fan_out, ["review_one"])
```

`Send` 的第二个参数是**那一份任务自己的输入**，不是整个 State：

```python
class OneDoc(TypedDict):
    document: str
```

map 节点只看得到自己那一份。它不知道也不需要知道别人在做什么——这正是 map 的定义。

实跑结果：

```text
=== 1. 三份文件 ===
  {'doc': '合同A', 'score': 4}
  {'doc': '报告BB', 'score': 5}
  {'doc': '纪要CCC', 'score': 1}
  共 3 份，平均 3.3 分，最高是 报告BB（5 分）

=== 2. 同一张图，七份文件，代码一个字没改 ===
  收到 7 条评审结果
  共 7 份，平均 3.4 分
```

三份和七份用的是同一张图。数量变了，图不用改——这就是 `Send` 相对第 21 课那种写死分支的价值。

## reduce 节点会自动等所有 map 完成

```python
graph.add_edge("review_one", "reduce_all")
```

看起来只有一条边，但它对**每一个** `Send` 派出去的任务都成立。所有任务完成后，`reduce_all` 才执行一次。

汇总字段照例必须有 reducer：

```python
reviews: Annotated[list[dict], operator.add]
```

## 那个最容易漏的边界：一份都没有

如果 `documents` 是空列表会怎样？

我原本以为 reduce 里的 `max()` 会对空列表报错。实跑结果不是这样：

```text
=== 3. 零份文件：reduce 根本不会执行 ===
  报告字段：''
```

**没有异常，也没有报告。**

原因是这样：`fan_out` 返回了空列表，一个 `Send` 都没有，所以 `review_one` 一次都没跑；而 `reduce_all` 只有一条来自 `review_one` 的入边，于是它也没跑。整条下游被**静默跳过**。

这是 map-reduce 最容易漏掉的边界，而且它的失败方式是最难查的那一种：没有报错，只是结果字段停在初始值。第 12 课那条「结果没变化时先怀疑结构」在这里又应验了。

## 修法：空集合单独走一条路

```python
def route_or_empty(state: Overall):
    if not state["documents"]:
        return "nothing_to_do"
    return [Send("review_one", {"document": doc}) for doc in state["documents"]]
```

条件函数可以返回一个节点名，也可以返回一串 `Send`。实跑结果：

```text
零份：没有需要评审的文件
两份：共 2 份，平均 4.5 分，最高是 报告BB（5 分）
```

## 扇出很大时要想的事

零是一个边界，很大是另一个：

- **成本**：一千份文件就是一千次模型调用。第 10 课那条上限在这里要按「份数」再算一遍
- **并发**：同时打一千个请求，外部服务会限流，你自己的进程也可能吃不消
- **失败**：默认一个 map 失败就整次失败，和第 21 课一样，要「尽力而为」得自己兜

实际项目里通常要加一层分批：一次只派 20 个，做完再派下一批。

## map 任务之间不能互相依赖

如果第二份文件的处理需要第一份的结果，那它就不是 map，是一条链。

强行用 `Send` 扇出会得到不确定的结果——它们是并发执行的，没有先后。这种情况应该回到第 21 课的串行连边，或者第 24 课的计划模式。

## 互动实验：处理三种数量

网页实验给你同一张图，三种输入：

```text
0 份   →  reduce 不执行，报告是空的（这是 bug 的样子）
3 份   →  正常汇总
50 份  →  能跑，但要你回答「这一次花了多少钱」
```

通过条件：让 0 份也能给出一个说得通的结果，并且说出 50 份时你会加什么限制。

## 自己运行真实代码

完整代码位于 [`lab/langgraph/examples/22_map_reduce.py`](../../lab/langgraph/examples/22_map_reduce.py)，**不需要 API Key**：

```powershell
uv run python examples/22_map_reduce.py
```

本课的零扇出行为就是写这个脚本时发现的——原本写的是「reduce 会拿到空列表并报错」，实跑推翻了这个假设。**这也是课程坚持每个结论都要跑一遍的原因。**

## 本课挑战：这个 map 节点为什么读不到 State

```python
def fan_out(state: Overall):
    return [Send("review_one", {"document": doc}) for doc in state["documents"]]

def review_one(state: Overall) -> dict:       # 类型标成了 Overall
    total = len(state["documents"])           # 想知道一共有几份
    ...
```

问题：`Send` 传过去的输入只有 `{"document": doc}`，里面没有 `documents` 字段。

map 任务拿到的是你在 `Send` 里给的那个字典，不是整个 State。需要总数就在 `Send` 里一起传：

```python
Send("review_one", {"document": doc, "total": len(state["documents"])})
```

## 三个常见误区

### 「零份和三份没什么区别，都能跑」

零份时下游整条被跳过，结果字段停在初始值，而且没有报错。必须单独处理。

### 「map 节点能看到整个 State」

它只看得到 `Send` 里传的那个字典。这是刻意的设计：map 任务应该是自足的。

### 「扇出数量大一点无所谓，反正是并行的」

并行不改变总成本，只改变总耗时。一千份就是一千次调用，还要面对限流。

## 本课带走三句话

- `Send` 让分支数量在运行时决定，图不用改
- 零扇出时下游整条被静默跳过，必须单独走一条路
- map 任务只看得到 `Send` 里传的东西，也不该依赖彼此

## 下一课

图越来越大了。同一段流程已经在第 16、20 课复制过两次，是时候把它封装起来。

[进入第 23 课：Subgraph，把复杂图拆成部件](23-subgraph.md)
