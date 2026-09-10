"""第 21 课：Parallelization —— 互不依赖的步骤，没有理由排队。

一个 Agent 要同时查三个来源，串行做就是三份等待时间叠加。
它们互不依赖，本来可以一起跑。

改成并行不难，难的是想清楚：结果怎么合并，一个分支失败了怎么办。

跑：uv run python examples/21_parallel.py（不需要 API Key）
"""

import operator
import sys
import time
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).parent))
sys.stdout.reconfigure(encoding="utf-8")

from langgraph.graph import END, START, StateGraph
from typing_extensions import TypedDict

DELAY = 0.3  # 模拟每个外部调用的耗时


class State(TypedDict):
    query: str
    findings: Annotated[list[str], operator.add]
    summary: str


def make_source(name: str):
    def source(state: State) -> dict:
        time.sleep(DELAY)
        return {"findings": [f"{name} 找到了关于「{state['query']}」的资料"]}

    return source


def summarize(state: State) -> dict:
    return {"summary": f"综合 {len(state['findings'])} 个来源得出结论"}


SOURCES = ["网页搜索", "内部文档", "数据库"]


def build(parallel: bool):
    graph = StateGraph(State)
    for name in SOURCES:
        graph.add_node(name, make_source(name))
    graph.add_node("summarize", summarize)

    if parallel:
        # 扇出：START 同时指向三个来源；扇入：三个都指向 summarize。
        for name in SOURCES:
            graph.add_edge(START, name)
            graph.add_edge(name, "summarize")
    else:
        graph.add_edge(START, SOURCES[0])
        for previous, nxt in zip(SOURCES, SOURCES[1:]):
            graph.add_edge(previous, nxt)
        graph.add_edge(SOURCES[-1], "summarize")

    graph.add_edge("summarize", END)
    return graph.compile()


for label, parallel in [("串行", False), ("并行", True)]:
    started = time.perf_counter()
    out = build(parallel).invoke({"query": "LangGraph", "findings": [], "summary": ""})
    elapsed = time.perf_counter() - started
    print(f"=== {label} ===")
    print(f"  耗时 {elapsed:.2f} 秒（三个来源各 {DELAY} 秒）")
    print(f"  收集到 {len(out['findings'])} 条：")
    for finding in out["findings"]:
        print(f"    {finding}")
    print(f"  {out['summary']}\n")

print("=== 关于顺序：不要依赖它 ===")
print("  并行分支写进 findings 的顺序由运行时决定，不保证和你加节点的顺序一致。")
print("  需要知道每条来自哪里，就把来源写进数据本身——上面每条都带了来源名。\n")

print("=== 一个分支失败会怎样 ===")


def broken(state: State) -> dict:
    raise ConnectionError("内部文档服务挂了")


graph = StateGraph(State)
graph.add_node("网页搜索", make_source("网页搜索"))
graph.add_node("内部文档", broken)
graph.add_node("summarize", summarize)
graph.add_edge(START, "网页搜索")
graph.add_edge(START, "内部文档")
graph.add_edge("网页搜索", "summarize")
graph.add_edge("内部文档", "summarize")
graph.add_edge("summarize", END)
try:
    graph.compile().invoke({"query": "LangGraph", "findings": [], "summary": ""})
except ConnectionError as error:
    print(f"  整次运行失败：{error}")
print("  ↑ 默认情况下，一个分支抛异常，整次运行就失败了。")
print("     要「尽力而为」，就在每个分支内部自己 try，把失败也写成一条结果。\n")


def tolerant(name: str, fail: bool):
    def source(state: State) -> dict:
        try:
            if fail:
                raise ConnectionError("服务没响应")
            return {"findings": [f"{name}：查到了"]}
        except ConnectionError as error:
            return {"findings": [f"{name}：查询失败（{error}）"]}

    return source


graph = StateGraph(State)
graph.add_node("网页搜索", tolerant("网页搜索", fail=False))
graph.add_node("内部文档", tolerant("内部文档", fail=True))
graph.add_node("summarize", summarize)
graph.add_edge(START, "网页搜索")
graph.add_edge(START, "内部文档")
graph.add_edge("网页搜索", "summarize")
graph.add_edge("内部文档", "summarize")
graph.add_edge("summarize", END)
out = graph.compile().invoke({"query": "LangGraph", "findings": [], "summary": ""})
print("=== 分支内部自己兜住失败 ===")
for finding in out["findings"]:
    print(f"    {finding}")
print(f"  {out['summary']}")
print("  ↑ 这次跑完了，但要让后面的节点知道有一条是失败的，别当成正常资料用。")
