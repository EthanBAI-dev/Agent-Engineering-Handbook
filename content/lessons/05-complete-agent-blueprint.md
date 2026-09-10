---
title: "把四块拼起来：设计你的第一个完整 Agent（智能体）"
slug: "05-complete-agent-blueprint"
order: 5
status: "draft"
interactive: "agent-blueprint"
source_type: "editorial-synthesis"
verified_at: "2026-09-10"
---

# 把四块拼起来：设计你的第一个完整 Agent（智能体）

> 本课结果：你能为一个文件整理 Agent 画出完整执行蓝图，正确放置工具循环、会话、状态保存和人工审批。

## 只看一句话的话

一个可信的 Agent 不是“模型加很多工具”，而是让 State（运行状态）、Edge（边）、工具、记忆和审批各自只承担一种责任。

其中，State保存共享现场；Edge控制下一步路线；工具执行真实动作；记忆延续需要保留的上下文；审批拦住高风险操作，等待人类决定。

第 05 课不增加新 API（应用程序编程接口）。它检验你能不能把前四课拼成一个系统。

它让不同程序之间交换请求和结果。

## 为什么先画蓝图，不急着写代码

当代码里同时出现 model（模型节点）、tools（工具节点）、checkpoint（状态快照）和 interrupt（中断函数）时，错误很难只看某一行发现。

其中，model做出下一步决策；tools执行真实函数；checkpoint保存某一时刻的现场；interrupt暂停当前流程。

最常见的问题不是语法，而是责任放错位置：让模型直接执行危险动作、让 ToolNode（工具执行节点）决定业务意图，或者把 `thread_id`（会话标识）当成登录权限。

其中，ToolNode执行模型已经提出的工具调用，不替模型理解用户；thread_id定位一次会话，不代表登录身份或访问权限。

所以先画执行路径。只要蓝图不对，代码写得再快也只是更快地制造返工。

## 这次要设计什么

我们设计一个“文件整理 Agent”。

用户可以让它查看下载目录、把文件移动到分类文件夹，并清理明确不要的缓存文件。

为了保持安全，本课只做架构设计，不执行真实文件操作。将来实现时也应该先使用测试目录，而不是直接指向整块硬盘或用户主目录。

## 先写清任务边界

Agent 可以：

- 列出指定测试目录中的文件
- 根据扩展名提出分类建议
- 把文件移动到已允许的子目录
- 在删除前展示完整路径并请求批准
- 记住同一 thread（会话线程）中用户刚确认的分类偏好

Agent 不可以：

- 访问允许目录之外的路径
- 未经批准删除文件
- 覆盖同名文件却不说明
- 把 `thread_id` 当成用户身份
- 在浏览器里暴露模型 API Key（接口密钥）

任务边界比提示词更重要；提示词会被模型解释，工具权限和图的 Edge 才是执行约束。

其中，thread区分不同会话中的消息和状态；API Key（接口密钥）验证模型调用权限，必须只保存在服务端。

## 第一步：定义 State 保存什么

把前四课需要的数据放到一份 State 里：

```python
class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    root_path: str
    pending_action: dict | None
    result: str
```

这段 State 使用了 `TypedDict`（类型字典）、`Annotated`（附加规则标注）和 `add_messages`（消息归并规则）。

其中，TypedDict声明 State 必须有哪些字段；Annotated为字段附加类型之外的规则；add_messages把新消息追加到 messages（消息列表），而不是覆盖旧消息。

`messages` 保存用户、model 和 tools 的消息。

`root_path`（允许操作的根目录）、`pending_action`（待审批动作）和 `result`（执行结果）保存了文件操作需要的数据。

其中，root_path限制 Agent 能操作的测试目录；pending_action保存正在等待审批的动作；result保存动作执行或取消后的结果。

这里没有把所有可能数据都塞进去。State 只保留下游节点真正需要共享的现场。

## 第二步：列出节点，而不是列出功能口号

这张图至少需要五类节点：

```text
model          理解请求，提出工具调用
safe_tools     执行列目录、读取元数据等可恢复动作
approval       对删除、覆盖等动作发出 interrupt
risky_tools    只执行已经批准的危险动作
report         整理结果或错误，交回用户
```

这里出现了 `safe_tools`（安全工具节点）、`approval`（审批节点）、`risky_tools`（高风险工具节点）和 `report`（报告节点）。

其中，safe_tools执行低风险操作；approval暂停并等待人类决定；risky_tools执行已经批准的高风险动作；report整理结果并交回用户。

“智能”“自动规划”“长期记忆”不是节点名。

好的节点名应该让你一眼知道它做什么，也能判断失败时该查哪里。

## 第三步：先闭合普通工具循环

安全工具沿用第 02 课的结构：

```text
model ──safe tool call──→ safe_tools
  ↑                          │
  └────── tool result ───────┘
```

这里的 safe tool call（安全工具调用请求）和 tool result（工具返回结果）分别位于调用前后。

其中，safe tool call描述要执行的低风险动作和参数；tool result把工具执行结果送回 model。

model 只提出调用。safe_tools 执行后，把结果追加回 messages，再回到 model。

如果 model 已经能够回答，就从条件 Edge 进入 report 或 `END`（图出口）。

它明确标记这次流程已经结束。

这一部分不需要审批，因为列出测试目录和读取文件扩展名不会修改文件。

## 第四步：危险工具必须走另一条路

删除调用不能和读取调用共用一条无审批路径。

更清晰的设计是：

```text
model ──delete tool call──→ approval
                              │
                 ┌──批准──────┴──→ risky_tools → model
                 │
                 └──拒绝─────────→ report → END
```

approval 节点把 `pending_action` 中的完整路径和动作类型交给人类。

批准后才进入 risky_tools。拒绝时写入“已取消”，然后沿安全路径结束。

不要先执行删除，再询问用户是否满意。那不是审批，只是事后通知。

## 第五步：checkpointer（检查点保存器）让等待成为可能

图需要在 approval 处暂停，所以使用 `compile`（编译图）时必须传入 checkpointer。

其中，compile把节点、Edge 和保存机制组合成可运行的 Agent 应用；checkpointer保存图的 checkpoint，让暂停后的流程能够找到原现场。

每次运行还要携带稳定的 `thread_id`：

```python
config = {
    "configurable": {
        "thread_id": "file-organizer-demo-001"
    }
}
```

同一个 thread 让恢复调用找到刚才等待审批的 checkpoint。

但这个字符串不是账号权限。真实网站必须由服务端生成或校验 thread 所属用户，不能允许浏览器随意猜别人的 id。

## 完整蓝图

把五步拼起来：

```text
                         ┌──────── safe_tools ────────┐
                         │                            │
START → model ───────────┼────────────────────────────┘
          │              │
          │              └── 没有调用 → report → END
          │
          └── 危险调用 → approval ⏸
                            │
                   ┌──批准──┴──→ risky_tools → model
                   │
                   └──拒绝────→ report → END

整张图：compile(checkpointer=...)
每次运行：configurable.thread_id = 当前会话
```

完整蓝图从 `START`（图入口）开始。

它启动整张图；与 END 一起标明流程边界。

这张图里没有任何一个节点“负责整个 Agent”。

model 负责决定，tools 负责执行，Edge 负责控制路线，checkpointer 负责保存现场，人类负责承担不可逆决策。

## 互动挑战：把打乱的卡片排回去

网页会给出这些卡片：

```text
model
safe_tools
approval
risky_tools
report
checkpointer
thread_id
```

你的任务是把它们放进正确位置，并满足五个条件：

1. `safe_tools` 执行后回到 model
2. 删除动作先进入 approval
3. approval 拒绝后不能进入 risky_tools
4. 图带有 checkpointer
5. 暂停与恢复使用同一个 `thread_id`

挑战通过的标准不是画得和示例一模一样，而是这五条约束全部成立。

## 失败时应该回到哪里

完整 Agent 必须为失败留出路线。

### model 生成了不存在的工具名

不要让程序崩溃后沉默。

tools 应返回结构化错误，让结果回到 model，model 可以改用合法工具或向用户说明失败。

### 文件在审批期间被别人移动了

批准值不能证明目标仍然存在。

risky_tools 执行前必须重新检查路径、允许目录和目标状态。审批的是一个明确动作，不是一张永久通行证。

### 恢复时进程已经重启

`InMemorySaver`（内存检查点保存器）中的数据会在进程退出后丢失。

它把 checkpoint 临时放在当前进程内存中，只适合教学和测试。

这正是教学版与生产版的分界：线上需要外部持久化 checkpointer，而不是依赖某个进程一直活着。

### 同名文件会被覆盖

移动工具应该明确选择：拒绝、重命名或再次审批。

不能把覆盖行为藏在工具内部默认执行，因为用户批准的是“整理文件”，不一定批准“丢失旧文件”。

## 从教学版到生产版还差什么

前四课的代码足够解释机制，但还不能直接变成公开产品。

生产化至少还要补上：

- **持久化存储**：用外部数据库保存 checkpoint
- **身份与权限**：账号只能访问自己的 thread 和文件
- **服务端密钥**：API Key 不进入浏览器代码
- **目录沙箱**：所有路径解析后都必须位于允许根目录
- **调用限额**：限制用户、IP（网络地址）、thread 的模型与工具调用次数
- **超时和重试**：外部服务失败时有明确策略
- **审计记录**：保存谁在什么时候批准了什么
- **可观察性**：记录节点耗时、错误和模型用量
- **幂等性**：恢复或重试不会重复产生副作用

本课只要求你能指出这些缺口，不要求一次全部实现。

## 不要把所有工具都设成危险

安全设计不是审批越多越好。

如果每次列目录、读取文件名、计算哈希都要求人确认，Agent 会失去连续工作的价值。

更合理的做法是按后果分级：

```text
只读、可恢复、低成本        → 自动执行并记录
会修改但容易撤销            → 视范围决定是否审批
删除、付款、外发、生产变更  → 强制审批
```

风险来自错误后果，不来自工具名字听起来是否高级。

## 你的蓝图通过了吗

拿自己的图逐项检查：

- State 中有下游节点真正需要的信息
- model 不直接执行工具代码
- 工具结果会回到 model
- 不同 thread 的 checkpoint 不混在一起
- 危险动作前存在真正的执行暂停
- 拒绝有明确安全路径
- 副作用位于批准之后，或保证幂等
- 教学存储没有被误称为生产数据库

八项都能回答，说明你已经不只是会抄 LangGraph（智能体流程编排框架）代码，而是能判断一张 Agent 图是否合理。

它按照蓝图控制节点路线、保存状态，并支持暂停和恢复。

## 前 6 课真正学到的东西

第 00 课让环境能够运行。

第 01 课让你看见图怎样改变 State。第 02 课把 model 与 tools 放进循环。第 03 课让 State 跨调用保存。第 04 课让流程暂停并接受外部决定。

第 05 课把它们组合成一句完整定义：

> Agent 是一个由 State 保存现场、由 Node 执行动作、由 Edge 控制路线，并能在工具结果和人类决定之后继续运行的系统。

这不是所有 Agent 的唯一学术定义，但它足够指导接下来的工程实践。

## 下一阶段

接下来不要立刻增加更多抽象概念。

先把这张蓝图做成真实服务：加入 `/api/agent`（Agent 服务接口），让服务端运行 Python 版 LangGraph；然后加入调用限额，最后再接账号、数据库和长期记忆。

其中，Python运行服务端的 LangGraph 和真实工具代码；/api/agent接收网页请求，并返回 Agent 的运行结果。

[返回课程总纲](00-preface-and-setup.md)
