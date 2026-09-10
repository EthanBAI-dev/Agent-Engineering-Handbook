"""第 11 课：Router 与结构化输出 —— 别把模型吐的字符串直接当分支键。

分类是 Agent 里最常见的一步：这条请求该走退款、查物流，还是转人工？
最容易写错的做法是让模型回一句自然语言，再用 if "退款" in text 去判断。

正确做法有两层：让模型输出结构化结果，再用你自己的白名单校验它。
两层都要，因为第一层只是「更可能对」，不是「保证对」。

跑：uv run python examples/11_router.py（不需要 API Key）
"""

import sys
from pathlib import Path
from typing import Literal

sys.path.insert(0, str(Path(__file__).parent))
sys.stdout.reconfigure(encoding="utf-8")

from langchain_core.tools import tool
from langgraph.graph import END, START, MessagesState, StateGraph
from typing_extensions import TypedDict

from _fake import ScriptedModel, ai, ai_tool_call

ROUTES = ("refund", "shipping", "human")
FALLBACK = "human"


class RouteState(TypedDict):
    question: str
    raw_route: str
    route: str
    answer: str


@tool
def classify(route: Literal["refund", "shipping", "human"], reason: str) -> str:
    """把用户请求分到一个已知类别。"""
    return route


def build_app(script):
    model = ScriptedModel(script=script).bind_tools([classify])

    def route_node(state: RouteState) -> dict:
        """模型给出结构化分类；这里只记录，不信任。"""
        message = model.invoke([("user", state["question"])])
        raw = message.tool_calls[0]["args"]["route"] if message.tool_calls else str(message.content)
        # 白名单校验：模型给的值不在允许集合里，一律落到兜底分支。
        route = raw if raw in ROUTES else FALLBACK
        return {"raw_route": raw, "route": route}

    def refund(state: RouteState) -> dict:
        return {"answer": "已为你创建退款单。"}

    def shipping(state: RouteState) -> dict:
        return {"answer": "你的包裹在配送中。"}

    def human(state: RouteState) -> dict:
        return {"answer": "已转接人工客服。"}

    graph = StateGraph(RouteState)
    graph.add_node("route", route_node)
    for name, fn in [("refund", refund), ("shipping", shipping), ("human", human)]:
        graph.add_node(name, fn)
    graph.add_edge(START, "route")
    graph.add_conditional_edges("route", lambda s: s["route"], list(ROUTES))
    for name in ROUTES:
        graph.add_edge(name, END)
    return graph.compile()


print("=== 1. 三类请求分别进入正确分支 ===")
cases = [
    ("这个我想退掉", "refund"),
    ("我的包裹到哪了", "shipping"),
    ("我要投诉", "human"),
]
for question, decided in cases:
    app = build_app([ai_tool_call("classify", {"route": decided, "reason": "演示"})])
    out = app.invoke({"question": question, "raw_route": "", "route": "", "answer": ""})
    print(f"  {question:12} → route={out['route']:9} {out['answer']}")

print("\n=== 2. 模型给了一个不存在的类别 ===")
app = build_app([ai_tool_call("classify", {"route": "REFUND_NOW", "reason": "模型自己编的"})])
out = app.invoke({"question": "这个我想退掉", "raw_route": "", "route": "", "answer": ""})
print(f"  模型原始输出 raw_route = {out['raw_route']!r}")
print(f"  白名单校验后 route     = {out['route']!r}")
print(f"  最终回答               = {out['answer']}")
print("  ↑ 没有校验的话，这里会直接崩在条件边上：找不到名叫 REFUND_NOW 的节点。")

print("\n=== 3. 模型完全没走结构化输出 ===")
app = build_app([ai("我觉得应该给他退款吧")])
out = app.invoke({"question": "这个我想退掉", "raw_route": "", "route": "", "answer": ""})
print(f"  模型原始输出 raw_route = {out['raw_route']!r}")
print(f"  白名单校验后 route     = {out['route']!r}")
print(f"  最终回答               = {out['answer']}")

print("\n=== 两层防线 ===")
print("  第一层 结构化输出：让模型从固定枚举里选，而不是自由发挥")
print("  第二层 白名单校验：结果不在允许集合里，落到兜底分支，绝不直接当节点名用")
print(f"  兜底分支：{FALLBACK}（宁可转人工，也不要让流程崩掉或走错）")
