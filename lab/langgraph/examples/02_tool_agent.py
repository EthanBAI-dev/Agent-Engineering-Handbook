"""第 2 课：手写一个 ReAct Agent —— Agent 的「循环」到底是什么。

Agent 不是魔法，就是第 1 课那张图加了两个节点：
    model  -> 要调工具吗? -> tools -> 回到 model -> ... -> 不调了 -> END

先手写一遍，最后一行给出 prebuilt 的等价写法。
先手写，你才知道 create_react_agent 帮你省了什么。

跑：uv run python examples/02_tool_agent.py
"""

from langchain_core.tools import tool
from langgraph.graph import START, END, StateGraph, MessagesState
from langgraph.prebuilt import ToolNode, tools_condition

from _model import get_model


@tool
def add(a: float, b: float) -> float:
    """把两个数相加。"""
    print(f"  [tool] add({a}, {b})")
    return a + b


@tool
def word_count(text: str) -> int:
    """数一段文本有多少个词。"""
    print(f"  [tool] word_count({text!r})")
    return len(text.split())


TOOLS = [add, word_count]

# MessagesState 是内置的 state：只有一个 messages 字段，
# 它的 reducer 是 add_messages —— 追加消息而不是覆盖。就是第 1 课的 operator.add 的升级版。
model = get_model().bind_tools(TOOLS)


def call_model(state: MessagesState) -> dict:
    """节点一：问模型。模型可能直接回答，也可能返回 tool_calls。"""
    return {"messages": [model.invoke(state["messages"])]}


graph = StateGraph(MessagesState)
graph.add_node("model", call_model)
graph.add_node("tools", ToolNode(TOOLS))  # 节点二：真正执行工具

graph.add_edge(START, "model")
# tools_condition 就是个现成的条件函数：
# 最后一条消息里有 tool_calls -> 去 "tools"，没有 -> END
graph.add_conditional_edges("model", tools_condition)
graph.add_edge("tools", "model")  # 关键的一条边：工具跑完回到模型，循环就闭合了

app = graph.compile()


if __name__ == "__main__":
    q = "先算 128 加 349，然后数一下 'the quick brown fox jumps' 有几个词"
    for chunk in app.stream({"messages": [("user", q)]}, stream_mode="values"):
        chunk["messages"][-1].pretty_print()

    # 等价的一行版本（生产里用这个，但你现在知道它内部长什么样了）：
    # from langgraph.prebuilt import create_react_agent
    # app = create_react_agent(get_model(), TOOLS)
