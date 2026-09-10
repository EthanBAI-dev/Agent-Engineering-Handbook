"""第 15 课：持久化会话 —— 换个进程还记得，才算真的记住。

第 03 课用 InMemorySaver 演示了 thread 隔离，但它有一句话没展开：
进程一退，全部清空。本地开发看不出问题，上线立刻出问题——
无服务器平台的两次请求根本不保证落在同一个进程里。

这个脚本会真的开一个子进程来验证，而不是嘴上说说。

跑：uv run python examples/15_persistence.py（不需要 API Key）
"""

import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
sys.stdout.reconfigure(encoding="utf-8")

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph import END, START, MessagesState, StateGraph

from _fake import ScriptedModel, ai

THREAD = {"configurable": {"thread_id": "a"}}


def build(checkpointer, reply: str):
    model = ScriptedModel(script=[ai(reply)])

    def call_model(state: MessagesState) -> dict:
        return {"messages": [model.invoke(state["messages"])]}

    graph = StateGraph(MessagesState)
    graph.add_node("model", call_model)
    graph.add_edge(START, "model")
    graph.add_edge("model", END)
    return graph.compile(checkpointer=checkpointer)


def child(db_path: str) -> None:
    """作为「另一个进程」运行：只读，不写。"""
    with SqliteSaver.from_conn_string(db_path) as saver:
        app = build(saver, "（子进程不该说话）")
        snapshot = app.get_state(THREAD)
        count = len(snapshot.values.get("messages", [])) if snapshot.values else 0
        print(f"  [子进程] 从数据库读到 thread a 的 {count} 条消息")
        if count:
            print(f"  [子进程] 第一条是：{snapshot.values['messages'][0].content}")


if len(sys.argv) > 1 and sys.argv[1] == "--child":
    child(sys.argv[2])
    raise SystemExit(0)


print("=== 1. InMemorySaver：同一个进程里记得 ===")
saver = InMemorySaver()
build(saver, "好的，记住了。").invoke({"messages": [("user", "我叫小白")]}, THREAD)
app = build(saver, "你叫小白。")
out = app.invoke({"messages": [("user", "我叫什么")]}, THREAD)
print(f"  第二次调用时，恢复出 {len(out['messages']) - 1} 条历史，回答：{out['messages'][-1].content}")

print("\n=== 2. 换一个 InMemorySaver：等价于换了一个进程 ===")
fresh = InMemorySaver()
snapshot = build(fresh, "x").get_state(THREAD)
print(f"  新 saver 里 thread a 的消息数：{len(snapshot.values.get('messages', [])) if snapshot.values else 0}")
print("  ↑ 内存里的东西不会跨进程存在。线上换个实例，用户就失忆了。")

print("\n=== 3. SqliteSaver：写进文件，另一个进程真的读得到 ===")
with tempfile.TemporaryDirectory() as tmp:
    db_path = str(Path(tmp) / "checkpoints.sqlite")
    with SqliteSaver.from_conn_string(db_path) as saver:
        build(saver, "好的，记住了。").invoke({"messages": [("user", "我叫小白")]}, THREAD)
        print(f"  [主进程] 已写入 {Path(db_path).stat().st_size} 字节")

    # 真的另起一个 Python 进程，只给它文件路径。
    result = subprocess.run(
        [sys.executable, __file__, "--child", db_path],
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    print(result.stdout.rstrip())
    if result.returncode != 0:
        print(result.stderr[-500:])

print("\n=== 上线前必须换掉的那一行 ===")
print("  教学版：graph.compile(checkpointer=InMemorySaver())")
print("  上线版：graph.compile(checkpointer=<外部存储的 checkpointer>)")
print("  图本身一个字都不用改——这正是 checkpointer 被设计成可替换的原因。")
print("\n  SQLite 适合单机和小规模；多实例部署要用 Postgres 这类共享数据库。")
print("  另外记住第 03 课那条边界：thread_id 不是身份验证，谁能读哪个 thread 由第 29 课决定。")
