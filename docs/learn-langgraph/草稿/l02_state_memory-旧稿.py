"""L02 · Reducer + Checkpointer + 中断恢复（human-in-the-loop）。

同样不需要 API Key：
    python l02_state_memory.py
"""

import operator
from typing import Annotated

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, interrupt
from typing_extensions import TypedDict


# Annotated[..., reducer]：节点返回值不再「覆盖」而是「合并」
# 没有 reducer 的字段 = 覆盖；有 reducer 的字段 = 按 reducer 累积
class State(TypedDict):
    logs: Annotated[list[str], operator.add]
    approved: bool


def draft(state: State) -> dict:
    return {"logs": ["draft: 写了一版草稿"]}


def review(state: State) -> dict:
    # interrupt 会「暂停整张图」，把 payload 抛给外部；
    # 外部用 Command(resume=...) 把人的答复送回来，函数从这里继续执行
    decision = interrupt({"question": "这版草稿通过吗？(yes/no)"})
    return {"logs": [f"review: 人类回答 {decision}"], "approved": decision == "yes"}


def publish(state: State) -> dict:
    return {"logs": ["publish: 已发布"]}


def rewrite(state: State) -> dict:
    return {"logs": ["rewrite: 打回重写"]}


builder = StateGraph(State)
builder.add_node("draft", draft)
builder.add_node("review", review)
builder.add_node("publish", publish)
builder.add_node("rewrite", rewrite)

builder.add_edge(START, "draft")
builder.add_edge("draft", "review")
builder.add_conditional_edges(
    "review",
    lambda s: "publish" if s["approved"] else "rewrite",
)
builder.add_edge("publish", END)
builder.add_edge("rewrite", END)

# checkpointer = 每一步都存档。没有它就没有记忆，也没有中断恢复、时间旅行
graph = builder.compile(checkpointer=InMemorySaver())


if __name__ == "__main__":
    # thread_id 是「一条对话/一个会话」的身份证，换 id 就是换记忆
    config = {"configurable": {"thread_id": "demo-1"}}

    out = graph.invoke({"logs": [], "approved": False}, config)
    print("第一次 invoke（停在 interrupt 上）:")
    print("  __interrupt__ =", out["__interrupt__"][0].value)
    print("  当前 logs =", out["logs"])

    out = graph.invoke(Command(resume="yes"), config)
    print("\n恢复后:")
    for line in out["logs"]:
        print("  ", line)

    print("\n历史存档（时间旅行用）:")
    for snap in graph.get_state_history(config):
        print("  next =", snap.next, "| logs =", len(snap.values.get("logs", [])))
