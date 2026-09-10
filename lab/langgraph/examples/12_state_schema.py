"""第 12 课：State Schema —— 写错字段名不会报错，只会静静地什么都不发生。

State 的字段清单就是一份合同：谁能读、谁能写、外面能看到哪些。
这一课要先让你踩两次静默失败，再讲怎样用 schema 把它们变成可发现的错误。

跑：uv run python examples/12_state_schema.py（不需要 API Key）
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
sys.stdout.reconfigure(encoding="utf-8")

from langgraph.graph import END, START, StateGraph
from typing_extensions import TypedDict


class State(TypedDict):
    question: str
    answer: str
    internal_note: str


print("=== 1. schema 之外的输入字段：被悄悄丢掉 ===")


def answer_node(state: State) -> dict:
    return {"answer": f"收到：{state['question']}"}


graph = StateGraph(State)
graph.add_node("answer", answer_node)
graph.add_edge(START, "answer")
graph.add_edge("answer", END)
app = graph.compile()

out = app.invoke({"question": "在吗", "answer": "", "internal_note": "", "user_id": "u_42"})
print(f"  传进去带了 user_id，跑完之后：{out}")
print("  ↑ user_id 不在 schema 里，没有报错，也没有进 State。它就这么消失了。")

print("\n=== 2. 节点写错字段名：同样静默 ===")


def typo_node(state: State) -> dict:
    # 想写 answer，手滑写成 answr
    return {"answr": "这句话永远不会出现"}


graph2 = StateGraph(State)
graph2.add_node("typo", typo_node)
graph2.add_edge(START, "typo")
graph2.add_edge("typo", END)
out2 = graph2.compile().invoke({"question": "在吗", "answer": "", "internal_note": ""})
print(f"  节点返回了 answr，跑完之后 answer = {out2['answer']!r}")
print("  ↑ 没有异常，没有警告。调试时你会一直去看模型，其实是拼写错了。")

print("\n=== 3. 用 input_schema / output_schema 把边界写清楚 ===")


class Input(TypedDict):
    question: str


class Output(TypedDict):
    answer: str


def full_node(state: State) -> dict:
    return {
        "answer": f"收到：{state['question']}",
        "internal_note": "这条是内部备注，不该给调用方",
    }


graph3 = StateGraph(State, input_schema=Input, output_schema=Output)
graph3.add_node("answer", full_node)
graph3.add_edge(START, "answer")
graph3.add_edge("answer", END)
app3 = graph3.compile()

out3 = app3.invoke({"question": "在吗"})
print(f"  输入只需要 question，不用再补空字符串：invoke({{'question': '在吗'}})")
print(f"  输出只有 output_schema 里的字段：{out3}")
print("  ↑ internal_note 确实被写进了 State，但没有出现在返回值里。")
print("     这正是第 08 课要的：接口只返回你主动挑选的字段。")

print("\n=== 三条实践 ===")
print("  1. 字段名靠 schema 约束，不靠记忆；改名时全项目一起改")
print("  2. 结果「没变化」先怀疑拼写，再怀疑模型")
print("  3. 对外暴露的图，用 output_schema 把内部字段挡住")
