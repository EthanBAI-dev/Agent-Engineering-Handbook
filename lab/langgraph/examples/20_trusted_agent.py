"""第 20 课：项目 —— 可信的文件整理 Agent，跑通三条验收路径。

单元四的收尾。这个 Agent 不新增任何 API，它只是把前面几课的部件按正确顺序装起来：

    风险分级（16）→ 人工审批与改参数（17）→ 幂等副作用（19）
    全程 checkpointer（03/15），调用有上限（10）

验收标准不是「能跑」，是三条路径都符合预期：批准、拒绝、失败后恢复。

跑：uv run python examples/20_trusted_agent.py（不需要 API Key）
"""

import sys
from pathlib import Path
from typing import Literal

sys.path.insert(0, str(Path(__file__).parent))
sys.stdout.reconfigure(encoding="utf-8")

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, RetryPolicy, interrupt
from typing_extensions import TypedDict

POLICY: dict[str, Literal["auto", "approve", "forbid"]] = {
    "scan": "auto",
    "archive": "approve",
    "delete": "approve",
    "format_disk": "forbid",
}

# 模拟的外部世界：文件系统和一份「已经做过的操作」台账。
DISK = {"/tmp/a.log": 400, "/tmp/b.log": 30, "/tmp/keep.md": 5}
DONE: dict[str, str] = {}
FLAKY = {"fail_times": 0}


class State(TypedDict):
    action: str
    target: str
    op_id: str
    level: str
    found: list[str]
    result: str


def classify(state: State) -> dict:
    return {"level": POLICY.get(state["action"], "forbid")}


def scan(state: State) -> dict:
    found = [path for path, days in DISK.items() if days > 90]
    return {"found": found, "result": f"扫描到 {len(found)} 个超过 90 天的文件：{found}"}


def ask(state: State) -> dict:
    answer = interrupt({
        "question": f"允许对 {state['target']} 执行 {state['action']} 吗？",
        "level": state["level"],
    })
    if answer != "yes":
        return {"result": f"用户拒绝，未执行 {state['action']}"}
    return {}


def apply(state: State) -> dict:
    """真正产生副作用的一步：必须幂等，必须能重试。"""
    if state["result"]:
        return {}                                 # 上一步已经判定为拒绝
    key = state["op_id"]
    if key in DONE:
        return {"result": f"{key} 之前已执行过，跳过（幂等）"}

    if FLAKY["fail_times"] > 0:
        FLAKY["fail_times"] -= 1
        raise ConnectionError("外部存储没响应")

    DONE[key] = state["action"]
    DISK.pop(state["target"], None)
    return {"result": f"已{state['action']} {state['target']}"}


def refuse(state: State) -> dict:
    return {"result": f"策略禁止：{state['action']} 不在允许清单内"}


def route(state: State) -> str:
    return {"auto": "scan", "approve": "ask", "forbid": "refuse"}[state["level"]]


graph = StateGraph(State)
graph.add_node("classify", classify)
graph.add_node("scan", scan)
graph.add_node("ask", ask)
graph.add_node("apply", apply, retry_policy=RetryPolicy(max_attempts=3, initial_interval=0.01, backoff_factor=1.0))
graph.add_node("refuse", refuse)
graph.add_edge(START, "classify")
graph.add_conditional_edges("classify", route, ["scan", "ask", "refuse"])
graph.add_edge("ask", "apply")
graph.add_edge("scan", END)
graph.add_edge("apply", END)
graph.add_edge("refuse", END)

app = graph.compile(checkpointer=InMemorySaver())


def run(action: str, target: str, op_id: str, human: str | None, thread: str) -> dict:
    cfg = {"configurable": {"thread_id": thread}}
    out = app.invoke(
        {"action": action, "target": target, "op_id": op_id,
         "level": "", "found": [], "result": ""},
        cfg,
    )
    if "__interrupt__" in out:
        print(f"    暂停：{out['__interrupt__'][0].value['question']} → 人回答 {human!r}")
        out = app.invoke(Command(resume=human), cfg)
    return out


print("=== 验收 1：只读操作不打扰人 ===")
out = run("scan", "/tmp", "op_scan", None, "t1")
print(f"    {out['result']}\n")

print("=== 验收 2：批准后执行，且只执行一次 ===")
out = run("delete", "/tmp/a.log", "op_del_a", "yes", "t2")
print(f"    {out['result']}")
out = run("delete", "/tmp/a.log", "op_del_a", "yes", "t3")
print(f"    重复提交同一个 op_id：{out['result']}")
print(f"    台账：{DONE}\n")

print("=== 验收 3：拒绝后不产生任何副作用 ===")
before = dict(DISK)
out = run("delete", "/tmp/keep.md", "op_del_keep", "no", "t4")
print(f"    {out['result']}")
print(f"    磁盘有没有变化：{'没有' if DISK == before else '有！这是 bug'}\n")

print("=== 验收 4：中途失败，重试后恢复，且不重复执行 ===")
FLAKY["fail_times"] = 2
out = run("archive", "/tmp/b.log", "op_arc_b", "yes", "t5")
print(f"    {out['result']}")
print(f"    台账里 op_arc_b 出现 {list(DONE.values()).count('archive')} 次\n")

print("=== 验收 5：禁止级操作，连问都不问 ===")
out = run("format_disk", "/", "op_fmt", None, "t6")
print(f"    {out['result']}\n")

print("=== 这张图为什么可信 ===")
print("  1. 风险表是代码，模型改不了它，未登记的操作按 forbid 处理")
print("  2. 危险操作前必然经过 interrupt，拒绝路径不碰任何副作用")
print("  3. 副作用那一步有幂等键，重试和重复提交都只生效一次")
print("  4. 全程有 checkpointer，失败可以从原地恢复，而不是从头再来")
print("\n  仍然是教学版：台账在内存里、没有账号、没有真实文件操作。")
print("  换成生产版要做的事在第 15、28、29 课。")
