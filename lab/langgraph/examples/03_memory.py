"""第 3 课：记忆 —— 为什么 Agent 会「忘」，以及一行代码解决。

前两课的图每次 invoke 都从零开始，state 跑完就扔了。
加一个 checkpointer，图在每一步之后把 state 存下来；
用 thread_id 指定「这是哪一段对话」，下次带同一个 id 进来就接着上次的。

thread_id 就是会话 id。换一个 id = 换一个全新的对话。

跑：uv run python examples/03_memory.py
"""

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import START, END, StateGraph, MessagesState

from _model import get_model

model = get_model()


def call_model(state: MessagesState) -> dict:
    return {"messages": [model.invoke(state["messages"])]}


graph = StateGraph(MessagesState)
graph.add_node("model", call_model)
graph.add_edge(START, "model")
graph.add_edge("model", END)

# InMemorySaver 存在内存里，进程一退就没了 —— 学习够用。
# 要落盘换 langgraph-checkpoint-sqlite / -postgres，图本身一个字都不用改。
app = graph.compile(checkpointer=InMemorySaver())


def ask(text: str, thread: str) -> None:
    cfg = {"configurable": {"thread_id": thread}}
    out = app.invoke({"messages": [("user", text)]}, cfg)
    print(f"[{thread}] 我: {text}")
    print(f"[{thread}] AI: {out['messages'][-1].content}\n")


if __name__ == "__main__":
    ask("记住：我在学 LangGraph，我叫小白。", thread="a")
    ask("我叫什么？在学什么？", thread="a")        # 记得 —— 同一个 thread
    ask("我叫什么？", thread="b")                  # 不记得 —— 换了 thread

    # 存了什么可以直接看：
    snap = app.get_state({"configurable": {"thread_id": "a"}})
    print("thread a 存了", len(snap.values["messages"]), "条消息")
