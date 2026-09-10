"""第 4 课：人工审批 —— 让 Agent 在危险操作前停下来等你点头。

这是 LangGraph 相对于「一个 while 循环」最有价值的地方：
因为每步 state 都存在 checkpointer 里，图可以在半路**暂停**、
进程退出、隔一天再从原地**恢复**。

interrupt() 抛出中断，图停住；
再用 Command(resume=...) 提供人的答复；节点会从开头重新执行，
再次走到 interrupt() 时拿到这个答复并继续。

注意：human-in-the-loop 必须配 checkpointer，否则没地方存「停在哪」。

跑：uv run python examples/04_human_in_loop.py
"""

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import START, END, StateGraph
from langgraph.types import Command, interrupt
from typing import TypedDict

import sys

sys.stdout.reconfigure(encoding="utf-8")


class State(TypedDict):
    path: str
    result: str


def propose(state: State) -> dict:
    print(f"[agent] 我打算删除: {state['path']}")
    return {}


def approval(state: State) -> dict:
    # 执行到这里图会停住，把 payload 交给外面的人
    answer = interrupt({"question": f"确认删除 {state['path']} ?", "type": "yes/no"})
    if answer != "yes":
        return {"result": "已取消"}
    return {"result": f"已删除 {state['path']}"}


def report(state: State) -> dict:
    print(f"[agent] 结果: {state['result']}")
    return {}


graph = StateGraph(State)
graph.add_node("propose", propose)
graph.add_node("approval", approval)
graph.add_node("report", report)
graph.add_edge(START, "propose")
graph.add_edge("propose", "approval")
graph.add_edge("approval", "report")
graph.add_edge("report", END)

app = graph.compile(checkpointer=InMemorySaver())


def run(path: str, human_says: str, thread: str) -> None:
    cfg = {"configurable": {"thread_id": thread}}

    out = app.invoke({"path": path, "result": ""}, cfg)
    # 图没跑完，返回里带着 __interrupt__
    intr = out["__interrupt__"][0]
    print(f"[人类] 收到询问: {intr.value['question']}  -> 我回答 {human_says!r}")

    # 恢复。注意第一个参数是 Command，不是新的 state
    app.invoke(Command(resume=human_says), cfg)
    print()


if __name__ == "__main__":
    run("/tmp/cache", human_says="yes", thread="t1")
    run("/etc/passwd", human_says="no", thread="t2")
