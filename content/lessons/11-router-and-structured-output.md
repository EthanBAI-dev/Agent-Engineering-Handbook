---
title: "Router 与结构化输出：别把模型吐的字符串直接当分支键"
slug: "11-router-and-structured-output"
order: 11
status: "draft"
interactive: "route-guard"
verified_at: "2026-09-10"
runtime_note: "三条分支、非法类别与自由文本三种情况已在 langgraph 1.2.11 实跑验证；使用脚本化模型，不需要 API Key"
---

# Router 与结构化输出：别把模型吐的字符串直接当分支键

> 本课结果：你能让三类请求进入正确分支，并说出模型给一个不存在的类别时，程序为什么不会崩。

## 只看一句话的话

先让模型从固定枚举里选，再用你自己的白名单校验它——两层都要。

> **术语说明**
>
> - **Router（路由节点）**：判断这条请求该走哪个分支。
> - **结构化输出**：让模型返回可解析的字段，而不是一段自然语言。
> - **白名单校验**：只接受允许集合里的值，其余一律落到兜底分支。

分类是 Agent 里最常见的一步：这条请求该走退款、查物流，还是转人工？

## 最容易写错的做法

```python
# 错误示范
text = model.invoke(messages).content
if "退款" in text:
    return "refund"
```

这段代码有三个问题，而且都不会在测试时暴露：

1. 模型说「这个不是退款问题」——命中了「退款」，走进退款分支
2. 模型换一种措辞说「我建议走退货流程」——一个都没命中，落到最后一个 else
3. 模型哪天回复得更长更礼貌，你的关键词表就得跟着改

问题的根子在于：**你把一段自然语言当成了控制信号**。

## 第一层：让模型输出结构化结果

把分类做成一个工具，参数用 `Literal`（固定枚举）限制取值：

```python
@tool
def classify(route: Literal["refund", "shipping", "human"], reason: str) -> str:
    """把用户请求分到一个已知类别。"""
    return route
```

> **术语说明｜Literal**
> 限定一个参数只能取列出的几个值之一。模型拿到的工具说明里会带着这份清单。

模型这时输出的不是一句话，而是一个结构：

```text
tool: classify
arguments: {route: "refund", reason: "用户想退掉商品"}
```

`reason` 字段不参与路由，但强烈建议留着——出问题时你要能看出模型「以为」这是什么请求。

## 第二层：白名单校验

结构化输出让模型**更可能**给出合法值，但不是**保证**。它可能给 `REFUND_NOW`，也可能干脆不调用工具。

所以路由节点拿到结果后，还要过一道自己的关：

```python
raw = message.tool_calls[0]["args"]["route"] if message.tool_calls else str(message.content)
route = raw if raw in ROUTES else FALLBACK
return {"raw_route": raw, "route": route}
```

注意这里存了两个字段：`raw_route` 记录模型原本说了什么，`route` 是校验之后真正用于分支的值。出问题时，这两个字段的差异就是答案。

## 三种情况的实跑结果

**正常分类**：

```text
这个我想退掉       → route=refund    已为你创建退款单。
我的包裹到哪了      → route=shipping  你的包裹在配送中。
我要投诉         → route=human     已转接人工客服。
```

**模型给了一个不存在的类别**：

```text
模型原始输出 raw_route = 'REFUND_NOW'
白名单校验后 route     = 'human'
最终回答               = 已转接人工客服。
```

**模型完全没走结构化输出**：

```text
模型原始输出 raw_route = '我觉得应该给他退款吧'
白名单校验后 route     = 'human'
最终回答               = 已转接人工客服。
```

后两种情况都没有崩，也没有走错分支。

## 没有校验会发生什么

条件边的返回值会被当作节点名去查找。找不到就直接抛异常，实测是：

```text
KeyError: 'REFUND_NOW'
```

对用户来说这是一个 500 错误。而这个错误的触发条件——模型某次输出格式不对——是你无法提前穷举的。

> **术语说明｜兜底分支**
> 所有判断都失败时的默认去处。它必须是安全的：宁可转人工，也不要静默走进一个可能造成损失的分支。

选兜底分支的原则很简单：**如果这次判断完全错了，走哪条路损失最小？**通常是转人工，而不是退款或删除。

## 互动实验：让路由挡住三种坏输入

网页实验固定三条请求，你切换模型的输出：

```text
合法枚举值        →  进入对应分支
大小写不同的值    →  落到兜底分支
一段自然语言      →  落到兜底分支
```

面板同时显示 `raw_route` 和 `route` 两列，让「模型说了什么」和「程序信了什么」分开可见。

通过条件：三种输入下流程都没有崩，并且你能指出兜底分支为什么选 `human` 而不是 `refund`。

## 自己运行真实代码

完整代码位于 [`lab/langgraph/examples/11_router.py`](../../lab/langgraph/examples/11_router.py)，**不需要 API Key**：

```powershell
uv run python examples/11_router.py
```

推荐改一处再跑：把 `route = raw if raw in ROUTES else FALLBACK` 改成 `route = raw`，再运行第 2 段，亲眼看到那个 `KeyError`。

## 本课挑战：这个路由为什么不安全

```python
ROUTES = ("refund", "shipping", "human", "delete_account")

def route(state):
    return state["raw_route"] if state["raw_route"] in ROUTES else "delete_account"
```

问题不在校验，校验写对了。问题在兜底分支选成了 `delete_account`：每一次模型输出异常，都会走进破坏性最强的那条路。

兜底分支的正确选法是「最安全」，不是「最常见」，更不是「列表里的最后一个」。

## 三个常见误区

### 「结构化输出之后就不用校验了」

结构化输出降低了出错概率，没有消除它。实跑的第 2、3 段就是它失效的两种方式。

任何来自模型的值，进入控制流之前都要过一次白名单——这条规则在第 28 课会扩展到工具参数。

### 「用 if/elif 关键词匹配也能跑通」

能跑通测试用例，扛不住真实措辞。关键词匹配的失败方式是「悄悄走错分支」，比崩溃更难发现。

### 「分支越多，Agent 越智能」

分支多只会让每一类的样本更少、判断更不稳。先做三四类，把兜底做对，再按真实数据拆分。

## 本课带走三句话

- 让模型从固定枚举里选，而不是写一段话
- 模型给的值进入控制流之前，必须过一次白名单
- 兜底分支要选最安全的那条，不是最常见的那条

## 下一课

路由已经不会走错了。但 State 本身还很脆弱：字段名写错不会报错，只会静静地什么都不发生。

[进入第 12 课：State Schema，给状态定合同](12-state-schema.md)
