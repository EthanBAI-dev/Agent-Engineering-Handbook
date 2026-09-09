"""第 05 讲 · 不用任何图框架，手写一个 agent 循环。

不需要钥匙，纯本地运行：

    python 课程代码/lessons/lesson05_hand_written_agent.py
"""

import pathlib
import sys

from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
from lgkit.fake_model import FakeToolCallingModel  # noqa: E402


# [正文] 三个工具，就是三个普通函数
def add(a: float, b: float) -> float:
    return a + b


def multiply(a: float, b: float) -> float:
    return a * b


def divide(a: float, b: float) -> float:
    return a / b


def lookup(city: str) -> str:
    """模拟真实工具：查一次资料就返回一大坨文字。"""
    line = f"{city}：条目记录，含地理、人口、气候、交通、历史沿革等字段。"
    return "".join(line for _ in range(20))


TOOLS = {"add": add, "multiply": multiply, "divide": divide, "lookup": lookup}


# [正文] 整个 agent 就是这个循环
def run_agent(model, question: str, verbose: bool = True) -> list:
    messages = [
        SystemMessage(content="你是一个只会做算术的助手。"),
        HumanMessage(content=question),
    ]

    while True:
        ai = model.invoke(messages)          # ① 把当前对话交给模型
        messages.append(ai)                  # ② 把模型这句话记下来

        if not ai.tool_calls:                # ③ 没要调工具，说明它给出答案了
            if verbose:
                print(f"[模型给出答案] {ai.content}")
            return messages

        for call in ai.tool_calls:           # ④ 它要调工具，那就由你的代码去调
            result = TOOLS[call["name"]](**call["args"])
            if verbose:
                print(f"[调用工具] {call['name']}({call['args']}) -> {result}")
            messages.append(                 # ⑤ 把结果塞回对话，回到 ①
                ToolMessage(content=str(result), tool_call_id=call["id"])
            )


# 剧本：3 加 4，乘以 2，再除以 5
SCRIPT = [
    ("tool", "add", {"a": 3, "b": 4}),
    ("tool", "multiply", {"a": 7, "b": 2}),
    ("tool", "divide", {"a": 14, "b": 5}),
    ("final", "结果是 2.8。"),
]

QUESTION = "先算 3 加 4，再把结果乘以 2，最后除以 5。"


if __name__ == "__main__":
    # [正文] 实验一：循环跑通
    print("== 实验一：这个循环能连续调三次工具 ==")
    final = run_agent(FakeToolCallingModel(SCRIPT), QUESTION)
    print(f"对话总条数：{len(final)}")

    # [正文] 实验二：天花板① 上下文只会变长，没人管
    print("\n== 实验二：工具返回一大坨时，对话是怎么涨的 ==")
    lookup_script = [
        ("tool", "lookup", {"city": "北京"}),
        ("tool", "lookup", {"city": "上海"}),
        ("tool", "lookup", {"city": "广州"}),
        ("final", "三个城市都查到了。"),
    ]
    model = FakeToolCallingModel(lookup_script)
    messages = [
        SystemMessage(content="你是一个查资料的助手。"),
        HumanMessage(content="帮我查北京、上海、广州三个城市。"),
    ]
    rnd = 0
    while True:
        rnd += 1
        chars = sum(len(str(m.content)) for m in messages)
        print(f"第 {rnd} 轮送进模型：{len(messages)} 条消息，{chars} 个字")
        ai = model.invoke(messages)
        messages.append(ai)
        if not ai.tool_calls:
            break
        for call in ai.tool_calls:
            messages.append(
                ToolMessage(
                    content=str(TOOLS[call["name"]](**call["args"])),
                    tool_call_id=call["id"],
                )
            )

    # [正文] 实验三：天花板② 崩在半路，前面全白跑
    print("\n== 实验三：第三个工具报错，前面两次白跑 ==")

    def broken_divide(a: float, b: float) -> float:
        raise RuntimeError("除法服务连不上")

    TOOLS["divide"] = broken_divide
    try:
        run_agent(FakeToolCallingModel(SCRIPT), QUESTION)
    except RuntimeError as e:
        print(f"[崩了] {e}")
        print("前面 add 和 multiply 的结果都在内存里，进程一退就没了，只能从头再来。")
    TOOLS["divide"] = divide

    # [脚本额外] 这个循环到底有多短
    import inspect

    body = [
        ln for ln in inspect.getsource(run_agent).splitlines()
        if ln.strip() and not ln.strip().startswith("#")
    ]
    print(f"\n[脚本额外] run_agent 去掉空行和注释后共 {len(body)} 行")
