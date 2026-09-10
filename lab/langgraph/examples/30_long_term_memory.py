"""第 30 课：长期记忆 —— 跨会话记住这个人，而不只是这段对话。

第 03、15 课的记忆都绑在一个 thread 上：换个会话就从头开始。
但用户不会觉得「换了个会话」是重新认识一次的理由。

thread 记的是「这段对话说了什么」，长期记忆记的是「这个人是谁」。
两者存在不同的地方，生命周期也不同。

跑：uv run python examples/30_long_term_memory.py（不需要 API Key）
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
sys.stdout.reconfigure(encoding="utf-8")

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.store.base import BaseStore
from langgraph.store.memory import InMemoryStore
from langchain_core.runnables import RunnableConfig

from _fake import ScriptedModel, ai

store = InMemoryStore()


def memory_ns(user_id: str) -> tuple[str, ...]:
    """命名空间带上 user_id：这是跨用户隔离的地基，不是可选项。"""
    return ("users", user_id, "memories")


def build():
    def recall(state: MessagesState, config: RunnableConfig, *, store: BaseStore) -> dict:
        """回忆：跑之前先看看关于这个人我们知道什么。"""
        user_id = config["configurable"]["user_id"]
        items = store.search(memory_ns(user_id))
        facts = [item.value["fact"] for item in items]
        print(f"    [recall] 关于 {user_id} 已知 {len(facts)} 条：{facts}")
        return {}

    def respond(state: MessagesState, config: RunnableConfig, *, store: BaseStore) -> dict:
        user_id = config["configurable"]["user_id"]
        facts = [i.value["fact"] for i in store.search(memory_ns(user_id))]
        text = f"（我记得：{'、'.join(facts)}）" if facts else "（我还不了解你）"
        return {"messages": [ScriptedModel(script=[ai(text)]).invoke("回答")]}

    def remember(state: MessagesState, config: RunnableConfig, *, store: BaseStore) -> dict:
        """记住：从这一轮里提取值得长期保留的事实。

        真实项目里由模型判断「什么值得记」；这里用关键词，保证可复现。
        """
        user_id = config["configurable"]["user_id"]
        said = str(state["messages"][0].content)
        for keyword, fact in [("咖啡", "喜欢咖啡"), ("LangGraph", "在学 LangGraph")]:
            if keyword in said:
                # key 用事实本身：同一条事实说十次也只存一条，天然幂等（第 19 课）
                store.put(memory_ns(user_id), fact, {"fact": fact})
        return {}

    graph = StateGraph(MessagesState)
    graph.add_node("recall", recall)
    graph.add_node("respond", respond)
    graph.add_node("remember", remember)
    graph.add_edge(START, "recall")
    graph.add_edge("recall", "respond")
    graph.add_edge("respond", "remember")
    graph.add_edge("remember", END)
    return graph.compile(checkpointer=InMemorySaver(), store=store)


app = build()


def say(user_id: str, thread_id: str, text: str) -> None:
    print(f"  {user_id} 在 {thread_id} 说：{text}")
    out = app.invoke(
        {"messages": [("user", text)]},
        {"configurable": {"thread_id": thread_id, "user_id": user_id}},
    )
    print(f"    → {out['messages'][-1].content}\n")


print("=== 1. 第一段会话：什么都不知道，然后学到两件事 ===")
say("alice", "t1", "我在学 LangGraph，顺便说我喜欢咖啡")

print("=== 2. 换一个 thread：会话历史没了，但人还记得 ===")
say("alice", "t2", "还记得我吗")
print("  ↑ 这正是和第 03 课的区别：thread 换了，checkpoint 是空的，")
print("     但 store 里关于 alice 的事实还在。\n")

print("=== 3. 换一个用户：一条都不该看见 ===")
say("bob", "t3", "还记得我吗")
print("  ↑ 命名空间里带着 user_id，bob 搜不到 alice 的东西。")
print("     这是第 29 课那条隔离，在长期记忆这一层的落法。\n")

print("=== 4. 同一条事实说三次，只存一条 ===")
say("alice", "t4", "再说一次，我喜欢咖啡")
say("alice", "t5", "真的很喜欢咖啡")
items = store.search(memory_ns("alice"))
print(f"  alice 的长期记忆共 {len(items)} 条：{[i.value['fact'] for i in items]}")
print("  ↑ key 用事实本身，重复写入就是覆盖。这是第 19 课的幂等换了个场景。\n")

print("=== 5. 三层记忆分别管什么 ===")
rows = [
    ("这一次调用带上哪些消息", "上下文管理", "第 14 课", "跑完就不管了"),
    ("这段对话说了什么", "checkpointer", "第 03、15 课", "按 thread 存，会话结束仍在"),
    ("这个人是谁", "store", "本课", "按 user 存，跨所有会话"),
]
print(f"  {'管什么':<22}{'谁负责':<16}{'哪一课':<14}生命周期")
for what, who, where, life in rows:
    print(f"  {what:<22}{who:<16}{where:<14}{life}")

print("\n=== 6. 长期记忆最难的不是存，是判断 ===")
print("  存一条事实是一行代码。难的是回答这三个问题：")
print("    · 什么值得记？把每句话都记下来，等于没记")
print("    · 记错了怎么办？用户改了口味，旧事实要能被覆盖或删除")
print("    · 用户要求删除时，你知道该删哪些吗？命名空间设计决定了这一步做不做得到")
print("\n  最后一条是法律要求，不是产品选项。命名空间按 user_id 分，")
print("  删除就是删掉一个前缀；混在一起存，你永远说不清删干净了没有。")
