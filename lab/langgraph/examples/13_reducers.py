"""第 13 课：Reducer —— 两个分支同时改一个字段，谁说了算？

顺序执行时，字段更新很简单：后来的覆盖先前的。
一旦有两个节点并行跑完、同时要改同一个字段，「覆盖」就没有意义了——谁是后来的？

LangGraph 的选择是：不猜。没有告诉它怎么合并，它直接报错。

跑：uv run python examples/13_reducers.py（不需要 API Key）
"""

import operator
import sys
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).parent))
sys.stdout.reconfigure(encoding="utf-8")

from langgraph.errors import InvalidUpdateError
from langgraph.graph import END, START, StateGraph
from typing_extensions import TypedDict


def fan_out(state_type, nodes):
    """START 同时分出两条分支，各自跑完再汇合到 END。"""
    graph = StateGraph(state_type)
    for name, fn in nodes:
        graph.add_node(name, fn)
        graph.add_edge(START, name)
        graph.add_edge(name, END)
    return graph.compile()


print("=== 1. 并行写同一个普通字段：直接报错 ===")


class Plain(TypedDict):
    result: str


try:
    app = fan_out(Plain, [
        ("search", lambda s: {"result": "搜索结果"}),
        ("db", lambda s: {"result": "数据库结果"}),
    ])
    app.invoke({"result": ""})
except InvalidUpdateError as error:
    print(f"  InvalidUpdateError: {str(error).splitlines()[0]}")
print("  ↑ 它没有随便挑一个，也没有静默丢掉一个。这是好事：错误比错误答案便宜。")

print("\n=== 2. 加上 reducer：两条结果都保留 ===")


class Merged(TypedDict):
    result: Annotated[list[str], operator.add]


app = fan_out(Merged, [
    ("search", lambda s: {"result": ["搜索结果"]}),
    ("db", lambda s: {"result": ["数据库结果"]}),
])
out = app.invoke({"result": []})
print(f"  合并后：{out['result']}")

print("\n=== 3. 自定义 reducer：按你的规则合并，而不只是拼接 ===")


def keep_highest(old: dict, new: dict) -> dict:
    """两个分支各给一个打分，保留分数更高的那个来源。"""
    if not old:
        return new
    return new if new["score"] > old["score"] else old


class Scored(TypedDict):
    best: Annotated[dict, keep_highest]


app = fan_out(Scored, [
    ("cheap_model", lambda s: {"best": {"source": "小模型", "score": 0.62}}),
    ("strong_model", lambda s: {"best": {"source": "大模型", "score": 0.91}}),
])
out = app.invoke({"best": {}})
print(f"  两个分支都写了 best，reducer 只留下：{out['best']}")

print("\n=== 4. 顺序执行时 reducer 同样在起作用 ===")


class Counter(TypedDict):
    plain: int
    summed: Annotated[int, operator.add]


graph = StateGraph(Counter)
graph.add_node("a", lambda s: {"plain": 1, "summed": 1})
graph.add_node("b", lambda s: {"plain": 2, "summed": 2})
graph.add_edge(START, "a")
graph.add_edge("a", "b")
graph.add_edge("b", END)
out = graph.compile().invoke({"plain": 0, "summed": 0})
print(f"  两个节点先后各写一次：plain={out['plain']}（覆盖）  summed={out['summed']}（累加）")

print("\n=== 怎样选 ===")
print("  覆盖（不加 reducer）：当前状态、计数、开关——只有最新值有意义")
print("  operator.add：日志、消息、收集到的结果——每一条都要留下")
print("  自定义：需要去重、按分数取优、限制长度时；写清楚「两个都来了怎么办」")
print("  并行分支 + 无 reducer = InvalidUpdateError，这是设计，不是 bug")
