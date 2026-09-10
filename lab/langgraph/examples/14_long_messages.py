"""第 14 课：消息太长怎么办 —— 裁剪、过滤、总结，三种不同的取舍。

对话一长，每次调用都要把整段历史发给模型：费用涨、延迟涨，最后直接超出上下文长度。
三种处理方式解决的不是同一个问题，代价也不同。

跑：uv run python examples/14_long_messages.py（不需要 API Key）
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
sys.stdout.reconfigure(encoding="utf-8")

from langchain_core.messages import (
    AIMessage,
    HumanMessage,
    SystemMessage,
    trim_messages,
)

SYSTEM = SystemMessage(content="你是一个客服助手。")
HISTORY = [SYSTEM]
for index in range(1, 7):
    HISTORY.append(HumanMessage(content=f"用户第 {index} 句：我的订单 {1000 + index} 怎么样了"))
    HISTORY.append(AIMessage(content=f"助手第 {index} 句：订单 {1000 + index} 已发货"))

print(f"=== 原始历史：{len(HISTORY)} 条 ===")
print(f"  第一条：{HISTORY[0].content}")
print(f"  最后一条：{HISTORY[-1].content}")

print("\n=== 1. 裁剪：只保留最近的 N 条，但别切坏结构 ===")
trimmed = trim_messages(
    HISTORY,
    max_tokens=4,
    token_counter=len,        # 用「条数」当计量单位，方便观察
    strategy="last",          # 留最近的
    include_system=True,      # 系统消息始终保留
    start_on="human",         # 从一条用户消息开始，别让历史以工具结果开头
)
print(f"  裁剪后 {len(trimmed)} 条：")
for message in trimmed:
    print(f"    {type(message).__name__:14} {message.content}")
print("  ↑ 系统消息留住了，其余只剩最近的几条。start_on='human' 保证开头不会是半截对话。")

print("\n=== 2. 过滤：按类型丢掉不需要的 ===")
no_tool_noise = [m for m in HISTORY if not isinstance(m, AIMessage) or "已发货" not in m.content]
print(f"  丢掉重复的模板回复后：{len(HISTORY)} 条 → {len(no_tool_noise)} 条")
print("  ↑ 过滤按规则删，规则由你定。它不花钱，但只能删掉「明确没用」的东西。")

print("\n=== 3. 总结：把旧历史压成一段话 ===")


def summarize(messages):
    """真实项目里这一步由模型完成；这里用固定文本，保证结果可复现。"""
    covered = [m for m in messages if isinstance(m, HumanMessage)]
    return SystemMessage(
        content=f"以往对话摘要：用户先后询问了 {len(covered)} 个订单的状态，均已发货。"
    )


keep_recent = 4
old, recent = HISTORY[1:-keep_recent], HISTORY[-keep_recent:]
compressed = [SYSTEM, summarize(old), *recent]
print(f"  {len(HISTORY)} 条 → {len(compressed)} 条：")
for message in compressed:
    print(f"    {type(message).__name__:14} {message.content}")

print("\n=== 三种方式的代价 ===")
rows = [
    ("裁剪", "最快，零成本", "旧信息直接消失，模型不知道自己忘了什么"),
    ("过滤", "零成本，可精确控制", "只能删规则明确的内容，判断不了「重要不重要」"),
    ("总结", "旧信息以压缩形式留下", "要多花一次模型调用，且摘要本身可能丢关键细节"),
]
print(f"  {'方式':<8}{'好处':<22}代价")
for name, good, cost in rows:
    print(f"  {name:<8}{good:<22}{cost}")

print("\n  常见组合：系统消息永远保留 + 最近 N 轮原文 + 更早的内容压成一段摘要。")
print("  无论用哪种，都要先确认「模型这一步到底看到了什么」——这是第 03 课那条老规矩。")
