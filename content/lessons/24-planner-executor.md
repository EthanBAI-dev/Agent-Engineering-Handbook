---
title: "Planner–Executor：先把计划写下来，才能检查它"
slug: "24-planner-executor"
order: 24
status: "draft"
interactive: "plan-review"
verified_at: "2026-09-10"
runtime_note: "非法计划被拦截、失败后重规划、重规划上限三条路径均已在 langgraph 1.2.11 实跑验证；不需要 API Key"
---

# Planner–Executor：先把计划写下来，才能检查它

> 本课结果：你能让 Agent 先产出一份可校验的计划，并在它动手之前拦下非法步骤。

## 只看一句话的话

计划是数据，不是想法。写成数据，才能校验、展示、修改、重排。

> **术语说明**
>
> - **Planner（规划器）**：产出一份步骤清单。
> - **Executor（执行器）**：按清单一步步执行。
> - **重规划（replan）**：执行失败后，换一版计划重来。

第 02 课的 ReAct 每一步都现想下一步。灵活，但你无法在它动手之前看到全貌。

## 什么时候需要看到全貌

- 有人要先审一遍再放行
- 要预估这次任务会花多少钱、多长时间
- 失败时需要换**一条整体路线**，而不只是改下一步
- 需要把计划展示给用户，让他划掉不想要的步骤

这四件事，ReAct 一件都做不了——因为在它跑起来之前，计划不存在。

## 三个节点的结构

```text
planner → validate → executor ⇄（失败）→ bump_replan → planner
                         ↓（做完）
                       finish
```

`validate` 夹在中间，这是整个模式最有价值的位置。

## 计划是数据，所以能在执行前拦下来

```python
ALLOWED_STEPS = {"fetch", "parse", "summarize", "save"}

def validate(state: State) -> dict:
    unknown = [step for step in state["plan"] if step not in ALLOWED_STEPS]
    if unknown:
        return {"status": f"计划非法：出现未知步骤 {unknown}"}
    if len(state["plan"]) > 6:
        return {"status": f"计划过长：{len(state['plan'])} 步，超出上限"}
    return {"status": "计划通过校验"}
```

给它一份含 `rm_rf` 的计划，实跑结果：

```text
放弃：计划非法：出现未知步骤 ['rm_rf']，已完成 []
实际执行了：[]
```

**一步都没执行。**

对比第 11 课的白名单：那里校验的是一个分支键，这里校验的是一整份计划。同一条原则，粒度不同——**模型的输出进入执行之前，先过一道你自己的清单**。

## 失败之后换一版计划

```python
def route_after_step(state: State) -> str:
    if state["status"].endswith("失败"):
        return "bump_replan" if state["replans"] < MAX_REPLANS else "give_up"
    ...
```

实跑结果：

```text
最终计划：['fetch', 'summarize', 'save']
实际执行：['fetch', 'fetch', 'summarize', 'save']
重规划 1 次
完成：fetch → fetch → summarize → save
```

第一版计划是 `fetch → parse → summarize → save`，`parse` 失败了，重规划后的第二版绕开了它。

## 注意 fetch 执行了两次

这不是 bug，是重规划的固有代价：**新计划从头开始，已经做过的步骤会被重做**。

如果 `fetch` 只是读数据，重做无害。如果它是扣款或发邮件，重做就是事故——第 19 课那个幂等键在这里又用上了。

> **凡是会被重规划重做的步骤，都必须是幂等的。**

另一种做法是让 planner 知道哪些步骤已完成，只规划剩下的。代价是 planner 的输入变复杂，而且它可能误判「已完成」的含义。

## 重规划次数必须有上限

如果那个失败的步骤永远失败，而 planner 每次都坚持要它：

```text
重规划 2 次后：放弃：步骤 parse 失败，已完成 ['fetch', 'fetch', 'fetch']
上限 MAX_REPLANS = 2
```

停住了，而且给出了一个说得通的结果。

没有上限的话，这就是第 10 课那个停不下来的循环换了个形式——而且每次重规划都要调一次模型，烧钱更快。

注意 `fetch` 执行了三次。这也再次说明上面那条：重做是必然的，幂等是必须的。

> **配图 F24-1｜校验夹在规划和执行之间**
> **形式**：流程图 · `assets/lessons/24-plan-validate-execute.svg`
> **画什么**：`planner → validate → executor`，validate 下方一条岔路通向 give_up。
> 一份含 `rm_rf` 的计划卡片在 validate 处被挡下，executor 一侧标「一步都没执行」。
> **必须标注**：校验发生在执行之前；重规划的回边要标上限次数。
> **不要出现**：把 validate 画成可选步骤——它是这个模式唯一的安全收益。
> **替代文本**：计划先经过校验再交给执行器，含非法步骤的计划在执行前就被拦下。

## 和 ReAct 怎么选

| 情况 | 选哪个 | 原因 |
| --- | --- | --- |
| 步骤数量事先不知道 | ReAct | 计划写不出来，只能走一步看一步 |
| 需要人先审一遍再动手 | Planner | 计划是数据，能展示、能修改 |
| 需要预估成本和耗时 | Planner | 步数已知，可以先算再决定跑不跑 |
| 环境变化快，计划容易过期 | ReAct | 写好的计划执行到一半就不适用了 |
| 失败时要换一条整体路线 | Planner | 重规划就是换一版计划，ReAct 只能改下一步 |

两者不是对立的。常见的混合做法是：用 Planner 定大步骤，每个大步骤内部用 ReAct 自由发挥。

## 互动实验：审一份计划

网页实验给你三份模型生成的计划，你在执行前审查：

```text
计划 A：五步，全部在允许清单内     →  放行
计划 B：含一个未登记的步骤          →  拦下
计划 C：十二步，其中三步重复        →  拦下（过长 + 冗余）
```

通过条件：三份都判断正确，并说出计划 C 该退回重新规划还是直接放弃。

> **互动 U24-1｜审一份计划**
> **状态**：待开发 · 建议 `apps/web/src/components/lesson-twentyfour-lab.tsx`
> **用户做什么**：对三份模型生成的计划各做一次放行／拦下的判断。
> **屏幕上变什么**：判断后展示该计划真正执行的步骤；放行了含非法步骤的计划时，显示它做了什么。
> **通过条件**：三份判断正确，并说出过长的那份该退回重规划还是直接放弃。
> **小屏**：计划卡片纵向，步骤列表可折叠。

## 自己运行真实代码

完整代码位于 [`lab/langgraph/examples/24_planner_executor.py`](../../lab/langgraph/examples/24_planner_executor.py)，**不需要 API Key**：

```powershell
uv run python examples/24_planner_executor.py
```

脚本里的 planner 写死了两版计划，为的是让结果可复现。接上真实模型后，planner 的输出质量成了变量——那时 `validate` 就不只是保险，而是必需品。

## 本课挑战：这个校验为什么形同虚设

```python
def validate(state):
    if any(s not in ALLOWED_STEPS for s in state["plan"]):
        return {"status": "计划非法"}
    return {"status": "计划通过校验"}

graph.add_edge("planner", "executor")      # 直接连过去了
graph.add_node("validate", validate)
```

问题：`validate` 是个孤岛。

它被加进了图，但没有任何边把它接进执行路径。`planner` 直接连到了 `executor`，校验永远不会运行。

这类 bug 不会报错——节点没有入边，LangGraph 就是不执行它。第 22 课那个「零扇出时 reduce 被跳过」是同一类失败：**没有入边的节点会被静默跳过。**

## 三个常见误区

### 「Planner 比 ReAct 高级」

它们解决不同的问题。步骤数量事先不知道时，Planner 根本写不出计划。

### 「重规划很智能，失败了自动换路」

它会从头再来。没有幂等保护的话，重规划次数越多，副作用重复得越多。

### 「校验规则以后再补」

`validate` 是这个模式唯一的安全收益。没有它，Planner 只是把 ReAct 的不确定性提前打包了一下。

## 本课带走三句话

- 计划写成数据，才能在执行前校验、展示和修改
- 重规划会重做已完成的步骤，所以有副作用的步骤必须幂等
- 重规划次数要有上限，否则是第 10 课那个循环换了个形式

## 下一课

单元五还剩最后一个问题，也是最容易被高估的一个：什么时候才真的需要第二个 Agent。

[进入第 25 课：Multi-Agent，什么时候才需要多个 Agent](25-multi-agent.md)
