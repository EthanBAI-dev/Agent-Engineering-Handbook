"""第 18 课：Time Travel —— 回到旧状态，再走一遍另一条路。

checkpointer 存下的不是「最后一个状态」，是每一步的状态。
既然每一步都在，就可以回到中间任意一步：原样重放，或者改一个值再跑，得到另一个结果。

这是调试 Agent 最有力的工具：出问题的那一步就摆在那里，不用重现整段对话。

跑：uv run python examples/18_time_travel.py（不需要 API Key）
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
sys.stdout.reconfigure(encoding="utf-8")

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph
from typing_extensions import TypedDict


class State(TypedDict):
    budget: int
    picked: str
    note: str


def pick(state: State) -> dict:
    """预算决定选哪个方案。这一步是后面所有结果的分岔点。"""
    plan = "豪华版" if state["budget"] >= 5000 else "基础版"
    return {"picked": plan}


def confirm(state: State) -> dict:
    return {"note": f"预算 {state['budget']} 元，最终选择 {state['picked']}"}


graph = StateGraph(State)
graph.add_node("pick", pick)
graph.add_node("confirm", confirm)
graph.add_edge(START, "pick")
graph.add_edge("pick", "confirm")
graph.add_edge("confirm", END)

app = graph.compile(checkpointer=InMemorySaver())
cfg = {"configurable": {"thread_id": "t1"}}

print("=== 1. 先正常跑一次 ===")
out = app.invoke({"budget": 3000, "picked": "", "note": ""}, cfg)
print(f"  {out['note']}")

print("\n=== 2. 每一步都存着 ===")
history = list(app.get_state_history(cfg))
print(f"  共 {len(history)} 个快照，从新到旧：")
for snapshot in history:
    nxt = snapshot.next or ("<已结束>",)
    print(f"    下一步={str(nxt):18} values={snapshot.values}")

print("\n=== 3. 重放：回到 confirm 之前，原样再跑 ===")
before_confirm = [h for h in history if h.next == ("confirm",)][0]
print(f"  选中的快照：{before_confirm.values}")
out = app.invoke(None, before_confirm.config)
print(f"  重放结果：{out['note']}")
print("  ↑ 输入没变，结果当然一样。重放用来确认「同样的输入是不是真的给出同样的输出」。")

print("\n=== 4. 分叉：回到 pick 之前，改预算再跑 ===")
before_pick = [h for h in history if h.next == ("pick",)][0]
print(f"  选中的快照：{before_pick.values}")
forked = app.update_state(before_pick.config, {"budget": 8000})
out = app.invoke(None, forked)
print(f"  分叉结果：{out['note']}")
print("  ↑ 只改了一个输入，就得到了另一条完整路径。原来那次运行仍然完好。")

print("\n=== 5. 两条分支都还在 ===")
print(f"  分叉之后，这个 thread 共有 {len(list(app.get_state_history(cfg)))} 个快照")
print(f"  当前最新状态：{app.get_state(cfg).values}")

print("\n=== 用它来做什么 ===")
print("  调试：Agent 在第 7 步选错了工具，直接回到第 6 步改条件重跑，不用重来一整段对话")
print("  对比：同一个起点分出两条路，看看换个参数结果差多少")
print("  回滚：人工审批发现方向错了，退回更早的一步重新提案（第 17 课用的就是这个）")
print("\n  前提仍然是 checkpointer。没有它，「上一步」根本不存在。")
