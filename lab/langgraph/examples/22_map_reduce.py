"""第 22 课：Map-reduce —— 数量不固定的任务怎么扇出。

第 21 课的并行有个前提：分支数量是写死的，三个来源就是三个节点。
但很多任务的数量要到运行时才知道：用户上传了几份文件、搜索返回了几条结果。

Send 让你在运行时决定要派发多少份工作。

跑：uv run python examples/22_map_reduce.py（不需要 API Key）
"""

import operator
import sys
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).parent))
sys.stdout.reconfigure(encoding="utf-8")

from langgraph.graph import END, START, StateGraph
from langgraph.types import Send
from typing_extensions import TypedDict


class Overall(TypedDict):
    documents: list[str]
    reviews: Annotated[list[dict], operator.add]
    report: str


class OneDoc(TypedDict):
    """每个 map 任务自己的输入。它和整体 State 不是同一个结构。"""
    document: str


def fan_out(state: Overall):
    """运行时才知道有几份文件，就在这里生成几个 Send。"""
    return [Send("review_one", {"document": doc}) for doc in state["documents"]]


def review_one(state: OneDoc) -> dict:
    """map：只处理自己那一份，不知道也不需要知道别人在做什么。"""
    doc = state["document"]
    score = len(doc) % 5 + 1
    return {"reviews": [{"doc": doc, "score": score}]}


def reduce_all(state: Overall) -> dict:
    """reduce：所有 map 都完成后才会执行。"""
    reviews = state["reviews"]
    best = max(reviews, key=lambda r: r["score"])
    average = sum(r["score"] for r in reviews) / len(reviews)
    return {"report": f"共 {len(reviews)} 份，平均 {average:.1f} 分，最高是 {best['doc']}（{best['score']} 分）"}


graph = StateGraph(Overall)
graph.add_node("review_one", review_one)
graph.add_node("reduce_all", reduce_all)
graph.add_conditional_edges(START, fan_out, ["review_one"])
graph.add_edge("review_one", "reduce_all")
graph.add_edge("reduce_all", END)
app = graph.compile()

print("=== 1. 三份文件 ===")
out = app.invoke({"documents": ["合同A", "报告BB", "纪要CCC"], "reviews": [], "report": ""})
for review in out["reviews"]:
    print(f"  {review}")
print(f"  {out['report']}\n")

print("=== 2. 同一张图，七份文件，代码一个字没改 ===")
docs = [f"文件{i}" * (i % 3 + 1) for i in range(1, 8)]
out = app.invoke({"documents": docs, "reviews": [], "report": ""})
print(f"  收到 {len(out['reviews'])} 条评审结果")
print(f"  {out['report']}\n")

print("=== 3. 零份文件：reduce 根本不会执行 ===")
out = app.invoke({"documents": [], "reviews": [], "report": ""})
print(f"  报告字段：{out['report']!r}")
print("  ↑ 没有异常，也没有报告。fan_out 返回了空列表，review_one 一次都没跑，")
print("     而 reduce_all 只有一条来自 review_one 的入边，于是它也没跑。")
print("     整条下游被静默跳过——这是 map-reduce 最容易漏掉的边界。\n")

print("=== 4. 修法：空集合单独走一条路 ===")


def route_or_empty(state: Overall):
    if not state["documents"]:
        return "nothing_to_do"
    return [Send("review_one", {"document": doc}) for doc in state["documents"]]


def nothing_to_do(state: Overall) -> dict:
    return {"report": "没有需要评审的文件"}


graph2 = StateGraph(Overall)
graph2.add_node("review_one", review_one)
graph2.add_node("reduce_all", reduce_all)
graph2.add_node("nothing_to_do", nothing_to_do)
graph2.add_conditional_edges(START, route_or_empty, ["review_one", "nothing_to_do"])
graph2.add_edge("review_one", "reduce_all")
graph2.add_edge("reduce_all", END)
graph2.add_edge("nothing_to_do", END)
app2 = graph2.compile()

out = app2.invoke({"documents": [], "reviews": [], "report": ""})
print(f"  零份：{out['report']}")
out = app2.invoke({"documents": ["合同A", "报告BB"], "reviews": [], "report": ""})
print(f"  两份：{out['report']}")

print("\n=== 三件必须想清楚的事 ===")
print("  1. 汇总字段必须有 reducer：多个 map 同时写它，没有 reducer 就是 InvalidUpdateError")
print("  2. 扇出为 0 时下游整条被跳过，必须单独走一条路；扇出很大时要考虑成本和并发上限")
print("  3. map 任务之间不能互相依赖：需要依赖，说明它不是 map，是一条链")
