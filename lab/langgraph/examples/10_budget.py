"""第 10 课：调用限额 —— 模型不会自己停，得你来停。

上线第一个 Agent 之后，最先出事的通常不是回答质量，是账单和响应时间：
模型陷在工具循环里出不来，一个请求烧掉几十次调用。

「让提示词告诉它别循环太久」不是控制。控制是代码里一条数得清的硬上限。

跑：uv run python examples/10_budget.py（不需要 API Key）
"""

import sys
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).parent))
sys.stdout.reconfigure(encoding="utf-8")

from langchain_core.messages import AIMessage
from langchain_core.tools import tool
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from typing_extensions import TypedDict

from _fake import ScriptedModel, ai, ai_tool_call

MAX_MODEL_CALLS = 3


@tool
def search(query: str) -> str:
    """搜索一个关键词。"""
    return f"关于「{query}」的资料很多，建议再查一次。"


TOOLS = [search]


class BudgetState(TypedDict):
    messages: Annotated[list, add_messages]
    model_calls: int


def build_app(script, loop: bool):
    model = ScriptedModel(script=script, loop=loop).bind_tools(TOOLS)

    def call_model(state: BudgetState) -> dict:
        return {
            "messages": [model.invoke(state["messages"])],
            "model_calls": state["model_calls"] + 1,
        }

    def stop_note(state: BudgetState) -> dict:
        return {
            "messages": [
                AIMessage(content=f"已达本次请求上限（{MAX_MODEL_CALLS} 次模型调用），先返回目前的进展。")
            ]
        }

    def route(state: BudgetState) -> str:
        """先看预算，再看模型想干什么。顺序反过来就守不住了。"""
        if state["model_calls"] >= MAX_MODEL_CALLS:
            return "stop_note"
        return "tools" if state["messages"][-1].tool_calls else END

    graph = StateGraph(BudgetState)
    graph.add_node("model", call_model)
    graph.add_node("tools", ToolNode(TOOLS))
    graph.add_node("stop_note", stop_note)
    graph.add_edge(START, "model")
    graph.add_conditional_edges("model", route, ["tools", "stop_note", END])
    graph.add_edge("tools", "model")
    graph.add_edge("stop_note", END)
    return graph.compile()


def run(title: str, script, loop: bool):
    app = build_app(script, loop)
    out = app.invoke({"messages": [("user", "帮我查点资料")], "model_calls": 0})
    print(f"\n=== {title} ===")
    print(f"  模型调用 {out['model_calls']} 次，上限 {MAX_MODEL_CALLS} 次")
    print(f"  消息共 {len(out['messages'])} 条")
    print(f"  最后一条：{out['messages'][-1].content}")
    return out


# 情况一：模型两轮就收工，没碰到上限。
run(
    "正常请求：预算之内跑完",
    [ai_tool_call("search", {"query": "LangGraph"}), ai("查到了，资料在官网。")],
    loop=False,
)

# 情况二：模型每一轮都想再查一次，永远不给最终回答。
run(
    "失控请求：模型停不下来，被上限截断",
    [ai_tool_call("search", {"query": "LangGraph"})],
    loop=True,
)

print("\n=== 三条不能省的边界 ===")
print(f"  1. 每个请求的模型调用上限：本例 {MAX_MODEL_CALLS} 次，超了走 stop_note，而不是抛异常")
print("  2. 先查预算再看 tool_calls：顺序反了，最后一次调用还是会漏出去")
print("  3. 截断也要给用户一个说得通的回复，不能静默返回半截结果")
