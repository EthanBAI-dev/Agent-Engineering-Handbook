"""L01 · 最小图：State + Node + Edge + 条件边。

不需要任何 API Key，纯本地运行：
    python l01_simple_graph.py
"""

from typing import Literal

from langgraph.graph import END, START, StateGraph
from typing_extensions import TypedDict


# 1) State：整张图共享的「白板」，节点读它、写它
class State(TypedDict):
    text: str


# 2) Node：一个普通函数，入参是 state，返回值是「要更新的字段」
def node_hello(state: State) -> dict:
    print("--- node_hello ---")
    return {"text": state["text"] + " 你好"}


def node_happy(state: State) -> dict:
    print("--- node_happy ---")
    return {"text": state["text"] + "，今天很开心！"}


def node_sad(state: State) -> dict:
    print("--- node_sad ---")
    return {"text": state["text"] + "，今天有点累。"}


# 3) 路由函数：返回值是「下一个节点的名字」，不是状态
def route(state: State) -> Literal["node_happy", "node_sad"]:
    return "node_happy" if "开心" in state["text"] else "node_sad"


# 4) 组装：先加节点，再连边，最后 compile
builder = StateGraph(State)
builder.add_node("node_hello", node_hello)
builder.add_node("node_happy", node_happy)
builder.add_node("node_sad", node_sad)

builder.add_edge(START, "node_hello")
builder.add_conditional_edges("node_hello", route)
builder.add_edge("node_happy", END)
builder.add_edge("node_sad", END)

graph = builder.compile()


if __name__ == "__main__":
    print(graph.get_graph().draw_mermaid())
    print(graph.invoke({"text": "我想开心一点"}))
    print(graph.invoke({"text": "随便说点什么"}))
