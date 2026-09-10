---
title: "持久化会话：换个进程还记得，才算真的记住"
slug: "15-persistent-sessions"
order: 15
status: "draft"
interactive: "process-restart"
verified_at: "2026-09-10"
runtime_note: "跨进程读取由脚本真的另起一个 Python 子进程验证；langgraph 1.2.11 + langgraph-checkpoint-sqlite 3.1.1，不需要 API Key"
---

# 持久化会话：换个进程还记得，才算真的记住

> 本课结果：你能把教学用的内存 checkpointer 换成外部存储，并用一个真正的新进程证明会话还在。

## 只看一句话的话

`InMemorySaver` 只在这个进程里有效；上线之前必须换成进程之外的存储。

> **术语说明**
>
> - **持久化**：把数据写到进程之外，重启后还能读回来。
> - **checkpointer（检查点保存器）**：负责保存和读取图的状态快照。

第 03 课演示了 thread 隔离，但有一句话没展开：进程一退，全部清空。

## 本地看不出问题，上线立刻出问题

本地开发时，你的 Python 进程一直开着，所以内存里的东西一直在。

线上不是这样。第 08 课列过三条：冷启动、超时、**进程不连续**。无服务器平台的两次请求根本不保证落在同一个实例上。

结果就是用户随机失忆：刷新一下，Agent 忘了刚才说的话；重试一次，它又想起来了。这类 bug 几乎没法靠本地复现。

## 先证明它确实丢

同一个进程里，`InMemorySaver` 工作正常：

```text
第二次调用时，恢复出 3 条历史，回答：你叫小白。
```

换一个 `InMemorySaver` 实例——这等价于换了一个进程：

```text
新 saver 里 thread a 的消息数：0
```

一条都没有。不是「找不到 thread」，是这份记忆压根不在这里。

## 换成 SqliteSaver，真的开一个子进程验证

```python
from langgraph.checkpoint.sqlite import SqliteSaver

with SqliteSaver.from_conn_string(db_path) as saver:
    app = graph.compile(checkpointer=saver)
    app.invoke({"messages": [("user", "我叫小白")]}, THREAD)
```

然后脚本**真的**用 `subprocess` 另起一个 Python 进程，只把文件路径交给它：

```python
subprocess.run([sys.executable, __file__, "--child", db_path], ...)
```

实跑结果：

```text
[主进程] 已写入 4096 字节
[子进程] 从数据库读到 thread a 的 2 条消息
[子进程] 第一条是：我叫小白
```

子进程没有继承任何内存，它只拿到一个文件路径。能读到消息，说明状态确实落在了进程之外。

**这一步不能省。**「换个 saver 实例」是模拟，「另起一个进程」是证明。上线前你要的是后者。

## 图一个字都不用改

对比两行：

```python
# 教学版
app = graph.compile(checkpointer=InMemorySaver())

# 上线版
app = graph.compile(checkpointer=SqliteSaver.from_conn_string(path))
```

节点、边、条件判断、消息处理，全都不动。

这正是 checkpointer 被设计成可替换组件的原因：存储是部署问题，不是业务逻辑问题。第 03 课说「换成 SQLite 或 Postgres，图本身一个字都不用改」，这一课把它验证了。

## 选哪一种存储

| 存储 | 适合 | 不适合 |
| --- | --- | --- |
| `InMemorySaver` | 单元测试、本地实验、教学 | 任何线上场景 |
| SQLite | 单机服务、小规模、自己用的工具 | 多实例部署、高并发写入 |
| Postgres 等共享数据库 | 多实例、需要备份和运维的生产环境 | 只想跑个脚本的场景 |

判断标准是：**会不会有第二个进程需要读到同一份数据？**会，就不能用内存；有多个实例同时写，就不能用单文件的 SQLite。

## 还没解决的问题

持久化解决了「记得住」，没有解决「谁能看」。

第 03 课那条边界仍然成立：`thread_id` 是运行配置，不是身份验证。现在状态落到了数据库里，这条边界反而更要紧了——数据库里躺着所有用户的对话，凭一个编号就能取。

谁能读哪个 thread，必须由服务端根据登录用户判断。这是第 29 课的内容，在那之前，接口不要公开暴露。

另外两件事也要提前想：

- **数据要能删。**用户要求删除自己的数据时，你得知道该删哪些行。
- **数据会一直长。**没有清理策略的话，checkpoint 表只增不减。

## 互动实验：重启之后还在不在

网页实验给你三个按钮：发消息、重启进程、切换 thread。

```text
内存存储 + 重启   →  历史清空
文件存储 + 重启   →  历史还在
文件存储 + 换 thread →  另一段历史，互不可见
```

通过条件：说出第 1 行和第 3 行的区别——一个是「数据没了」，另一个是「数据在，但不属于这个 thread」。

这两种情况在用户看来都是「它忘了我」，但排查方向完全相反。

## 自己运行真实代码

完整代码位于 [`lab/langgraph/examples/15_persistence.py`](../../lab/langgraph/examples/15_persistence.py)，**不需要 API Key**：

```powershell
uv run python examples/15_persistence.py
```

它需要 `langgraph-checkpoint-sqlite`，已经加进本仓库的依赖：

```powershell
uv add langgraph-checkpoint-sqlite
```

脚本会自己创建临时数据库、写入、开子进程读取，跑完自动清理。

## 本课挑战：这段代码为什么还是会丢

```python
def handle_request(message, thread_id):
    saver = InMemorySaver()                       # 每个请求新建
    app = graph.compile(checkpointer=saver)
    return app.invoke({"messages": [("user", message)]},
                      {"configurable": {"thread_id": thread_id}})
```

问题：每个请求都新建一个 `InMemorySaver`。

就算这个服务一直不重启、所有请求都落在同一个进程，历史照样每次清零——因为存储本身被重建了。这段代码里 `thread_id` 完全没起作用，它指向的记忆永远是空的。

这也说明一件事：**「换成外部存储」不只是换个类名，还要保证同一份存储被复用。**

## 三个常见误区

### 「本地测试没问题，线上应该也没问题」

本地进程一直在，线上不是。这个差异恰恰是内存存储唯一的失败方式，本地永远测不出来。

### 「用了数据库就等于安全了」

数据库解决的是「存不存得住」。「谁能读」是另一回事——凭 `thread_id` 就能取走别人的对话，这个洞在第 29 课之前一直开着。

### 「SQLite 太简单，直接上 Postgres」

单机服务用 SQLite 完全够，而且少一个要运维的组件。判断标准是有没有多个实例同时写，不是「看起来专不专业」。

## 本课带走三句话

- `InMemorySaver` 一换进程就清空，这是它唯一的失败方式，本地测不出来
- 换成外部存储只改一行，但要保证同一份存储被复用
- 存得住不等于看得对，谁能读哪个 thread 是另一个问题

## 下一课

单元三到此结束：State 有合同，合并有规则，上下文有预算，会话能持久。

从下一课开始进入单元四，让 Agent 变得可控、可恢复——先回答「什么动作必须问人」。

[进入第 16 课：审批策略](16-approval-policy.md)
