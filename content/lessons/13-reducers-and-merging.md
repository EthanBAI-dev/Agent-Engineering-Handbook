---
title: "Reducer：两个分支同时改一个字段，谁说了算"
slug: "13-reducers-and-merging"
order: 13
status: "draft"
interactive: "merge-rules"
verified_at: "2026-09-10"
runtime_note: "InvalidUpdateError、operator.add 合并与自定义 reducer 均已在 langgraph 1.2.11 实跑验证；不需要 API Key"
---

# Reducer：两个分支同时改一个字段，谁说了算

> 本课结果：你能说出并行分支写同一个字段时会发生什么，并为一个字段选出合适的合并规则。

## 只看一句话的话

没告诉 LangGraph 怎么合并，它不会随便挑一个——它直接报错。

> **术语说明**
>
> - **Reducer（归并规则）**：规定新值怎样与旧值合并。
> - **并行分支**：同一步里被同时执行的多个节点。

第 01 课已经见过 Reducer：`count` 被覆盖，`log` 被累加。这一课要解释那条区别在什么时候会变成一个必须处理的问题。

## 顺序执行时，「覆盖」是有意义的

两个节点先后各写一次：

```text
两个节点先后各写一次：plain=2（覆盖）  summed=3（累加）
```

`plain` 最后是 `2`，因为节点 b 后跑，它的值盖住了 a 的。这个说法成立，是因为「后跑」这件事有明确含义。

## 并行执行时，「覆盖」失去意义

现在让两个节点同时跑：

```python
graph.add_edge(START, "search")
graph.add_edge(START, "db")
```

两个节点都写 `result`，谁是后来的？没有答案。

LangGraph 的选择是不猜，实跑结果：

```text
InvalidUpdateError: At key 'result': Can receive only one value per step.
Use an Annotated key to handle multiple values.
```

**这是设计，不是 bug。**如果它随机挑一个，你会得到一个时对时错的 Agent，而且没有任何报错帮你定位。错误比错误答案便宜。

## 加上 reducer，两条结果都保留

```python
class Merged(TypedDict):
    result: Annotated[list[str], operator.add]
```

实跑结果：

```text
合并后：['数据库结果', '搜索结果']
```

注意这里的顺序：`db` 在前，`search` 在后，和添加节点的顺序相反。

> **不要依赖并行结果的顺序。**它由运行时决定，换个版本、换个节点名都可能变。需要知道每条结果来自哪里，就把来源写进数据本身，而不是靠位置推断。

## 自定义 reducer：按你的规则合并

`operator.add` 只会拼接。真实需求常常更具体：去重、取最优、限制长度。

```python
def keep_highest(old: dict, new: dict) -> dict:
    """两个分支各给一个打分，保留分数更高的那个来源。"""
    if not old:
        return new
    return new if new["score"] > old["score"] else old

class Scored(TypedDict):
    best: Annotated[dict, keep_highest]
```

实跑结果：

```text
两个分支都写了 best，reducer 只留下：{'source': '大模型', 'score': 0.91}
```

reducer 就是一个普通函数，签名是 `(旧值, 新值) -> 合并后的值`。写它的时候只需要回答一个问题：**两个都来了怎么办？**

注意第一个分支到达时 `old` 是初始值（这里是空字典），所以函数必须处理这种情况。

> **配图 F13-1｜并行时「覆盖」失去意义**
> **形式**：对照图 · `assets/lessons/13-parallel-merge.svg`
> **画什么**：上栏顺序执行——a 在前 b 在后，「后来的」有明确含义；
> 下栏并行执行——两个节点同时到达，中间打一个问号，旁边是 `InvalidUpdateError` 的提示条。
> **必须标注**：上栏「后跑」是有定义的；下栏「谁是后来的？没有答案」。
> **不要出现**：把报错画成 bug 图标——它是保护，不是故障。
> **替代文本**：顺序执行时后写的值覆盖先写的，并行执行时没有先后，缺少合并规则会直接报错。

## 怎样为一个字段选规则

| 场景 | 选择 | 例子 |
| --- | --- | --- |
| 只有最新值有意义 | 不加 reducer（覆盖） | 当前状态、开关、计数 |
| 每一条都要留下 | `operator.add` | 日志、消息、收集到的结果 |
| 需要去重或取优 | 自定义 | 检索结果合并、多模型投票 |
| 会被并行写入 | **必须**有 reducer | 任何扇出分支共同写的字段 |

最后一行是硬性的。第 21、22 课要做并行和 map-reduce，那时每一个被多个分支写的字段都得先想清楚合并规则。

## 为什么 messages 一定要累加

`MessagesState` 用的 reducer 是 `add_messages`，它比 `operator.add` 多做一件事：**按消息 id 合并**。

id 相同的消息会被当成「更新那条旧消息」，而不是追加一条新的。

这个行为有用（可以修正已经发出的消息），但也很容易踩到。本课程写脚本化模型时就真的踩到过：两个模型实例给出了相同的消息 id，结果新回答直接覆盖了旧回答，最后一条消息变成了用户的提问。

排查这类问题时，先打印每条消息的 `id`，再看内容。

## 互动实验：给字段配规则

网页实验给出一个扇出图：两个分支同时写四个字段。你为每个字段选择合并方式，然后运行。

```text
status   选「覆盖」   →  InvalidUpdateError
status   选「累加」   →  正常，但得到一个没意义的列表
logs     选「累加」   →  两条日志都在
best     选「自定义」 →  只留分数高的那条
```

通过条件：让四个字段全部跑通，并说出 `status` 为什么两种选法都不理想——真正的问题是它不该被两个分支同时写。

> **互动 U13-1｜给四个字段各配一条规则**
> **状态**：待开发 · 建议 `apps/web/src/components/lesson-thirteen-lab.tsx`
> **用户做什么**：为扇出图里被两个分支同时写的四个字段，各选「覆盖／累加／自定义」。
> **屏幕上变什么**：选完立刻跑一遍；选错的字段抛 `InvalidUpdateError` 或得到一个没意义的结果。
> **通过条件**：四个字段全部跑通，并说出 `status` 为什么两种选法都不理想。
> **小屏**：字段与规则改为纵向列表，每行一个下拉。

## 自己运行真实代码

完整代码位于 [`lab/langgraph/examples/13_reducers.py`](../../lab/langgraph/examples/13_reducers.py)，**不需要 API Key**：

```powershell
uv run python examples/13_reducers.py
```

本课所有输出都来自这次实跑。建议自己加一个 reducer 试试，比如「最多保留 3 条」：

```python
def keep_last_three(old: list, new: list) -> list:
    return (old + new)[-3:]
```

## 本课挑战：这个 reducer 有什么问题

```python
def merge(old: list, new: list) -> list:
    old.extend(new)
    return old
```

问题：它**原地修改**了旧值。

reducer 应该返回一个新值，而不是改动传进来的那个。原地修改会让 checkpoint 里保存的历史状态跟着变——第 18 课要做 Time Travel（回到旧状态），那时你会发现「旧状态」已经被后来的运行改掉了。

正确写法是 `return old + new`。

## 三个常见误区

### 「并行报错说明并行不好用」

报错说明的是这个字段缺少合并规则。加上 reducer 之后并行完全正常，第 21 课会大量使用。

### 「reducer 只在并行时才需要」

顺序执行时它同样在起作用——`log` 和 `messages` 的累加就是。并行只是让「没有 reducer」这件事变得无法忽略。

### 「用 operator.add 就万无一失」

它只会拼接。列表会越来越长，直到撞上第 14 课的上下文长度问题；字典用它会直接报类型错误。合并规则要按字段的含义选，不是按顺手选。

## 本课带走三句话

- 并行写同一个无 reducer 的字段，会得到 `InvalidUpdateError`，这是保护
- reducer 是普通函数，只需回答「两个都来了怎么办」
- 不要依赖并行结果的顺序，来源要写进数据本身

## 下一课

消息一直累加，迟早会撞上上下文长度上限。

下一课处理三种取舍：裁掉、过滤掉，还是压缩成一段摘要。

[进入第 14 课：消息太长怎么办](14-context-management.md)
