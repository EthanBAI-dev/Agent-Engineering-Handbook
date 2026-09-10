"""第 26 课：Agentic RAG —— 让它答「不知道」，比让它答得漂亮更难。

RAG 的流程谁都会画：检索 → 把资料塞进提示词 → 让模型回答。
真正决定它能不能上线的是两件事：答案能不能追到出处，以及**检索不到时会不会编**。

跑：uv run python examples/26_rag.py（不需要 API Key）
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

# 一份很小的知识库。每条都带 id 和来源，这是能引用的前提。
CORPUS = [
    {"id": "doc-1", "kw": "年假", "source": "员工手册 v3 第 2 章", "text": "年假从入职满一年起算，每年 10 天。"},
    {"id": "doc-2", "kw": "报销", "source": "员工手册 v3 第 5 章", "text": "报销需在消费后 30 天内提交。"},
    {"id": "doc-3", "kw": "密码", "source": "IT 指南 v1", "text": "忘记密码请在自助门户重置。"},
]
MIN_HITS = 1


class State(TypedDict):
    question: str
    hits: list[dict]
    answer: str
    citations: Annotated[list[str], operator.add]


def retrieve(state: State) -> dict:
    """真实项目里是向量检索；这里用关键词，保证可复现。"""
    return {"hits": [d for d in CORPUS if d["kw"] in state["question"]]}


def route(state: State) -> str:
    return "answer" if len(state["hits"]) >= MIN_HITS else "refuse"


def answer(state: State) -> dict:
    context = "\n".join(f"[{h['id']}] {h['text']}" for h in state["hits"])
    reply = ScriptedModel(script=[ai(state["hits"][0]["text"])]).invoke(
        f"只根据以下资料回答：\n{context}\n问题：{state['question']}"
    )
    return {"answer": reply.content, "citations": [h["source"] for h in state["hits"]]}


def refuse(state: State) -> dict:
    """检索不到就说不知道。模型根本没被调用，也就没有机会编。"""
    return {"answer": "知识库里没有找到相关内容，我不能回答这个问题。"}


graph = StateGraph(State)
graph.add_node("retrieve", retrieve)
graph.add_node("answer", answer)
graph.add_node("refuse", refuse)
graph.add_edge(START, "retrieve")
graph.add_conditional_edges("retrieve", route, ["answer", "refuse"])
graph.add_edge("answer", END)
graph.add_edge("refuse", END)
app = graph.compile()


def ask(question: str) -> dict:
    out = app.invoke({"question": question, "hits": [], "answer": "", "citations": []})
    print(f"  问：{question}")
    print(f"  答：{out['answer']}")
    print(f"  依据：{out['citations'] or '（无）'}")
    return out


print("=== 1. 检索命中：答案带出处 ===")
ask("年假有几天？")

print("\n=== 2. 检索落空：明确说不知道 ===")
ask("公司几点下班？")
print("  ↑ 这条路径由**条件边**保证，不是靠提示词里写「不知道就说不知道」。")
print("     模型根本没有被调用，也就没有机会编。")

print("\n=== 3. 反面示范：不管有没有检索到都让模型答 ===")


def answer_anyway(state: State) -> dict:
    context = "\n".join(f"[{h['id']}] {h['text']}" for h in state["hits"]) or "（没有检索到资料）"
    reply = ScriptedModel(script=[ai("公司一般下午六点下班。")]).invoke(context)
    return {"answer": reply.content}


bad = StateGraph(State)
bad.add_node("retrieve", retrieve)
bad.add_node("answer", answer_anyway)
bad.add_edge(START, "retrieve")
bad.add_edge("retrieve", "answer")
bad.add_edge("answer", END)
out = bad.compile().invoke({"question": "公司几点下班？", "hits": [], "answer": "", "citations": []})
print(f"  问：公司几点下班？")
print(f"  答：{out['answer']}")
print(f"  依据：{out['citations'] or '（无）'}")
print("  ↑ 语气笃定，没有出处，内容是编的。用户没有任何办法分辨。")

print("\n=== 4. 引用要能追回原文 ===")
out = ask("报销期限是多久？")
for hit in out["hits"]:
    print(f"    {hit['id']} · {hit['source']}：{hit['text']}")
print("  ↑ 引用不是在答案后缀一句「来源：员工手册」，是能定位到具体哪一条。")

print("\n=== 五件必须做的事 ===")
print("  1. 每条资料带 id 和来源，检索前就要有，不能事后补")
print("  2. 命中数不足时走拒绝分支，别把决定权交给模型")
print("  3. 提示词里写「只根据以下资料回答」，但不要指望它兜底")
print("  4. 答案和引用一起返回，让用户能自己核对")
print("  5. 知识库会过期：手册 v3 换成 v4 时，旧答案也要跟着失效")
