"""第 29 课：账号与数据隔离 —— thread_id 不是身份验证。

这句话从第 03 课起说了五次，这一课把它兑现。

第 15 课把会话搬进了数据库。数据库里现在躺着所有用户的对话，
而取用它们只需要一个 thread_id。这一课补上那道缺失的检查。

跑：uv run python examples/29_identity.py（不需要 API Key）
"""

import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
sys.stdout.reconfigure(encoding="utf-8")

from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph import END, START, MessagesState, StateGraph

from _fake import ScriptedModel, ai

# 服务端的归属表：哪个 thread 属于哪个用户。它不来自请求。
OWNERSHIP: dict[str, str] = {}


def build(saver):
    def call_model(state: MessagesState) -> dict:
        model = ScriptedModel(script=[ai("好的，记住了。")])
        return {"messages": [model.invoke(state["messages"])]}

    graph = StateGraph(MessagesState)
    graph.add_node("model", call_model)
    graph.add_edge(START, "model")
    graph.add_edge("model", END)
    return graph.compile(checkpointer=saver)


def unsafe_read(app, thread_id: str):
    """反面示范：只要给出 thread_id 就返回内容。"""
    snapshot = app.get_state({"configurable": {"thread_id": thread_id}})
    return snapshot.values.get("messages", []) if snapshot.values else []


def safe_read(app, thread_id: str, current_user: str):
    """正确做法：先问「这个 thread 属于谁」，再决定给不给。"""
    owner = OWNERSHIP.get(thread_id)
    if owner is None:
        raise PermissionError("找不到这个会话")          # 注意措辞，见下文
    if owner != current_user:
        raise PermissionError("找不到这个会话")
    snapshot = app.get_state({"configurable": {"thread_id": thread_id}})
    return snapshot.values.get("messages", []) if snapshot.values else []


with tempfile.TemporaryDirectory() as tmp:
    with SqliteSaver.from_conn_string(str(Path(tmp) / "db.sqlite")) as saver:
        app = build(saver)

        # 两个用户各说一句话
        for user, thread, text in [
            ("alice", "t_alice", "我的身份证号是 1234"),
            ("bob", "t_bob", "我的银行卡尾号是 5678"),
        ]:
            OWNERSHIP[thread] = user
            app.invoke({"messages": [("user", text)]}, {"configurable": {"thread_id": thread}})

        print("=== 1. 没有归属检查：bob 猜到 thread_id 就能读 alice 的对话 ===")
        stolen = unsafe_read(app, "t_alice")
        print(f"  bob 请求 t_alice → 拿到 {len(stolen)} 条消息")
        print(f"  第一条：{stolen[0].content}")
        print("  ↑ 这不是「攻击」，只是换了个参数。thread_id 常常出现在 URL 里。\n")

        print("=== 2. 加上归属检查 ===")
        for who, thread in [("alice", "t_alice"), ("bob", "t_alice"), ("bob", "t_bob"), ("bob", "t_nonexistent")]:
            try:
                messages = safe_read(app, thread, who)
                print(f"  {who:6} 请求 {thread:16} → 允许，{len(messages)} 条消息")
            except PermissionError as error:
                print(f"  {who:6} 请求 {thread:16} → 拒绝：{error}")
        print()

        print("=== 3. 为什么「无权访问」和「不存在」要用同一句话 ===")
        print("  如果分开回答：")
        print("    t_alice     → 「无权访问」  ← 等于确认了这个 thread 存在")
        print("    t_xxxxxx    → 「不存在」")
        print("  攻击者可以靠这个差别枚举出哪些 thread_id 是真的。")
        print("  两种情况都回同一句「找不到这个会话」，就不泄漏这个信息。\n")

        print("=== 4. 当前用户从哪里来 ===")
        print("  ✗ 请求体里的 user_id      —— 客户端可以随便填")
        print("  ✗ URL 参数里的 user_id    —— 同上")
        print("  ✓ 服务端验证过的会话/令牌 —— 客户端改不了")
        print("  第 12 课那个静默丢弃在这里会要命：以为传了 user_id，其实字段名不在 schema 里，")
        print("  权限判断拿到 None，如果代码写成「owner != user 才拒绝」，None 就一路放行了。\n")

        print("=== 5. 归属表不能放进 State ===")
        print("  OWNERSHIP 是服务端的数据，不是图的 State。")
        print("  放进 State 的东西，第 17 课的 update_state 就能改——审批界面上一个字段，")
        print("  就成了越权的入口。谁拥有什么，只能由服务端单独保管。")

print("\n=== 上线检查清单 ===")
print("  1. 每个 thread 创建时记录归属，归属来自服务端会话而不是请求参数")
print("  2. 每次读写 thread 前检查归属，包括恢复、审批、时间旅行这些次要入口")
print("  3. 无权和不存在返回同一句话")
print("  4. 归属信息不进 State，不随接口返回")
print("  5. 用两个账号真的试一次——这是唯一能证明它有效的方法")
