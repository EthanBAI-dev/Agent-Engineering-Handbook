"""第 24 课：Planner–Executor —— 先把计划写下来，才能检查它。

ReAct 每一步都现想下一步，好处是灵活，坏处是你无法在它动手之前看到全貌。
需要审查、需要预估成本、需要中途换人接手的时候，就得先有一份**写下来的计划**。

计划是数据，不是想法。写成数据，才能校验、修改、重排。

跑：uv run python examples/24_planner_executor.py（不需要 API Key）
"""

import operator
import sys
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).parent))
sys.stdout.reconfigure(encoding="utf-8")

from langgraph.graph import END, START, StateGraph
from typing_extensions import TypedDict

ALLOWED_STEPS = {"fetch", "parse", "summarize", "save"}
MAX_REPLANS = 2


class State(TypedDict):
    goal: str
    plan: list[str]
    done: Annotated[list[str], operator.add]
    cursor: int
    replans: int
    status: str


# 模拟外部世界：parse 第一次会失败一次。
WORLD = {"parse_fails": 1}


def planner(state: State) -> dict:
    """真实项目里这一步由模型产出；这里写死，保证可复现。"""
    if state["replans"] == 0:
        plan = ["fetch", "parse", "summarize", "save"]
    else:
        # 重规划：跳过失败的 parse，改用更保守的路线
        plan = ["fetch", "summarize", "save"]
    return {"plan": plan, "cursor": 0, "status": f"计划已生成：{' → '.join(plan)}"}


def validate(state: State) -> dict:
    """计划是数据，所以可以校验。这一步在模型和执行之间。"""
    unknown = [step for step in state["plan"] if step not in ALLOWED_STEPS]
    if unknown:
        return {"status": f"计划非法：出现未知步骤 {unknown}"}
    if len(state["plan"]) > 6:
        return {"status": f"计划过长：{len(state['plan'])} 步，超出上限"}
    return {"status": "计划通过校验"}


def executor(state: State) -> dict:
    step = state["plan"][state["cursor"]]
    if step == "parse" and WORLD["parse_fails"] > 0:
        WORLD["parse_fails"] -= 1
        return {"status": f"步骤 {step} 失败", "cursor": state["cursor"]}
    return {"done": [step], "cursor": state["cursor"] + 1, "status": f"步骤 {step} 完成"}


def route_after_validate(state: State) -> str:
    return "executor" if state["status"] == "计划通过校验" else "give_up"


def route_after_step(state: State) -> str:
    if state["status"].endswith("失败"):
        return "bump_replan" if state["replans"] < MAX_REPLANS else "give_up"
    if state["cursor"] >= len(state["plan"]):
        return "finish"
    return "executor"


def bump_replan(state: State) -> dict:
    return {"replans": state["replans"] + 1}


def finish(state: State) -> dict:
    return {"status": f"完成：{' → '.join(state['done'])}"}


def give_up(state: State) -> dict:
    return {"status": f"放弃：{state['status']}，已完成 {state['done']}"}


graph = StateGraph(State)
graph.add_node("planner", planner)
graph.add_node("validate", validate)
graph.add_node("executor", executor)
graph.add_node("bump_replan", bump_replan)
graph.add_node("finish", finish)
graph.add_node("give_up", give_up)
graph.add_edge(START, "planner")
graph.add_edge("planner", "validate")
graph.add_conditional_edges("validate", route_after_validate, ["executor", "give_up"])
graph.add_conditional_edges("executor", route_after_step, ["executor", "bump_replan", "finish", "give_up"])
graph.add_edge("bump_replan", "planner")
graph.add_edge("finish", END)
graph.add_edge("give_up", END)
app = graph.compile()

BASE = {"goal": "整理这份资料", "plan": [], "done": [], "cursor": 0, "replans": 0, "status": ""}

print("=== 1. 计划先写下来，再执行 ===")
out = app.invoke(dict(BASE))
print(f"  最终计划：{out['plan']}")
print(f"  实际执行：{out['done']}")
print(f"  重规划 {out['replans']} 次")
print(f"  {out['status']}")
print("  ↑ parse 第一次失败，触发重规划，第二版计划绕开了它。")
print("     注意 fetch 执行了两次：重规划会从头再来，已经做过的步骤会被重做。")
print("     所以有副作用的步骤必须是幂等的——第 19 课那个幂等键，在这里又用上了。\n")

print("=== 2. 计划是数据，所以能在执行前拦下来 ===")


def bad_planner(state: State) -> dict:
    return {"plan": ["fetch", "rm_rf", "save"], "cursor": 0, "status": "计划已生成"}


graph2 = StateGraph(State)
graph2.add_node("planner", bad_planner)
graph2.add_node("validate", validate)
graph2.add_node("executor", executor)
graph2.add_node("give_up", give_up)
graph2.add_node("finish", finish)
graph2.add_edge(START, "planner")
graph2.add_edge("planner", "validate")
graph2.add_conditional_edges("validate", route_after_validate, ["executor", "give_up"])
graph2.add_conditional_edges("executor", route_after_step, ["executor", "finish", "give_up"])
graph2.add_edge("finish", END)
graph2.add_edge("give_up", END)
out = graph2.compile().invoke(dict(BASE))
print(f"  {out['status']}")
print(f"  实际执行了：{out['done']}")
print("  ↑ 一步都没执行。校验发生在 planner 和 executor 之间——这是这个模式最大的价值。\n")

print("=== 3. 重规划次数必须有上限 ===")


def stubborn_planner(state: State) -> dict:
    """每次都坚持要 parse 的规划器：它永远绕不开那个失败。"""
    plan = ["fetch", "parse", "save"]
    return {"plan": plan, "cursor": 0, "status": f"计划已生成：{' → '.join(plan)}"}


graph3 = StateGraph(State)
graph3.add_node("planner", stubborn_planner)
graph3.add_node("validate", validate)
graph3.add_node("executor", executor)
graph3.add_node("bump_replan", bump_replan)
graph3.add_node("finish", finish)
graph3.add_node("give_up", give_up)
graph3.add_edge(START, "planner")
graph3.add_edge("planner", "validate")
graph3.add_conditional_edges("validate", route_after_validate, ["executor", "give_up"])
graph3.add_conditional_edges("executor", route_after_step, ["executor", "bump_replan", "finish", "give_up"])
graph3.add_edge("bump_replan", "planner")
graph3.add_edge("finish", END)
graph3.add_edge("give_up", END)

WORLD["parse_fails"] = 99          # parse 永远失败
out = graph3.compile().invoke(dict(BASE))
print(f"  重规划 {out['replans']} 次后：{out['status']}")
print(f"  上限 MAX_REPLANS = {MAX_REPLANS}")
print("  ↑ 没有上限，一个永远失败的步骤会让它无限重规划——第 10 课那条老规矩。\n")

print("=== 和 ReAct 怎么选 ===")
rows = [
    ("步骤数量事先不知道", "ReAct", "计划写不出来，只能走一步看一步"),
    ("需要人先审一遍再动手", "Planner", "计划是数据，能展示、能修改"),
    ("需要预估成本和耗时", "Planner", "步数已知，可以先算再决定跑不跑"),
    ("环境变化快，计划容易过期", "ReAct", "写好的计划执行到一半就不适用了"),
    ("失败时要换一条整体路线", "Planner", "重规划就是换一版计划，ReAct 只能改下一步"),
]
print(f"  {'情况':<22}{'选哪个':<10}原因")
for case, pick, why in rows:
    print(f"  {case:<22}{pick:<10}{why}")
