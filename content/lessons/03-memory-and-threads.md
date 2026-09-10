---
title: "同一个 thread（会话线程）为什么记得，换一个就忘了"
slug: "03-memory-and-threads"
order: 3
status: "draft"
interactive: "thread-memory"
verified_at: "2026-09-10"
runtime_note: "图结构已验证；真实模型对话等待本地 API Key"
---

# 同一个 thread（会话线程）为什么记得，换一个就忘了

> 本课结果：你能解释 checkpointer（检查点保存器）、checkpoint（状态快照）和 `thread_id`（会话标识）的关系，并判断一条消息应该属于哪个会话。

## 只看一句话的话

checkpointer 把每一步 State（运行状态）保存成 checkpoint，`thread_id` 告诉 LangGraph（智能体流程编排框架）这份 State 属于哪一段会话。

其中，State保存当前现场；checkpoint记录某一时刻的 State；checkpointer存取 checkpoint；thread_id把记录归到不同会话；LangGraph按图运行节点并协调保存和恢复。

同一个 `thread_id` 会接着过去运行；换一个 id，就像打开一段全新对话。

## Agent（智能体）为什么会“忘”

Agent 的工作依赖 State 中现有的信息；State 没保存，它就没有过去可读。

它根据消息选择步骤、调用工具，并结合已有状态继续行动。

第 02 课已经把所有消息放进 `MessagesState`（消息状态）。

它在一次图运行中持续累积对话和工具消息。

但那只能保证同一次图运行里，消息不会互相覆盖。下一次重新调用图时，如果没有保存机制，程序仍然从你新传入的 State 开始。

这不是模型突然失忆。是上一轮 State 根本没有被交给下一轮。

## 把它想成酒店前台

checkpointer 像酒店前台保存的入住记录，`thread_id` 像房间号。

你报同一个房间号，前台能找到之前的记录。你报另一个房间号，前台会拿出另一份记录，或者新建一份。

这个比喻的边界是：`thread_id` 本身不是身份验证。知道一个编号，不代表系统就应该允许你读取对应数据。真实产品还需要账号、权限和租户隔离。

## checkpoint 保存的不是一句摘要

checkpoint 可以理解为图在某一步的快照。

它记录的不只是最后一句聊天文本，还包括当时的 State，以及图继续运行需要的位置和元数据。

课程示例使用 `InMemorySaver`（内存检查点保存器）：

它把 checkpoint 暂存在当前进程的内存中，适合无需数据库的教学实验。

```python
from langgraph.checkpoint.memory import InMemorySaver
```

再在编译图时传入：

```python
app = graph.compile(checkpointer=InMemorySaver())
```

代码中的 `compile`（编译图）会生成可以调用的应用 `app`。

它把节点、边和 checkpointer 组合成可运行的图。

从这一刻开始，图会在执行过程中保存 checkpoint。

图里的 model（模型节点）不需要为了“记忆”而重写：

它读取当前消息并调用一次模型。

```python
def call_model(state: MessagesState) -> dict:
    return {"messages": [model.invoke(state["messages"])]}
```

这里使用了 `model.invoke`（调用模型方法）。

它把当前 messages 发送给模型，并取得一条新的模型消息。

保存和恢复由图的运行层处理，节点继续只负责自己的工作。

## thread_id 给 checkpoint 分组

有了 checkpointer，还要说明“这次运行属于谁”。

课程使用下面的配置：

```python
cfg = {"configurable": {"thread_id": thread}}
```

然后把同一份配置传给图：

```python
out = app.invoke({"messages": [("user", text)]}, cfg)
```

这里使用了 `app.invoke`（调用图方法）。

它把输入和会话配置交给整张图，并运行到结束或暂停位置。

当 `thread="a"` 时，产生的 checkpoint 都归到会话 `a`。

下一次仍然传 `thread="a"`，LangGraph 会先恢复这段会话的 State，再追加新消息。

如果改成 `thread="b"`，程序会读取 `b` 的历史。`b` 还没有历史时，它就是一段新会话。

## 三次提问会发生什么

示例依次执行：

```python
ask("记住：我在学 LangGraph，我叫小白。", thread="a")
ask("我叫什么？在学什么？", thread="a")
ask("我叫什么？", thread="b")
```

前两次使用相同的 `thread_id`。

第二次调用时，model 能看到 `a` 中第一轮保存的消息，因此具备回答“小白”和“LangGraph”的上下文条件。

第三次改用 `b`。`b` 的 State 中没有第一轮消息，因此不应把 `a` 的内容当作自己的历史。

真实模型的具体措辞可能变化。本课要验证的是输入消息是否按 thread 隔离，不把某一句自然语言回复当成唯一标准答案。

## 互动实验：在 a 和 b 之间切换

网页实验会同时展示两列消息：

```text
thread a                     thread b
────────                     ────────
记住：我叫小白              （空）
我叫什么？                  我叫什么？
```

你每次提交消息时，先选择 thread。

实验应让你观察三件事：

1. 新消息只追加到当前 thread
2. 切换 thread 不会删除另一边的历史
3. 回到旧 thread 时，之前的消息仍然存在

挑战不是让模型背答案，而是把三条新消息放进正确的 thread。

## 直接查看保存下来的 State

LangGraph 不要求你猜 checkpointer 里有什么。

可以使用 `get_state`（读取状态方法）直接读取某个 thread 的当前快照：

它取出指定会话最近保存的 State，供程序或开发者检查。

```python
snap = app.get_state({"configurable": {"thread_id": "a"}})
print("thread a 存了", len(snap.values["messages"]), "条消息")
```

`snap.values` 是这一刻恢复出来的 State。

调试记忆问题时，先看 State 里是否真的有消息，再判断模型为什么没有使用它。不要一看到回答不对，就先归因于“模型记性差”。

## 自己运行真实代码

完整代码位于 [`lab/langgraph/examples/03_memory.py`](../../lab/langgraph/examples/03_memory.py)。

它会调用真实模型。按第 00 课配置 API Key（接口密钥）后，在 `lab/langgraph` 目录运行：

它验证程序是否有权使用模型服务。

```powershell
uv run python examples/03_memory.py
```

当前仓库已经验证图能够携带 `InMemorySaver` 正确构建。由于本地没有 API Key，课程不声称已验证某个固定自然语言回答。

运行后重点检查：

- 两次 `thread="a"` 使用同一段消息历史
- `thread="b"` 不包含 `a` 的消息
- `app.get_state` 能读取 `a` 的快照

## InMemorySaver 能做什么

`InMemorySaver` 把 checkpoint 放在当前 Python（编程语言运行环境）进程的内存中。

它运行本地课程代码；这里的进程退出后，进程内存也会随之清空。

它非常适合学习、单元测试和本地小实验，因为不需要安装数据库。

但进程一旦退出，内存就清空。部署到无服务器平台时，不同请求也不保证落在同一个进程里。

所以它不能承担可靠的线上会话存储。

## 会话记忆不等于长期记忆

本课的“记忆”准确说是 thread 级 State 持久化。

它让一段对话可以继续，但不会自动完成下面这些事：

- 从几十次历史会话中提取稳定用户偏好
- 判断哪些内容应该长期保留
- 跨用户安全检索资料
- 压缩过长上下文
- 在数据库中执行权限隔离和删除请求

这些属于更完整的长期记忆与数据工程。后续课程会单独处理，不能把 `InMemorySaver` 当作生产数据库。

## 本课挑战：判断消息属于谁

现在有三条操作：

```text
1. thread a：记住我叫小白
2. thread b：记住我喜欢咖啡
3. thread a：我叫什么？
```

第三步执行前，`thread a` 应该能看到第 1、3 条消息，但不能看到第 2 条。

如果它看到了咖啡偏好，说明你的 thread 隔离出了问题。

如果它连“小白”也看不到，按顺序检查：

1. 编译图时是否传入 checkpointer
2. 两次调用是否真的使用相同 `thread_id`
3. 配置是否放在 `configurable` 下
4. 新消息是否仍以 `messages` 字段传入

## 三个常见误区

### “用了 thread_id 就有登录系统”

没有。

`thread_id` 是运行配置，不是账号、密码或访问控制。公开产品必须由服务端判断当前用户能访问哪些 thread。

### “checkpointer 会自动记住所有用户偏好”

不会。

它保存 State，但不会替你决定哪些信息值得长期提取，也不会自动建立知识检索策略。

### “内存存储在本机能用，线上也一定能用”

不成立。

本地进程通常连续存在；线上函数可能重启、扩容或切换实例。生产环境需要外部持久化存储。

## 本课带走三句话

- checkpointer 保存图的 State 快照
- `thread_id` 把快照归到不同会话
- `InMemorySaver` 适合学习，不是可靠的生产数据库

下一课会利用 checkpoint 做一件更重要的事：让图在中途真正停下来，等人类回答后再从原地恢复。

## 下一课

[进入第 04 课：Agent 怎样暂停，等人类批准后再继续](04-human-in-the-loop.md)
