"""第 17 课：人工修改 State —— 审批不该只有「同意」和「拒绝」两个按钮。

真实场景里，人看到 Agent 的提案后，最常见的反应不是同意或拒绝，
而是「方向对，但参数不对」：范围太大、金额写错、收件人少了一个。

只给两个按钮，人就只能拒绝，然后让 Agent 从头再来一遍——慢，而且未必能改对。
正确做法是让人直接改 State，再从原地继续。

跑：uv run python examples/17_edit_state.py（不需要 API Key）
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
sys.stdout.reconfigure(encoding="utf-8")

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, interrupt
from typing_extensions import TypedDict


class State(TypedDict):
    target: str
    days: int
    plan: str
    result: str


def propose(state: State) -> dict:
    return {"plan": f"清理 {state['target']} 下超过 {state['days']} 天的文件"}


def review(state: State) -> dict:
    answer = interrupt({"plan": state["plan"], "options": ["yes", "no"]})
    if answer != "yes":
        return {"result": "已取消"}
    return {"result": f"已执行：{state['plan']}"}


graph = StateGraph(State)
graph.add_node("propose", propose)
graph.add_node("review", review)
graph.add_edge(START, "propose")
graph.add_edge("propose", "review")
graph.add_edge("review", END)

app = graph.compile(checkpointer=InMemorySaver())
BASE = {"target": "/", "days": 7, "plan": "", "result": ""}


def start(thread: str):
    cfg = {"configurable": {"thread_id": thread}}
    out = app.invoke(BASE, cfg)
    print(f"  Agent 提案：{out['__interrupt__'][0].value['plan']}")
    return cfg


print("=== 1. 只能同意或拒绝：人只好拒绝 ===")
cfg = start("t1")
print("  人：范围是整个根目录，太危险了 → 拒绝")
out = app.invoke(Command(resume="no"), cfg)
print(f"  结果：{out['result']}")
print("  ↑ Agent 什么也没学到，下次可能提出同样的方案。\n")

print("=== 2. 人直接改 State，再从原地继续 ===")
cfg = start("t2")
print("  人：方向对，但把范围改成 /tmp，天数改成 30")

# update_state 把修改写进当前快照；as_node 指明「就当是这个节点写的」
app.update_state(cfg, {"target": "/tmp", "days": 30}, as_node="propose")

snapshot = app.get_state(cfg)
print(f"  改完之后 State：target={snapshot.values['target']} days={snapshot.values['days']}")
print(f"  下一个要跑的节点：{snapshot.next}")

out = app.invoke(Command(resume="yes"), cfg)
print(f"  结果：{out['result']}")
print("  ↑ 注意 plan 还是旧的——它是 propose 上一次算出来的，改 State 不会自动重算。\n")

print("=== 3. 想让提案重算，就退回到 propose 之前 ===")
cfg = start("t3")
print("  人：把范围改成 /tmp、30 天，并且让 Agent 重新生成提案")

history = list(app.get_state_history(cfg))
before_propose = [h for h in history if h.next == ("propose",)][0]
forked = app.update_state(before_propose.config, {"target": "/tmp", "days": 30})

out = app.invoke(None, forked)
print(f"  重新生成的提案：{out['__interrupt__'][0].value['plan']}")
# 恢复时用线程级 config：forked 指向的是那个旧快照，分叉跑过之后最新状态已经往前走了。
out = app.invoke(Command(resume="yes"), cfg)
print(f"  结果：{out['result']}")

print("\n=== 两种改法怎么选 ===")
print("  改当前 State  ：人已经想清楚最终参数了，直接改完继续，省一次模型调用")
print("  退回重新生成  ：改动会影响后续推理，让 Agent 基于新参数重新想一遍")
print("  共同前提      ：都要有 checkpointer，否则没有「原地」可回")
