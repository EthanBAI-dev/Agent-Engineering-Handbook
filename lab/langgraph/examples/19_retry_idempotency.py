"""第 19 课：Retry 与幂等 —— 重试很容易，重试不重复扣款才难。

网络会抖，外部服务会 503。给节点加上自动重试，一行配置就行。
真正的问题在后面：如果失败发生在「已经扣了款、还没写回结果」的中间，
重试会不会扣第二次？

跑：uv run python examples/19_retry_idempotency.py（不需要 API Key）
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
sys.stdout.reconfigure(encoding="utf-8")

from langgraph.graph import END, START, StateGraph
from langgraph.types import RetryPolicy
from typing_extensions import TypedDict


class State(TypedDict):
    order_id: str
    status: str


print("=== 1. 自动重试：前两次失败，第三次成功 ===")

attempts = {"count": 0}


def flaky(state: State) -> dict:
    attempts["count"] += 1
    if attempts["count"] < 3:
        raise ConnectionError(f"第 {attempts['count']} 次：外部服务没响应")
    return {"status": f"成功（第 {attempts['count']} 次尝试）"}


graph = StateGraph(State)
graph.add_node(
    "call_service",
    flaky,
    retry_policy=RetryPolicy(max_attempts=3, initial_interval=0.01, backoff_factor=1.0),
)
graph.add_edge(START, "call_service")
graph.add_edge("call_service", END)
out = graph.compile().invoke({"order_id": "o_1", "status": ""})
print(f"  实际尝试 {attempts['count']} 次 → {out['status']}")

print("\n=== 2. 重试次数不够：异常照样抛出来 ===")
attempts["count"] = 0
graph2 = StateGraph(State)
graph2.add_node(
    "call_service",
    flaky,
    retry_policy=RetryPolicy(max_attempts=2, initial_interval=0.01, backoff_factor=1.0),
)
graph2.add_edge(START, "call_service")
graph2.add_edge("call_service", END)
try:
    graph2.compile().invoke({"order_id": "o_2", "status": ""})
except ConnectionError as error:
    print(f"  重试 {attempts['count']} 次后放弃：{error}")
print("  ↑ 重试不是万能的。次数用完仍然要有一条失败路径，不能假设它总会成功。")

print("\n=== 3. 危险的重试：每次都真的扣一笔 ===")

ledger: list[str] = []


def charge_unsafe(state: State) -> dict:
    ledger.append(state["order_id"])          # 副作用先发生
    if len(ledger) < 3:
        raise ConnectionError("扣款成功了，但回执没收到")
    return {"status": "已扣款"}


graph3 = StateGraph(State)
graph3.add_node(
    "charge",
    charge_unsafe,
    retry_policy=RetryPolicy(max_attempts=3, initial_interval=0.01, backoff_factor=1.0),
)
graph3.add_edge(START, "charge")
graph3.add_edge("charge", END)
graph3.compile().invoke({"order_id": "o_3", "status": ""})
print(f"  账本里现在有 {len(ledger)} 笔：{ledger}")
print("  ↑ 图看起来「成功了」，用户被扣了三次。失败的是回执，不是扣款。")

print("\n=== 4. 幂等：同一个 key 只生效一次 ===")

safe_ledger: dict[str, str] = {}
calls = {"count": 0}


def charge_safe(state: State) -> dict:
    calls["count"] += 1
    key = state["order_id"]                    # 幂等键：同一笔业务永远同一个 key
    if key in safe_ledger:
        return {"status": f"已存在，直接返回上次结果（第 {calls['count']} 次调用）"}
    safe_ledger[key] = "charged"
    if calls["count"] < 3:
        raise ConnectionError("扣款成功了，但回执没收到")
    return {"status": "已扣款"}


graph4 = StateGraph(State)
graph4.add_node(
    "charge",
    charge_safe,
    retry_policy=RetryPolicy(max_attempts=3, initial_interval=0.01, backoff_factor=1.0),
)
graph4.add_edge(START, "charge")
graph4.add_edge("charge", END)
out = graph4.compile().invoke({"order_id": "o_4", "status": ""})
print(f"  节点被调用 {calls['count']} 次，账本里只有 {len(safe_ledger)} 笔：{safe_ledger}")
print(f"  最终状态：{out['status']}")

print("\n=== 判断一个节点能不能安全重试 ===")
rows = [
    ("读文件、查数据库、算数", "可以直接重试", "没有副作用，跑一百次结果一样"),
    ("写文件到固定路径", "可以直接重试", "覆盖写本身就是幂等的"),
    ("扣款、发邮件、发消息", "必须先加幂等键", "重试等于再做一次，用户能看见"),
    ("追加一行日志", "看情况", "重复的日志无害，但会干扰统计"),
]
print(f"  {'动作':<22}{'能否重试':<16}原因")
for action, verdict, why in rows:
    print(f"  {action:<22}{verdict:<16}{why}")

print("\n  一句话：重试之前先问「这一步做第二次，外面看得见吗」。")
print("  看得见，就需要一个幂等键——通常是订单号、请求 id 这类业务上唯一的东西。")
