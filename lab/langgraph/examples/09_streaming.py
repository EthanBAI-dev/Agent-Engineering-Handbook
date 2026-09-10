"""第 9 课：Streaming —— 让用户看见 Agent 正在做什么。

Agent 跑十几秒很正常。如果这十几秒里页面上什么都没有，用户会以为它死了。
LangGraph 的 stream 提供几种不同粒度的事件，选错粒度，页面要么什么都不显示，
要么把内部状态一股脑倒给用户。

这一课不接真实模型：用脚本化模型逐字吐字，事件顺序和真实运行完全一致。

跑：uv run python examples/09_streaming.py（不需要 API Key）
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
sys.stdout.reconfigure(encoding="utf-8")

from langchain_core.tools import tool
from langgraph.graph import START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition

from _fake import ScriptedModel, ai, ai_tool_call


@tool
def get_weather(city: str) -> str:
    """查询一个城市的天气。"""
    return f"{city}：晴，24 度"


TOOLS = [get_weather]
QUESTION = "北京天气怎么样？"


def build_app():
    """每次都新建：脚本化模型的剧本是一次性的。"""
    model = ScriptedModel(
        script=[ai_tool_call("get_weather", {"city": "北京"}), ai("北京今天晴，24 度。")]
    ).bind_tools(TOOLS)

    def call_model(state: MessagesState) -> dict:
        return {"messages": [model.invoke(state["messages"])]}

    graph = StateGraph(MessagesState)
    graph.add_node("model", call_model)
    graph.add_node("tools", ToolNode(TOOLS))
    graph.add_edge(START, "model")
    graph.add_conditional_edges("model", tools_condition)
    graph.add_edge("tools", "model")
    return graph.compile()


payload = {"messages": [("user", QUESTION)]}

print('=== stream_mode="updates"：每个节点跑完，报告它改了什么 ===')
count = 0
for chunk in build_app().stream(payload, stream_mode="updates"):
    for node, update in chunk.items():
        last = update["messages"][-1]
        detail = last.tool_calls[0]["name"] if getattr(last, "tool_calls", None) else repr(last.content)
        print(f"  [{node}] {type(last).__name__} → {detail}")
        count += 1
print(f"  共 {count} 个事件")

print('\n=== stream_mode="values"：每一步之后，给出完整 State ===')
for index, state in enumerate(build_app().stream(payload, stream_mode="values")):
    print(f"  第 {index} 次：messages 共 {len(state['messages'])} 条")

print('\n=== stream_mode="messages"：逐字吐出，但有个坑 ===')
naive = ""
chunks = 0
for token, meta in build_app().stream(payload, stream_mode="messages"):
    if token.content:
        naive += token.content
        chunks += 1
print(f"  照单全收：{chunks} 个文本块 → {naive}")
print("  ↑ 工具返回的「北京：晴，24 度」也混进来了。它是 ToolMessage，不是给用户看的正文。")

filtered = ""
for token, meta in build_app().stream(payload, stream_mode="messages"):
    # meta 里带着这个块来自哪个节点。只要 model 的输出。
    if token.content and meta.get("langgraph_node") == "model":
        filtered += token.content
print(f"  按节点过滤后：{filtered}")

print('\n=== 组合：节点事件给状态提示，token 事件给正文 ===')
for mode, event in build_app().stream(payload, stream_mode=["updates", "messages"]):
    if mode == "updates":
        node = next(iter(event))
        print(f"  ▸ 进度：{node} 执行完毕")
    elif event[0].content:
        print(f"    · 正文块 {event[0].content!r}")

print("\n=== 该给用户看哪一种 ===")
print("  updates  → 「正在查天气…」这类进度提示，一个节点一条")
print("  values   → 调试面板；直接给用户会把整份 State 抖出去")
print("  messages → 打字机效果，只有正文，不含工具调用细节")
