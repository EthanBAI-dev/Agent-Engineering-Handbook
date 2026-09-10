"""第 23 课：Subgraph —— 封装很简单，State 对接才是坑。

审批流程在第 16、20 课出现了两次，两次都是复制粘贴。第三次再复制，就该抽成子图了。

子图的语法只有一行：把编译好的图当节点加进去。
真正会咬人的是父子两张图**共享字段**时的合并行为——这一课用实跑把它摊开。

跑：uv run python examples/23_subgraph.py（不需要 API Key）
"""

import operator
import sys
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).parent))
sys.stdout.reconfigure(encoding="utf-8")

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, interrupt
from typing_extensions import TypedDict

print("=== 1. 先看那个坑：父子共享一个累加字段 ===")


class Shared(TypedDict):
    audit: Annotated[list[str], operator.add]


bad_sub = StateGraph(Shared)
bad_sub.add_node("inner", lambda s: {"audit": ["子图做了一件事"]})
bad_sub.add_edge(START, "inner")
bad_sub.add_edge("inner", END)

bad_main = StateGraph(Shared)
bad_main.add_node("prep", lambda s: {"audit": ["父图做了一件事"]})
bad_main.add_node("sub", bad_sub.compile())
bad_main.add_edge(START, "prep")
bad_main.add_edge("prep", "sub")
bad_main.add_edge("sub", END)
print(f"  {bad_main.compile().invoke({'audit': []})}")
print("  ↑「父图做了一件事」出现了两次。父图只写过一次。")

print("\n=== 2. 子图连写都没写，照样重复 ===")
empty_sub = StateGraph(Shared)
empty_sub.add_node("inner", lambda s: {})
empty_sub.add_edge(START, "inner")
empty_sub.add_edge("inner", END)

main2 = StateGraph(Shared)
main2.add_node("prep", lambda s: {"audit": ["父图做了一件事"]})
main2.add_node("sub", empty_sub.compile())
main2.add_edge(START, "prep")
main2.add_edge("prep", "sub")
main2.add_edge("sub", END)
print(f"  {main2.compile().invoke({'audit': []})}")
print("  ↑ 子图只是在 schema 里**声明**了这个字段，什么都没写，值仍然被复制了一份。")
print("     机制：子图把它看到的完整值写回父图，父图的 reducer 又累加了一次。")

print("\n=== 3. 修法一：子图用自己的字段名 ===")


class SubOwn(TypedDict):
    sub_audit: Annotated[list[str], operator.add]


class MainWide(TypedDict):
    audit: Annotated[list[str], operator.add]
    sub_audit: Annotated[list[str], operator.add]


own_sub = StateGraph(SubOwn)
own_sub.add_node("inner", lambda s: {"sub_audit": ["子图做了一件事"]})
own_sub.add_edge(START, "inner")
own_sub.add_edge("inner", END)

main3 = StateGraph(MainWide)
main3.add_node("prep", lambda s: {"audit": ["父图做了一件事"]})
main3.add_node("sub", own_sub.compile())
main3.add_edge(START, "prep")
main3.add_edge("prep", "sub")
main3.add_edge("sub", END)
print(f"  {main3.compile().invoke({'audit': [], 'sub_audit': []})}")
print("  ↑ 各写各的字段，谁也不碰谁。要合并就在父图里显式合并。")

print("\n=== 4. 修法二：共享字段用覆盖型（不加 reducer）===")


class MainMixed(TypedDict):
    audit: Annotated[list[str], operator.add]
    status: str


class SubStatus(TypedDict):
    status: str


status_sub = StateGraph(SubStatus)
status_sub.add_node("inner", lambda s: {"status": "done"})
status_sub.add_edge(START, "inner")
status_sub.add_edge("inner", END)

main4 = StateGraph(MainMixed)
main4.add_node("prep", lambda s: {"audit": ["父图做了一件事"]})
main4.add_node("sub", status_sub.compile())
main4.add_edge(START, "prep")
main4.add_edge("prep", "sub")
main4.add_edge("sub", END)
print(f"  {main4.compile().invoke({'audit': [], 'status': ''})}")
print("  ↑ 覆盖型字段不会被累加，所以可以安全共享。子图只看得到 status。")

print("\n=== 5. 一个真正能用的审批子图 ===")


class ApprovalState(TypedDict):
    action: str                                   # 输入：覆盖型，安全共享
    approved: bool                                # 输出：覆盖型，安全共享
    sub_audit: Annotated[list[str], operator.add]  # 子图私有的累加字段


def request(state: ApprovalState) -> dict:
    return {"sub_audit": [f"提出申请：{state['action']}"]}


def wait_human(state: ApprovalState) -> dict:
    answer = interrupt({"question": f"批准 {state['action']} 吗？"})
    ok = answer == "yes"
    return {"approved": ok, "sub_audit": [f"人工{'批准' if ok else '拒绝'}"]}


approval_graph = StateGraph(ApprovalState)
approval_graph.add_node("request", request)
approval_graph.add_node("wait_human", wait_human)
approval_graph.add_edge(START, "request")
approval_graph.add_edge("request", "wait_human")
approval_graph.add_edge("wait_human", END)
approval = approval_graph.compile()


class MainState(TypedDict):
    action: str
    approved: bool
    audit: Annotated[list[str], operator.add]
    sub_audit: Annotated[list[str], operator.add]
    result: str


def prepare(state: MainState) -> dict:
    return {"audit": ["准备执行"]}


def execute(state: MainState) -> dict:
    if not state["approved"]:
        return {"result": "已取消", "audit": ["未执行"]}
    return {"result": f"已执行 {state['action']}", "audit": ["执行完成"]}


main = StateGraph(MainState)
main.add_node("prepare", prepare)
main.add_node("approval", approval)
main.add_node("execute", execute)
main.add_edge(START, "prepare")
main.add_edge("prepare", "approval")
main.add_edge("approval", "execute")
main.add_edge("execute", END)
app = main.compile(checkpointer=InMemorySaver())


def run(action: str, human: str, thread: str) -> None:
    cfg = {"configurable": {"thread_id": thread}}
    out = app.invoke(
        {"action": action, "approved": False, "audit": [], "sub_audit": [], "result": ""}, cfg
    )
    print(f"  子图把整张图停住了：{out['__interrupt__'][0].value['question']} → {human!r}")
    out = app.invoke(Command(resume=human), cfg)
    print(f"  结果：{out['result']}")
    print(f"  父图轨迹：{out['audit']}")
    print(f"  子图轨迹：{out['sub_audit']}")


run("删除缓存", "yes", "t1")
print()
run("删除数据库", "no", "t2")

print("\n=== 6. 子图能单独跑、单独测 ===")
solo = approval_graph.compile(checkpointer=InMemorySaver())
cfg = {"configurable": {"thread_id": "solo"}}
solo.invoke({"action": "单独测试", "approved": False, "sub_audit": []}, cfg)
out = solo.invoke(Command(resume="yes"), cfg)
print(f"  只跑子图：approved={out['approved']} sub_audit={out['sub_audit']}")
print("  ↑ 这是抽子图最实在的好处：审批逻辑可以脱离业务流程单独验收。")

print("\n=== 什么时候该抽子图 ===")
print("  该抽：同一段流程出现第三次；需要单独测试；它有自己的失败与重试逻辑")
print("  不该抽：只是想让主图看起来短一点——那只是把复杂度挪了个地方")
print("  必查：父子共享的字段里，有没有带 reducer 的。有就会重复计数。")
