"""第 1 课：图就是状态机 —— 不用 LLM，也能理解 LangGraph 的全部核心。

LangGraph 的三件事：
  1. State   一个所有节点共享、逐步累加的字典
  2. Node    一个函数：读 state，返回「要更新哪些字段」
  3. Edge    决定下一个跑谁；条件边让图产生分支和循环

跑：uv run python examples/01_hello_graph.py
"""

from typing import Annotated, TypedDict
import operator
import sys

# Windows 日文/中文系统控制台默认 cp932/gbk，不加这行中文会 UnicodeEncodeError
sys.stdout.reconfigure(encoding="utf-8")

from langgraph.graph import START, END, StateGraph


class State(TypedDict):
    # 普通字段：后写的覆盖先写的
    topic: str
    count: int
    # Annotated + reducer：不覆盖，而是累加。这是 LangGraph 最关键的设计
    log: Annotated[list[str], operator.add]


def plan(state: State) -> dict:
    return {"log": [f"planning: {state['topic']}"], "count": state["count"] + 1}


def work(state: State) -> dict:
    return {"log": [f"work pass #{state['count']}"], "count": state["count"] + 1}


def review(state: State) -> dict:
    return {"log": ["review"]}


def should_continue(state: State) -> str:
    """条件边：返回值是下一个节点的名字。循环就是这么来的。"""
    return "work" if state["count"] < 4 else "review"


graph = StateGraph(State)
graph.add_node("plan", plan)
graph.add_node("work", work)
graph.add_node("review", review)

graph.add_edge(START, "plan")
graph.add_edge("plan", "work")
graph.add_conditional_edges("work", should_continue, ["work", "review"])
graph.add_edge("review", END)

app = graph.compile()

if __name__ == "__main__":
    # stream 看每一步；invoke 只看最终结果
    for step in app.stream({"topic": "学 LangGraph", "count": 0, "log": []}):
        print(step)

    final = app.invoke({"topic": "学 LangGraph", "count": 0, "log": []})
    print("\n最终 state:")
    for k, v in final.items():
        print(f"  {k} = {v}")
