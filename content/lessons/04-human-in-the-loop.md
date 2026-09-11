---
title: "Agent（智能体）怎样暂停，等人类批准后再继续"
slug: "04-human-in-the-loop"
order: 4
status: "draft"
interactive: "human-approval"
verified_at: "2026-09-10"
tested_with: "LangGraph 1.2.11"
---

# Agent（智能体）怎样暂停，等人类批准后再继续

> 本课结果：你能在危险操作前放置 `interrupt()`（中断函数），用同一个 thread（会话线程）恢复流程，并解释为什么中断必须配合 checkpointer（检查点保存器）。

## 只看一句话的话

`interrupt()` 把问题交给图外的人，checkpointer 保存现场；人类回答后，再用 `Command(resume=...)`（恢复命令）和同一个 `thread_id`（会话标识）恢复。

`interrupt()` 暂停当前流程；checkpointer 保存暂停现场；`thread_id` 定位原来的会话；`Command(resume=...)` 把人的决定送回流程。

真正的人工审批不是弹出一个确认框，而是让后端执行流程能够安全地停住。

## 为什么不能只在前端放一个按钮

假设 Agent 准备删除文件。

这里的 Agent 会提出动作并沿图推进，但它不能绕过审批节点直接执行删除。

Agent 根据目标提出下一步动作；是否允许执行危险动作仍由图和人类审批控制。

网页当然可以显示“批准”和“拒绝”两个按钮。但如果后端图没有暂停，按钮出现时删除动作可能已经执行了。

人工审批必须进入执行逻辑：危险动作前，图停止；没有批准值，后面的节点就不能运行。

## 把它想成财务付款

员工可以填写付款申请，但超过额度后，银行不会因为页面上有“等待审批”四个字就自动安全。

真正的控制是：交易停在审批状态，审批人确认后，系统才拿着同一笔申请继续。

在 LangGraph（智能体流程编排框架）里，checkpoint（状态快照）保存申请现场，`thread_id` 标记是哪一笔流程，resume（恢复值）就是审批人的决定。

LangGraph 在暂停后保留可继续运行的流程结构；checkpoint 保存申请暂停时的现场；resume 携带审批人的决定来恢复流程。

这个比喻的边界是：课程示例只有 yes/no。真实审批还要记录审批人身份、时间、理由和权限。

## 本课的图很简单

流程只有三个业务节点：

```text
START → propose → approval → report → END
                     ⏸
                  等待人类
```

这里的 `START`（图入口）和 `END`（图出口）不是业务节点。

`START` 启动流程；`END` 标记流程完成。

`propose`（提议节点）、`approval`（审批节点）和 `report`（报告节点）组成了本课的业务流程。

`propose` 说明 Agent 打算做什么；`approval` 把问题交给人类并等待决定；`report` 在流程恢复后整理并输出结果。

本课代码不会真的删除任何文件。它只把“已删除”或“已取消”写进字符串，用来安全演示控制流。

## State（运行状态）保存要审批的对象

```python
class State(TypedDict):
    path: str
    result: str
```

这段代码使用了 `TypedDict`（类型字典）。

`TypedDict` 声明 State 必须包含哪些字段以及字段类型。

State 中的 `path`（文件路径）和 `result`（处理结果）记录了这次审批的数据。

State 让暂停前后的节点共享同一份现场；`path` 保存准备处理的文件路径；`result` 保存批准或拒绝后的处理结果。

真实产品还会增加 `requested_by`、`approved_by`、`reason` 和时间戳。但这些字段属于审计与账号系统，本课先不扩展。

## interrupt 把什么交给外面

审批节点这样写：

```python
def approval(state: State) -> dict:
    answer = interrupt({
        "question": f"确认删除 {state['path']} ?",
        "type": "yes/no",
    })
    if answer != "yes":
        return {"result": "已取消"}
    return {"result": f"已删除 {state['path']}"}
```

`interrupt()` 接收的对象会暴露给图外调用者。

这里传出问题和输入类型，网页或命令行就能据此显示审批界面。这个 payload（中断载荷）应该使用可序列化数据，不要把数据库连接、函数或复杂对象塞进去。

payload 把审批界面需要的问题、路径和输入类型送到图外。

第一次执行到 `interrupt()` 时，`answer` 还不存在。LangGraph 保存 State，并把中断信息返回给调用者。

## 中断为什么必须有 checkpointer

图暂停以后，要记住两件事：

1. 当时的 State 是什么
2. 哪个 thread 停在了哪个节点

所以图必须带 checkpointer：

```python
app = graph.compile(checkpointer=InMemorySaver())
```

这里使用了 `compile`（编译图）和 `InMemorySaver`（内存检查点保存器）。

`compile` 把节点、边和保存机制组合成可运行的应用；`InMemorySaver` 把教学实验的 checkpoint 临时保存在当前进程中。

调用时也必须提供 `thread_id`：

```python
cfg = {"configurable": {"thread_id": "t1"}}
```

没有 checkpointer，暂停现场无处保存。没有同一个 `thread_id`，恢复调用就找不到原来的现场。

## 第一次 `invoke`（调用图）只跑到暂停点

下面这次 `invoke` 调用不会完整执行：

`invoke` 启动或恢复一次图运行，并运行到结束或暂停位置。

```python
out = app.invoke(
    {"path": "/tmp/cache", "result": ""},
    cfg,
)
```

图运行 `propose`，进入 `approval`，然后在 `interrupt()` 处暂停。

中断信息会出现在返回值中：

```python
intr = out["__interrupt__"][0]
print(intr.value["question"])
```

在 LangGraph 的新版流式接口中，中断也可以通过专门的 interrupts 字段读取。本课程脚本使用当前 v1 返回形式，因此读取 `__interrupt__`。

## Command(resume=...) 把答案送回去

人类选择后，使用：

```python
app.invoke(Command(resume="yes"), cfg)
```

必须继续使用刚才的 `cfg`。

`"yes"` 会成为 `interrupt()` 的返回值，于是审批节点可以继续判断并写入结果。

拒绝时同样恢复，只是传入不同值：

```python
app.invoke(Command(resume="no"), cfg)
```

拒绝不是“什么都不做”。它也是一次明确的状态转移：把 `result` 更新为“已取消”，再沿安全路径结束。

## 恢复不是从 Python（编程语言）那一行原地苏醒

这是本课最容易写错的地方。

恢复时，包含 `interrupt()` 的节点会从开头重新执行。运行再次到达 `interrupt()` 时，LangGraph 取出 resume 值，让这次调用返回该值。

因此，写在 `interrupt()` 前面的代码可能再次运行。

下面这种写法有风险：

```python
def approval(state: State):
    charge_credit_card()  # 恢复时可能再次执行
    answer = interrupt("批准吗？")
```

危险副作用应该放在批准之后，或者设计成幂等操作：重复调用也不会产生第二次扣款、第二次发信或第二次删除。

同样，不要随意改变一个节点里多个 `interrupt()` 的顺序。恢复值按调用顺序匹配，顺序变化会让答案对应错问题。

## 互动实验：批准一条，拒绝一条

网页实验准备两项操作：

```text
/tmp/cache   → 可以批准
/etc/passwd  → 应该拒绝
```

第一项用于演示批准路径，第二项用于演示拒绝路径。

你要观察的不是文件是否真的删除。课程不会执行删除。你要观察图的状态：

```text
运行 → approval 暂停 → 显示 payload → 人类选择
    → 同 thread 恢复 → 写入 result → report → END
```

完成挑战的标准是：两条流程使用不同 `thread_id`，并得到不同 `result`。

## 自己运行真实代码

完整代码位于 [`lab/langgraph/examples/04_human_in_loop.py`](../../lab/langgraph/examples/04_human_in_loop.py)。

它不调用模型，也不执行真实删除，所以不需要 API Key（接口密钥）。在 `lab/langgraph` 目录运行：

API Key 用来验证程序是否有权调用模型服务；本课没有模型调用，所以不需要配置。

```powershell
uv run python examples/04_human_in_loop.py
```

当前脚本已经在本机实跑通过。你会看到：

```text
/tmp/cache 收到 yes → 已删除 /tmp/cache
/etc/passwd 收到 no → 已取消
```

“已删除”只是 State 中的演示文本，不代表脚本调用了文件系统删除命令。

## 审批点应该放在哪里

不是每个节点都需要人点一下。

审批适合放在结果难以撤销、权限较高或成本明显的动作前，例如：

- 删除或覆盖文件
- 向外部用户发送消息
- 支付、退款或下单
- 修改生产数据库
- 发布内容或部署生产版本
- 把敏感数据发送给第三方服务

如果读文件、列目录也全部审批，Agent 会退化成一个不停弹窗的遥控器。

判断标准不是“这个工具听起来危险吗”，而是“执行错了以后，代价是否难以恢复”。

## 三个常见误区

### “有 checkpointer 就是安全的”

不是。

checkpointer 负责保存和恢复，不负责验证审批人身份，也不阻止越权访问 thread。

### “拒绝就让程序直接崩掉”

不必。

拒绝应该有清晰的安全路径：更新状态、记录原因、取消动作，然后正常结束或返回 model（模型节点）重新规划。

model 根据拒绝结果选择新的处理方式。

### “副作用放在 interrupt 前后都一样”

不一样。

节点恢复时会重新从开头执行。审批前的副作用必须幂等，最好把不可逆动作放在批准之后的独立节点。

## 本课带走三句话

- `interrupt()` 暂停图，并把问题交给外部
- checkpointer 和同一个 `thread_id` 保存、定位并恢复现场
- 恢复会重新执行节点，副作用必须放对位置或保证幂等

这些规则让“人在回路中”成为执行约束，而不是界面装饰。

## 下一课

现在四个部件已经分别看懂：图、工具、记忆和审批。

第 05 课不再增加新 API（应用程序编程接口）。下一课只组合现有能力，并标出教学版与生产版之间还差什么。

API 让不同程序或服务交换请求与结果。

[进入第 05 课：把四块拼成第一个完整 Agent](05-complete-agent-blueprint.md)

## 延伸阅读

- [LangGraph 官方文档：Interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts)
- [LangGraph 官方文档：Persistence](https://docs.langchain.com/oss/python/langgraph/persistence)
