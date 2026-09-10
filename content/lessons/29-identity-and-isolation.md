---
title: "账号与数据隔离：thread_id 不是身份验证"
slug: "29-identity-and-isolation"
order: 29
status: "draft"
interactive: "two-accounts"
verified_at: "2026-09-10"
runtime_note: "越权读取与加上归属检查后的拒绝行为均已在 langgraph 1.2.11 + SqliteSaver 实跑验证；不需要 API Key"
---

# 账号与数据隔离：thread_id 不是身份验证

> 本课结果：你能挡住「换个 thread_id 就读到别人对话」，并说出为什么「无权」和「不存在」要回同一句话。

## 只看一句话的话

数据库里躺着所有用户的对话，而取用它们只需要一个编号——这道缺口必须由服务端补上。

> **术语说明**
>
> - **归属（ownership）**：某个 thread 属于哪个用户，由服务端记录。
> - **越权**：读到或改到本不该属于自己的数据。

这句话从第 03 课起说了五次，这一课把它兑现。

## 先看缺口有多大

第 15 课把会话搬进了数据库。两个用户各说了一句话：

```text
alice 在 t_alice：我的身份证号是 1234
bob   在 t_bob  ：我的银行卡尾号是 5678
```

现在 bob 请求 `t_alice`：

```text
bob 请求 t_alice → 拿到 2 条消息
第一条：我的身份证号是 1234
```

**这不是「攻击」，只是换了个参数。**而 `thread_id` 常常出现在 URL 里、出现在前端代码里、出现在分享出去的链接里。

## 补上归属检查

```python
OWNERSHIP: dict[str, str] = {}      # 服务端的表，不来自请求

def safe_read(app, thread_id: str, current_user: str):
    owner = OWNERSHIP.get(thread_id)
    if owner is None or owner != current_user:
        raise PermissionError("找不到这个会话")
    ...
```

实跑结果：

```text
alice  请求 t_alice          → 允许，2 条消息
bob    请求 t_alice          → 拒绝：找不到这个会话
bob    请求 t_bob            → 允许，2 条消息
bob    请求 t_nonexistent    → 拒绝：找不到这个会话
```

## 为什么后两行是同一句话

如果分开回答：

```text
t_alice   → 「无权访问」   ← 等于确认了这个 thread 存在
t_xxxxxx  → 「不存在」
```

攻击者可以靠这个差别**枚举**出哪些 `thread_id` 是真的，进而知道这个系统有多少用户、谁在什么时候用过。

两种情况回同一句「找不到这个会话」，就不泄漏这个信息。

> **术语说明｜信息泄漏**
> 系统在拒绝时，通过错误信息的差别透露了本不该透露的事实。

## 当前用户从哪里来

这是最容易做错的一步：

```text
✗ 请求体里的 user_id      —— 客户端可以随便填
✗ URL 参数里的 user_id    —— 同上
✓ 服务端验证过的会话或令牌 —— 客户端改不了
```

把 `user_id` 当成一个普通参数接收，等于让每个人自称是任何人。

**第 12 课那个静默丢弃在这里会要命。**以为传了 `user_id`，其实字段名不在 schema 里，权限判断拿到 `None`——如果代码写成「owner != user 才拒绝」，`None` 就一路放行了。

所以那段检查要写成 `if owner is None or owner != current_user`，**先挡住空值，再比较**。

## 归属表不能放进 State

`OWNERSHIP` 是服务端的数据，不是图的 State。

放进 State 的东西，第 17 课的 `update_state` 就能改。审批界面上多一个字段，就成了越权的入口——而那个界面本来是用来提升安全性的。

**谁拥有什么，只能由服务端单独保管。**

## 别忘了次要入口

主要入口（发消息、读历史）大家都会检查。容易漏的是这些：

- **恢复**：`Command(resume=...)` 也带 `thread_id`，谁在批准这个中断？
- **时间旅行**：第 18 课的 `get_state_history` 同样按 thread 取数据
- **审批界面**：第 17 课的 `update_state` 能改别人的会话吗？
- **导出、分享、调试面板**：常常是后加的，也常常忘了检查

判断方法很简单：**代码里所有出现 `thread_id` 的地方，都要问一次「谁在问」。**

## 长期记忆也要隔离

第 30 课的长期记忆按用户存储，命名空间里必须带 `user_id`：

```python
def memory_ns(user_id: str) -> tuple[str, ...]:
    return ("users", user_id, "memories")
```

这不只是为了隔离，也是为了**删除**——用户要求删除数据时，删掉一个前缀就够了。混在一起存，你永远说不清删干净了没有。

## 互动实验：用两个账号试一次

网页实验给你两个账号和四个入口：

```text
读历史      →  你会检查
发消息      →  你会检查
批准中断    →  容易忘
回到旧快照  →  容易忘
```

通过条件：四个入口都挡住越权，并说出漏掉后两个会造成什么后果（提示：批准别人的删除操作）。

## 自己运行真实代码

完整代码位于 [`lab/langgraph/examples/29_identity.py`](../../lab/langgraph/examples/29_identity.py)，**不需要 API Key**：

```powershell
uv run python examples/29_identity.py
```

它用真实的 SQLite checkpointer 存两个用户的对话，然后分别用两种读法访问。

## 本课挑战：这段检查为什么形同虚设

```python
def handle(request):
    user_id = request.json.get("user_id")
    thread_id = request.json.get("thread_id")
    if OWNERSHIP.get(thread_id) != user_id:
        return error(403)
    return read_thread(thread_id)
```

问题：`user_id` 来自请求体。

任何人都能把 `user_id` 填成 `"alice"`，检查就通过了。这段代码看起来在做权限判断，实际上只是在核对两个都由客户端提供的值。

当前用户必须从服务端验证过的会话里取，不能从请求参数里取。

## 三个常见误区

### 「thread_id 是 UUID，猜不到」

猜不到不等于拿不到。它会出现在 URL、浏览器历史、日志、分享链接、客服截图里。**不可预测不是访问控制。**

### 「前端已经只显示自己的会话了」

前端只是界面。接口是公开的，绕过界面直接请求接口，一行命令的事。

### 「小项目还没有账号，先不做隔离」

那就不要把接口公开暴露。没有隔离的多用户系统，第一个发现的人就能读所有人的数据。

## 本课带走三句话

- 当前用户从服务端会话取，永远不从请求参数取
- 无权和不存在返回同一句话，否则等于确认了数据存在
- 所有出现 `thread_id` 的地方都要问「谁在问」，包括恢复和时间旅行

## 下一课

最后一课：让它跨会话记住这个人，然后交付你的毕业项目。

[进入第 30 课：数据库、长期记忆与毕业项目](30-long-term-memory.md)
