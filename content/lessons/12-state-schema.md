---
title: "State Schema：写错字段名不会报错，只会静静地什么都不发生"
slug: "12-state-schema"
order: 12
status: "draft"
interactive: "silent-drop"
verified_at: "2026-09-10"
runtime_note: "两种静默丢弃与 input_schema/output_schema 的行为已在 langgraph 1.2.11 实跑验证；不需要 API Key"
---

# State Schema：写错字段名不会报错，只会静静地什么都不发生

> 本课结果：你能认出两种静默失败，并用 `input_schema` / `output_schema` 把图的对外边界写清楚。

## 只看一句话的话

State 的字段清单是一份合同：不在合同里的字段，写进去也不会有人接。

> **术语说明**
>
> - **schema（结构定义）**：规定 State 有哪些字段、各自什么类型。
> - **input_schema（输入结构）**：调用这张图时**必须**和**允许**给的字段。
> - **output_schema（输出结构）**：这张图跑完对外**返回**哪些字段。

这一课先让你踩两次静默失败，再讲怎样把它们变成可发现的问题。

## 第一种静默：多传的字段被丢掉

```python
class State(TypedDict):
    question: str
    answer: str
    internal_note: str
```

调用时顺手多传一个 `user_id`：

```python
app.invoke({"question": "在吗", "answer": "", "internal_note": "", "user_id": "u_42"})
```

实跑结果：

```text
{'question': '在吗', 'answer': '收到：在吗', 'internal_note': ''}
```

`user_id` 不在 schema 里，没有报错，也没有进 State。它就这么消失了。

如果你后面的节点依赖 `state["user_id"]`，那才会报错——而且报的是 `KeyError`，离真正的原因（调用处多传了一个不存在的字段）已经隔了好几步。

## 第二种静默：节点写错字段名

这一种更常见，也更难查：

```python
def typo_node(state: State) -> dict:
    # 想写 answer，手滑写成 answr
    return {"answr": "这句话永远不会出现"}
```

实跑结果：

```text
节点返回了 answr，跑完之后 answer = ''
```

没有异常，没有警告。你会以为是模型没给出内容、是提示词不对、是条件边走错了——一路查下去，其实只是拼错了一个字母。

> **术语说明｜静默失败**
> 程序没有报错，但也没有做你以为它在做的事。它比崩溃危险，因为没人会去查一件「看起来正常」的事。

**记住这条排查顺序：结果「没变化」时，先怀疑字段名，再怀疑模型。**

## 怎样把它变成能发现的错误

TypedDict 本身不做运行时检查，但静态检查工具能查。在编辑器里装好类型检查，`{"answr": ...}` 会立刻标红。

这就是课程坚持用 TypedDict 而不是普通 dict 的原因：合同写下来了，工具才有东西可对照。

如果你要更强的保证，可以把 state_schema 换成 Pydantic 模型，让它在运行时校验类型。代价是每一步都要多做一次验证，图会慢一些。教学阶段用 TypedDict 加编辑器检查就够了。

## input_schema 和 output_schema：把对外边界写清楚

同一张图，可以有三份不同的字段清单：

```python
class Input(TypedDict):
    question: str

class Output(TypedDict):
    answer: str

graph = StateGraph(State, input_schema=Input, output_schema=Output)
```

- `State`：节点内部能读写的全部字段
- `Input`：调用方需要提供的字段
- `Output`：调用方能拿到的字段

实跑结果：

```text
输入只需要 question，不用再补空字符串：invoke({'question': '在吗'})
输出只有 output_schema 里的字段：{'answer': '收到：在吗'}
```

`internal_note` 确实被写进了 State，但没有出现在返回值里。

这正好解决第 08 课那个挑战题：接口不该把整个 State 抖给前端。有了 `output_schema`，「只返回你主动挑选的字段」从一条纪律变成了一个结构约束——就算以后有人往 State 里加了新的内部字段，也不会顺着接口漏出去。

## 三份清单怎么分

| 字段 | 放进 Input | 放进 Output | 理由 |
| --- | :---: | :---: | --- |
| 用户的问题 | 是 | 否 | 调用方自己就有，不用还给它 |
| 最终回答 | 否 | 是 | 这才是调用方要的 |
| 系统提示 | 否 | 否 | 内部配置，不该进出 |
| 工具原始返回 | 否 | 否 | 给模型看的中间结果 |
| 调用次数 | 否 | 看情况 | 前端要显示配额就给，否则不给 |

判断标准只有一条：**这个字段，调用方有没有正当理由知道它？**

## 互动实验：找出消失的字段

网页实验给你一张图和三次调用，每次都有一个字段没有按预期出现。你要指出原因：

```text
调用 1：多传了 user_id     → 不在 schema 里，被丢掉
调用 2：节点返回 answr     → 字段名拼错，静默忽略
调用 3：读不到 internal_note → 在 State 里，但不在 output_schema 里
```

通过条件：三种原因全部分辨正确，并说出第 3 种和前两种的区别——前两种是错误，第 3 种是刻意的设计。

## 自己运行真实代码

完整代码位于 [`lab/langgraph/examples/12_state_schema.py`](../../lab/langgraph/examples/12_state_schema.py)，**不需要 API Key**：

```powershell
uv run python examples/12_state_schema.py
```

上面三段实跑输出都来自这个脚本。建议把第 2 段的 `answr` 改回 `answer` 再跑一次，感受一下「有没有报错」和「有没有生效」是两件独立的事。

## 本课挑战：这个 output_schema 漏了什么

```python
class Output(TypedDict):
    answer: str
    debug: dict          # 里面装着完整 messages 和工具原始返回
```

问题：`debug` 字段让前面所有的收紧都白做了。整个 State 换了个名字照样漏出去。

判断一个 output_schema 是否安全，不看字段数量，看**每个字段里装的是什么**。一个名叫 `debug` 或 `meta` 的自由字典，通常就是那个漏洞。

## 三个常见误区

### 「TypedDict 会在运行时检查类型」

不会。它是给静态检查工具和读代码的人看的。运行时想要校验，得换 Pydantic。

### 「多传几个字段没关系，反正用不到」

用不到时确实没关系，麻烦在于它会让人误以为传进去了。第 29 课的 `user_id` 就是典型：以为传了，其实丢了，权限判断落空。

### 「output_schema 是可选的，接口层再过滤就行」

接口层过滤靠人记得写；`output_schema` 靠结构保证。两者都做最好，只做一个的话选后者——它不会因为有人加了新字段而失效。

## 本课带走三句话

- 不在 schema 里的字段，传进去和写出来都会被静默丢掉
- 结果「没变化」时，先怀疑字段名拼写，再怀疑模型
- 用 `output_schema` 把内部字段挡在接口之外

## 下一课

字段名对上了，还有一个更隐蔽的问题：两个分支同时改同一个字段，谁说了算？

[进入第 13 课：Reducer，并行更新怎样合并](13-reducers-and-merging.md)
