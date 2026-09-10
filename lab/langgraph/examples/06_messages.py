"""第 6 课：模型、Prompt 与 Messages —— 哪些事是模型决定的，哪些是你的代码决定的。

前五课把图讲完了。接下来要接真实模型，但在花钱之前，先把一件事分清楚：
一次运行里有很多决定，其中只有一小部分归模型。剩下的全是你写的代码定死的。

分不清这条边界，调试时就会一直问错问题：
模型答得不对，你去改图；图接错了，你去改提示词。

跑：uv run python examples/06_messages.py（不需要 API Key）
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
sys.stdout.reconfigure(encoding="utf-8")

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langgraph.graph import END, START, MessagesState, StateGraph

from _fake import ScriptedModel, ai


def build_app(model):
    """同一张图，换不同的模型。图的结构一个字都不改。"""

    def call_model(state: MessagesState) -> dict:
        return {"messages": [model.invoke(state["messages"])]}

    graph = StateGraph(MessagesState)
    graph.add_node("model", call_model)
    graph.add_edge(START, "model")
    graph.add_edge("model", END)
    return graph.compile()


SYSTEM = SystemMessage(content="你是一个只用一句话回答的助手。")
QUESTION = HumanMessage(content="LangGraph 是什么？")

print("=== 1. 消息是有类型的，不是一串纯文本 ===")
for message in [SYSTEM, QUESTION, AIMessage(content="它是一个编排框架。")]:
    print(f"  {type(message).__name__:14} role={message.type:9} {message.content}")

print("\n=== 2. 同一张图 + 同一组消息，模型换了，回答就换了 ===")
for label, reply in [("模型 A", "它是编排多步骤流程的框架。"), ("模型 B", "一个把 Agent 画成图来跑的库。")]:
    app = build_app(ScriptedModel(script=[ai(reply)]))
    out = app.invoke({"messages": [SYSTEM, QUESTION]})
    print(f"  {label}: {out['messages'][-1].content}")
    print(f"         消息条数 {len(out['messages'])}，最后一条类型 {type(out['messages'][-1]).__name__}")

print("\n=== 3. 模型看到的输入，永远是你交给它的那个列表 ===")
for label, inbox in [("只传问题", [QUESTION]), ("加上系统提示", [SYSTEM, QUESTION])]:
    # 每次都新建一个模型：剧本是一次性的，用完再调用会直接报错。
    app = build_app(ScriptedModel(script=[ai("收到。")]))
    out = app.invoke({"messages": inbox})
    print(f"  {label}：模型看到 {len(out['messages']) - 1} 条输入")

print("\n=== 4. 谁决定什么 ===")
rows = [
    ("这次要不要调用工具", "模型", "它在回答里放不放 tool_call"),
    ("有哪些工具可以调用", "你的代码", "bind_tools 交出去的那份清单"),
    ("工具执行的结果是什么", "你的代码", "ToolNode 跑的是真的 Python 函数"),
    ("回答用什么措辞", "模型", "同一张图换个模型就变了"),
    ("跑完 model 之后去哪", "你的代码", "条件边读消息结构，不读语义"),
    ("最多允许跑几轮", "你的代码", "模型不会自己停，见第 10 课"),
]
print(f"  {'决定':<20}{'归谁':<10}凭什么")
for what, who, why in rows:
    print(f"  {what:<20}{who:<10}{why}")
