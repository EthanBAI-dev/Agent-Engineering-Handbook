"""第 16 课：审批策略 —— 什么动作必须问人，什么动作根本不该给。

第 04 课让图在删除前停下来等人点头。但真实 Agent 有十几个工具，
不可能每个都问——问得太多，人会开始闭眼点「同意」，审批就退化成了走过场。

所以要先分级：能自动跑的自动跑，危险的才问，绝不该做的直接不给。

跑：uv run python examples/16_approval_policy.py（不需要 API Key）
"""

import sys
from pathlib import Path
from typing import Literal

sys.path.insert(0, str(Path(__file__).parent))
sys.stdout.reconfigure(encoding="utf-8")

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, interrupt
from typing_extensions import TypedDict

Risk = Literal["auto", "approve", "forbid"]

# 风险表：这份表是代码，不是提示词。模型改不了它。
POLICY: dict[str, Risk] = {
    "read_file": "auto",      # 只读，可逆，范围可控
    "list_dir": "auto",
    "move_file": "approve",   # 有副作用，但可撤销
    "delete_file": "approve", # 有副作用，难撤销
    "send_email": "approve",  # 一旦发出无法收回
    "drop_table": "forbid",   # 不该由 Agent 做的事
}


class State(TypedDict):
    tool: str
    args: str
    decision: str
    result: str


def classify(state: State) -> dict:
    """未登记的工具按最严格处理，而不是按最宽松。"""
    return {"decision": POLICY.get(state["tool"], "forbid")}


def route(state: State) -> str:
    return state["decision"]


def auto(state: State) -> dict:
    return {"result": f"直接执行 {state['tool']}({state['args']})"}


def approve(state: State) -> dict:
    answer = interrupt({
        "question": f"允许执行 {state['tool']}({state['args']}) 吗？",
        "risk": "有副作用，可能无法撤销",
    })
    if answer != "yes":
        return {"result": f"用户拒绝，未执行 {state['tool']}"}
    return {"result": f"经批准后执行 {state['tool']}({state['args']})"}


def forbid(state: State) -> dict:
    return {"result": f"策略禁止：{state['tool']} 不在允许清单内，不会询问，也不会执行"}


graph = StateGraph(State)
graph.add_node("classify", classify)
graph.add_node("auto", auto)
graph.add_node("approve", approve)
graph.add_node("forbid", forbid)
graph.add_edge(START, "classify")
graph.add_conditional_edges("classify", route, ["auto", "approve", "forbid"])
for name in ("auto", "approve", "forbid"):
    graph.add_edge(name, END)

app = graph.compile(checkpointer=InMemorySaver())


def run(tool: str, args: str, human_says: str | None, thread: str) -> None:
    cfg = {"configurable": {"thread_id": thread}}
    out = app.invoke({"tool": tool, "args": args, "decision": "", "result": ""}, cfg)

    if "__interrupt__" in out:
        question = out["__interrupt__"][0].value["question"]
        print(f"  [{tool:11}] 级别=approve  停下来问：{question}")
        print(f"  {'':13} 人回答 {human_says!r}")
        out = app.invoke(Command(resume=human_says), cfg)
    else:
        print(f"  [{tool:11}] 级别={out['decision']:8}没有打断")
    print(f"  {'':13} → {out['result']}\n")


print("=== 三个级别各跑一次 ===\n")
run("read_file", "notes.md", None, "t1")
run("delete_file", "/tmp/cache", "yes", "t2")
run("delete_file", "/etc/passwd", "no", "t3")
run("drop_table", "users", None, "t4")

print("=== 未登记的工具 ===\n")
run("transfer_money", "1000", None, "t5")

print("=== 三条设计原则 ===")
print("  1. 默认拒绝：不在表里的工具按 forbid 处理，而不是放行")
print("  2. 审批要稀缺：审批项太多，人就会闭眼点同意，等于没有审批")
print("  3. forbid 不询问：真正不该做的事，不要给人「点一下就能做」的机会")
