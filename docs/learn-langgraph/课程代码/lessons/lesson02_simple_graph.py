"""第 02 讲 · 一张最小的图：状态、节点、条件边。

不需要任何钥匙，纯本地运行：

    python 课程代码/lessons/lesson02_simple_graph.py
"""

from typing import Literal

from langgraph.graph import END, START, StateGraph
from typing_extensions import TypedDict


# [正文] 状态：一份所有步骤都能看、都能改的共享数据
class State(TypedDict):
    text: str


# [正文] 节点：普通函数，读状态，返回「要改的部分」
def node_hello(state: State) -> dict:
    print("--- 走到 node_hello ---")
    return {"text": state["text"] + " 你好"}


def node_happy(state: State) -> dict:
    print("--- 走到 node_happy ---")
    return {"text": state["text"] + "，今天很开心！"}


def node_sad(state: State) -> dict:
    print("--- 走到 node_sad ---")
    return {"text": state["text"] + "，今天有点累。"}


# [正文] 岔路函数：只回答「下一步去哪」，不改数据
def route(state: State) -> Literal["node_happy", "node_sad"]:
    return "node_happy" if "开心" in state["text"] else "node_sad"


# [正文] 组装：声明状态 → 加节点 → 连边 → 编译
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
    # [正文] 同一张图，两种输入，走两条路
    print("== 第一次：输入里带「开心」==")
    print(graph.invoke({"text": "我想开心一点"}))

    print("\n== 第二次：输入里不带「开心」==")
    print(graph.invoke({"text": "随便说点什么"}))

    # [正文] 默认是「覆盖」：不读旧值直接返回新值，旧值就没了
    print("\n== 默认是覆盖：不读旧值，旧值就没了 ==")

    def node_append(state: State) -> dict:
        return {"text": state["text"] + " 我读了旧值再接上"}

    def node_overwrite(state: State) -> dict:
        return {"text": "我没读旧值"}

    b2 = StateGraph(State)
    b2.add_node("node_append", node_append)
    b2.add_node("node_overwrite", node_overwrite)
    b2.add_edge(START, "node_append")
    b2.add_edge("node_append", "node_overwrite")
    b2.add_edge("node_overwrite", END)
    print(b2.compile().invoke({"text": "原始内容"}))

    # [脚本额外] 把这张图的真实结构导出来，配图以它为准
    print("\n== 这张图的真实结构 ==")
    print(graph.get_graph().draw_mermaid())
