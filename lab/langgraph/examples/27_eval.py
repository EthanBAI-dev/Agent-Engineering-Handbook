"""第 27 课：评测与可观测 —— 「感觉变好了」不是证据。

改一版提示词，跑两个例子觉得不错，就上线了。过两天用户报了一个从前能答对的问题。
没有数据集，你甚至说不清这次改动到底是变好还是变差。

这一课做两件最小可行的事：一个能跑的数据集，和一份能定位失败的运行记录。

跑：uv run python examples/27_eval.py（不需要 API Key）
"""

import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
sys.stdout.reconfigure(encoding="utf-8")

from langgraph.graph import END, START, StateGraph
from typing_extensions import TypedDict

CORPUS = {
    "年假": "年假从入职满一年起算，每年 10 天。",
    "报销": "报销需在消费后 30 天内提交。",
    "密码": "忘记密码请在自助门户重置。",
}

# 数据集：输入 + 期望。期望写成「必须出现什么」，而不是一整句标准答案。
DATASET = [
    {"id": "c1", "question": "年假有几天？", "must_contain": "10 天", "should_refuse": False},
    {"id": "c2", "question": "报销期限是多久？", "must_contain": "30 天", "should_refuse": False},
    {"id": "c3", "question": "密码忘了怎么办？", "must_contain": "自助门户", "should_refuse": False},
    {"id": "c4", "question": "公司几点下班？", "must_contain": "", "should_refuse": True},
    {"id": "c5", "question": "年假和报销分别怎么算？", "must_contain": "30 天", "should_refuse": False},
]


class State(TypedDict):
    question: str
    answer: str
    trace: list[str]


def build(all_hits: bool, strict: bool = False):
    """三个版本的差别只有两处：用不用全部命中，和检索松不松。"""

    def respond(state: State) -> dict:
        question = state["question"]
        if strict:
            # 更严的检索：关键词必须出现在问题开头，减少误命中
            hits = [v for k, v in CORPUS.items() if question.startswith(k)]
        else:
            hits = [v for k, v in CORPUS.items() if k in question]
        trace = [f"检索命中 {len(hits)} 条"]
        if not hits:
            return {"answer": "知识库里没有找到相关内容。", "trace": trace + ["走拒绝分支"]}
        text = "；".join(hits) if all_hits else hits[0]
        return {"answer": text, "trace": trace + ["走回答分支"]}

    graph = StateGraph(State)
    graph.add_node("respond", respond)
    graph.add_edge(START, "respond")
    graph.add_edge("respond", END)
    return graph.compile()


def evaluate(app, label: str) -> dict:
    passed, failures = 0, []
    started = time.perf_counter()
    for case in DATASET:
        out = app.invoke({"question": case["question"], "answer": "", "trace": []})
        refused = "没有找到" in out["answer"]
        if case["should_refuse"]:
            ok = refused
        else:
            ok = not refused and case["must_contain"] in out["answer"]
        if ok:
            passed += 1
        else:
            failures.append({"id": case["id"], "q": case["question"],
                             "got": out["answer"], "trace": out["trace"]})
    elapsed = time.perf_counter() - started
    print(f"\n=== {label} ===")
    print(f"  通过 {passed}/{len(DATASET)}，耗时 {elapsed * 1000:.0f} ms")
    for failure in failures:
        print(f"  ✗ [{failure['id']}] {failure['q']}")
        print(f"      得到：{failure['got']}")
        print(f"      路径：{' → '.join(failure['trace'])}")
    return {"passed": passed, "failures": [f["id"] for f in failures]}


print("=== 数据集：5 个例子，其中 1 个期望「拒绝回答」 ===")
for case in DATASET:
    mark = "应拒绝" if case["should_refuse"] else f"应包含「{case['must_contain']}」"
    print(f"  [{case['id']}] {case['question']:22} {mark}")

v1 = evaluate(build(all_hits=False), "v1：只用第一条检索结果")
v2 = evaluate(build(all_hits=True), "v2：把命中的都带上")
v3 = evaluate(build(all_hits=True, strict=True), "v3：在 v2 基础上收紧检索")


def compare(before, after, label):
    fixed = sorted(set(before["failures"]) - set(after["failures"]))
    broke = sorted(set(after["failures"]) - set(before["failures"]))
    print(f"  {label}：{before['passed']}/5 → {after['passed']}/5"
          f"  修好 {fixed or '无'}  弄坏 {broke or '无'}")


print("\n=== 改动到底是变好还是变差 ===")
compare(v1, v2, "v1 → v2")
compare(v2, v3, "v2 → v3")
print("  ↑ v3 的动机是「减少误命中」，方向没错，但它把 c5 这种多关键词的问题弄坏了。")
print("     只看总分是 5/5 → 4/5；真正有用的信息是「弄坏了 c5」，它直接告诉你去看哪一条。")

print("\n=== 为什么期望要写成「必须包含」而不是标准答案 ===")
print("  标准答案：'年假从入职满一年起算，每年 10 天。'")
print("    模型换个说法就判失败，你会疲于更新期望，最后干脆不跑了。")
print("  必须包含：'10 天'")
print("    抓住这道题真正要考的事实，措辞自由。")
print("  拒绝类的例子只检查「有没有拒绝」，不检查措辞。")

print("\n=== 最小可行的可观测 ===")
print("  每次运行记下三样：走了哪些节点、每步花了多久、模型调用了几次。")
print("  上面每个失败例子都打印了 trace，所以能直接看出它走的是回答分支还是拒绝分支——")
print("  「答错了」和「本该拒绝却回答了」是两类完全不同的问题，修法也不同。")
