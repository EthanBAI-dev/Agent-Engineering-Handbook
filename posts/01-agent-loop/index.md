---
title: "编码 Agent 到底在循环什么——以及你只有三个地方能插手"
slug: 01-agent-loop
module: 1
status: draft
date: 2026-09-07
tools_version: "Claude Code v2.x"
verified_at: 2026-09-07
tags: [mental-model, agentic-loop, verification]
---

> 适用版本：Claude Code v2.x ｜ 验证日期：2026-09-07

## 场景

你让它「把登录模块重构一下」，然后盯着屏幕看它读文件、改代码、又读文件。
十分钟后它说「已完成」。你打开 diff，发现它漏了一个分支；你告诉它，它改了；
又漏了另一个。半小时过去，你比自己写还累。

问题不在于它不够聪明。问题在于**你把自己放进了它的循环里**——
而这件事，本来是可以避免的。

## 机制：它在循环什么

Claude Code 官方文档把这个循环拆成三个阶段：**收集上下文（gather context）→
采取行动（take action）→ 验证结果（verify results）**。三个阶段并不是严格串行，
而是反复交织的：

> The loop adapts to what you ask. A question about your codebase might only need
> context gathering. A bug fix cycles through all three phases repeatedly.
> —— [Claude Code Docs · How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works)（访问于 2026-09-07）

![Agent 的三阶段循环：你的提示词进入「收集上下文」，经「采取行动」到「验证结果」；没通过就回到收集阶段，通过才交付。图上标出三个可干预的位置：入口收窄范围、中途按 Esc 纠偏、出口给一个可自跑的检查。](../../assets/diagrams/agent-loop.svg)

举个官方给的例子。你说「修好失败的测试」，它可能会：

1. 跑测试套件，看哪些挂了
2. 读报错输出
3. 搜索相关源文件
4. 读这些文件，理解代码
5. 编辑文件修复问题
6. **再跑一遍测试确认**

每一次工具调用返回的信息，都会喂回循环，决定下一步做什么。
文档里有一句话点破了本质：Claude Code 是包在模型外面的
**agentic harness**（智能体外壳）——它提供工具、上下文管理和执行环境，
把一个语言模型变成能干活的编码 Agent。

**理解这个循环的实际价值在于：它告诉你，你只有三个地方能插手。**

| 干预点 | 位置 | 你能做的事 |
| --- | --- | --- |
| **A · 入口** | 循环开始前 | 收窄范围，决定它去哪找上下文 |
| **B · 中途** | 循环运行中 | 打断、纠偏、重置 |
| **C · 出口** | 每轮结束时 | 决定「做完了」由谁判断 |

大多数人只用了 A 和 B——不停地改提示词、不停地打断纠正。
**真正拉开差距的是 C。**

## 怎么做

### 干预点 C：给它一个能自己跑的检查

这是本文最重要的一条。官方文档的原话是：

> Claude stops when the work looks done. Without a check it can run, "looks done"
> is the only signal available, and **you become the verification loop**: every
> mistake waits for you to notice it.
> —— [Claude Code Docs · Best practices](https://code.claude.com/docs/en/best-practices)（访问于 2026-09-07）

翻译过来：**你没给它一个能自己跑的检查，你就是那个验证循环。**
每一个错误都得等你发现。

![左边：没有可自跑的检查时，Agent 干完活只能说「看起来做完了」，然后等你来看、你写反馈、再回到 Agent——瓶颈是你的注意力，你必须全程盯着。右边：有可自跑的检查时，Agent 干活后自己跑测试，失败就读报错重来，通过才交付并出示证据，你只审查结果——瓶颈是检查的质量，你可以走开。](../../assets/diagrams/verify-loop.svg)

「检查」可以是任何**返回通过/失败信号**、且它在对话里读得到的东西：
测试套件、构建的退出码、linter、把输出和 fixture 做 diff 的脚本、
甚至一张浏览器截图和设计稿的对比。

改写提示词只要一句话的成本：

| | 之前 | 之后 |
| --- | --- | --- |
| 提示词 | 实现一个校验邮箱的函数 | 写 `validateEmail` 函数。用例：`a@b.com` 通过，`invalid` 不通过，`a@.com` 不通过。实现完把测试跑一遍 |
| 谁在验证 | 你 | 它自己 |
| 你的动作 | 读代码、找漏洞、写反馈、等它改 | 看它贴出来的测试输出 |

官方还给了另外两个方向的改写，同样是把验证标准塞进提示词：

- **UI 改动**：把「让仪表盘好看点」换成「\[贴设计稿\] 实现这个设计，然后截图和原图对比，列出差异并修复」
- **构建失败**：把「构建挂了」换成「构建报这个错：\[贴错误\]。修好并验证构建成功。**解决根因，不要把错误压制掉**」

### 把检查从「建议」升级成「门禁」

同一个检查，可以有四种强度。**成本递增，但换来的是「你能走多远」**：

| 强度 | 做法 | 适合 |
| --- | --- | --- |
| 1. 写进提示词 | 「实现完把测试跑一遍」 | 今天就能用，任何任务 |
| 2. 设成会话目标 | [`/goal`](https://code.claude.com/docs/en/goal) 条件，每轮由独立评估器复查 | 一次会话内的长任务 |
| 3. Stop hook | 用 [Stop hook](https://code.claude.com/docs/en/hooks) 跑脚本，不通过就不许结束回合 | 确定性门禁、团队规矩 |
| 4. 第二意见 | 用[验证子 Agent](https://code.claude.com/docs/en/sub-agents) 让另一个模型试图推翻结论 | 干活的和判分的不能是同一个 |

第 4 条的逻辑值得单独说：**干活的 Agent 不应该是给自己打分的那个**。
让一个全新上下文的模型去「试图证明这个结果是错的」，比让它自己复查有效得多。

### 一个额外要求：让它出示证据

不要接受「已完成」这三个字。要求它贴出**测试输出、跑了什么命令、返回了什么**，
或者结果截图。

> Have Claude show evidence rather than asserting success.
> Reviewing evidence is faster than re-running the verification yourself.

审查证据比你自己重跑一遍快得多，而且对**你没盯着的那些会话**同样有效。

### 干预点 B：纠偏要早，但别纠第三次

- `Esc` 中途打断，上下文保留，可以直接改方向
- `Esc Esc` 或 `/rewind` 回到之前的对话和代码状态
- `/clear` 在不相关任务之间重置上下文

有一条经验规则很值钱：

> If you've corrected Claude more than twice on the same issue in one session,
> the context is cluttered with failed approaches.

**同一个问题纠正超过两次，就别纠第三次了。** 此时上下文里堆满了失败的尝试，
它们会持续干扰后面的推理。正确做法是 `/clear`，然后带着你刚学到的东西
重写一个更具体的提示词。官方的判断是：一个干净会话配一个好提示词，
几乎总是打得过一个堆满纠正记录的长会话。

### 干预点 A：入口不要说「调研一下」

官方列的失败模式里有一条叫 **infinite exploration**（无限探索）：
你让它「调研一下」却没划范围，它读了几百个文件，把上下文塞满了。

修法有两个：**把调研范围收窄**，或者**丢给子 Agent** ——
子 Agent 在自己独立的上下文窗口里干活，它的工具调用不进入你的主上下文，
干完只把摘要带回来。

同时注意，入口不等于要事无巨细地指挥。官方的措辞是 **delegate, don't dictate**：

```text
结账流程对信用卡过期的用户是坏的。
相关代码在 src/payments/ 下。帮我查一下并修复。
```

你不需要告诉它读哪些文件、跑什么命令——那是它的活。
你要给的是**方向和边界**，不是步骤。

## 效果

同一个任务（修一个已知会挂的测试），两种提示词：

| | 「修一下这个 bug」 | 「修复后跑 `npm test`，贴出输出，解决根因不要压制错误」 |
| --- | --- | --- |
| 你的介入次数 | 每轮都要看 diff、判断对错 | 只在它贴出通过的输出后审查一次 |
| 错误暴露时机 | 你发现时 | 它自己跑测试时 |
| 你能不能走开 | 不能 | 能 |

差别不在模型能力，**在于「做完了」这个判断由谁做出**。

## 边界与反模式

- ❌ **别把「有测试」当成「有验证」。** 如果测试覆盖不到它改的路径，那个绿色的勾是假的。检查的质量决定了这套办法的上限——你只是把瓶颈从「你的注意力」换成了「检查的质量」，没有消灭瓶颈。
- ❌ **别给验证不了的任务开自动模式。** 官方失败模式里的 **trust-then-verify gap**：它产出一个看起来很合理、但边界情况全错的实现。**验证不了的东西，就别合并。**
- ⚠️ **不是所有任务都值得先建检查。** 探索性任务（「这个模块大概怎么组织的」）本来就没有通过/失败，硬造一个检查是浪费。这类任务的干预点在 A 不在 C。
- ⚠️ **纠正两次就 `/clear` 是启发式，不是铁律。** 如果你正深陷一个复杂问题、而历史本身有价值，让上下文累积是对的。官方自己也说这些模式是起点不是教条。
- ❌ **别用「行数」或「速度」判断它干得好不好。** 唯一可靠的信号是那个检查过没过，以及它贴出的证据你认不认。

## 延伸阅读

- [How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works) —— 三阶段循环、工具分类、agentic harness 的定义
- [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices) —— 「给它一个能验证的东西」是全文第一节，以及 5 个常见失败模式
- [Explore the context window](https://code.claude.com/docs/en/context-window) —— 上下文压缩时什么会活下来（下一篇的主题）
- [Sub-agents](https://code.claude.com/docs/en/sub-agents) —— 独立上下文窗口，用来隔离大规模调研

> 本文引用的官方文档已镜像在本仓库 [`references/anthropic-claude-code/`](../../references/anthropic-claude-code/)，
> 可离线全文检索。

---

**下一篇**：上下文窗口是预算，不是容器——`/compact` 之后到底什么活了下来。
