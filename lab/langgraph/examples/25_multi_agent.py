"""第 25 课：Multi-Agent —— 先证明你真的需要第二个 Agent。

「多 Agent 协作」听起来比「一张图」高级，所以它常被当成默认选择。
但多一个 Agent 就多一层交接，而交接是要付代价的：上下文会丢，成本会涨，出错更难定位。

这一课不教怎么搭多 Agent，教怎么判断该不该搭。

跑：uv run python examples/25_multi_agent.py（不需要 API Key）
"""

import operator
import sys
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).parent))
sys.stdout.reconfigure(encoding="utf-8")

from langgraph.graph import END, START, StateGraph
from typing_extensions import TypedDict

from _fake import ScriptedModel, ai

FACTS = {"客户": "张三", "金额": "1200 元", "日期": "3 月 5 日"}


class Single(TypedDict):
    task: str
    notes: Annotated[list[str], operator.add]
    calls: int
    output: str


print("=== 1. 一张图：所有步骤共享同一份 State ===")


def collect(state: Single) -> dict:
    return {"notes": [f"{k}={v}" for k, v in FACTS.items()], "calls": state["calls"] + 1}


def draft(state: Single) -> dict:
    # 它能看到 collect 留下的全部内容，一条都没丢。
    return {"output": "；".join(state["notes"]), "calls": state["calls"] + 1}


g = StateGraph(Single)
g.add_node("collect", collect)
g.add_node("draft", draft)
g.add_edge(START, "collect")
g.add_edge("collect", "draft")
g.add_edge("draft", END)
out = g.compile().invoke({"task": "写一份对账说明", "notes": [], "calls": 0, "output": ""})
print(f"  模型调用 {out['calls']} 次")
print(f"  产出：{out['output']}")
print(f"  信息完整度：{len(out['notes'])}/{len(FACTS)} 条事实都在\n")

print("=== 2. 两个 Agent：中间隔了一次交接 ===")


class MultiState(TypedDict):
    task: str
    handoff: str          # 交接内容：一段文本，不是完整 State
    calls: int
    output: str


def agent_a(state: MultiState) -> dict:
    """收集 Agent。它把结果压成一段话交给下一个 Agent。"""
    summary = ScriptedModel(script=[ai("客户张三，金额 1200 元。")]).invoke("总结")
    return {"handoff": summary.content, "calls": state["calls"] + 1}


def agent_b(state: MultiState) -> dict:
    """撰写 Agent。它只看得到 handoff，看不到 A 的工作现场。"""
    reply = ScriptedModel(script=[ai(f"根据「{state['handoff']}」写成的说明")]).invoke("撰写")
    return {"output": reply.content, "calls": state["calls"] + 1}


g2 = StateGraph(MultiState)
g2.add_node("agent_a", agent_a)
g2.add_node("agent_b", agent_b)
g2.add_edge(START, "agent_a")
g2.add_edge("agent_a", "agent_b")
g2.add_edge("agent_b", END)
out2 = g2.compile().invoke({"task": "写一份对账说明", "handoff": "", "calls": 0, "output": ""})
print(f"  模型调用 {out2['calls']} 次")
print(f"  交接内容：{out2['handoff']}")
print(f"  产出：{out2['output']}")
kept = sum(1 for value in FACTS.values() if value in out2["handoff"])
print(f"  信息完整度：{kept}/{len(FACTS)} 条事实活着通过了交接")
print(f"  丢掉的：{[k for k, v in FACTS.items() if v not in out2['handoff']]}")
print("  ↑ 日期没了。A 知道它，但没写进交接文本，B 就再也看不到了。\n")

print("=== 3. 交接损耗是多 Agent 的固有成本 ===")
print("  它不是没写好，是结构决定的：")
print("    · 交接内容如果是完整 State，那和一张图没有区别，只是多了一次调用")
print("    · 交接内容如果是摘要，就一定会丢东西——摘要的定义就是丢东西")
print("  所以问题永远是：为了换来什么，值得丢这些？\n")

print("=== 4. 什么时候多 Agent 真的划算 ===")
rows = [
    ("步骤多但目标单一", "一张图", "共享 State 没有损耗，调试也简单"),
    ("需要不同的工具权限", "多 Agent", "把危险工具关在一个 Agent 里，其他 Agent 拿不到"),
    ("需要不同的模型或成本档位", "多 Agent", "简单活给便宜模型，难的给贵的"),
    ("由不同团队维护和发布", "多 Agent", "边界即接口，能各自升级"),
    ("只是想让流程看起来清晰", "一张图", "用子图就够了，第 23 课"),
    ("想让 Agent 互相检查", "看情况", "先试同一张图里加一个检查节点，通常够用"),
]
print(f"  {'情况':<24}{'选哪个':<12}原因")
for case, pick, why in rows:
    print(f"  {case:<24}{pick:<12}{why}")

print("\n=== 5. 一个判断标准 ===")
print("  能用一句话说清「这两个 Agent 各自不许知道什么」吗？")
print("    说得清 → 这条边界是真的，多 Agent 有意义")
print("    说不清 → 你要的其实是子图，不是第二个 Agent")
