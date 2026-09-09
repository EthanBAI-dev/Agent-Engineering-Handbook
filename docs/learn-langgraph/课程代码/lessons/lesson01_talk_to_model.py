"""第 01 讲 · 让代码跟大模型说上话。

需要钥匙。跑之前先设好（怎么设见 第 00 讲）：

    Windows:  $env:DEEPSEEK_API_KEY = "你的钥匙"
    Mac:      export DEEPSEEK_API_KEY="你的钥匙"

然后：

    python 课程代码/lessons/lesson01_talk_to_model.py
"""

import os
import sys

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

if not os.environ.get("DEEPSEEK_API_KEY"):
    sys.exit("没读到 DEEPSEEK_API_KEY。先设好钥匙，见 第 00 讲。")

from langchain_deepseek import ChatDeepSeek  # noqa: E402

# [正文] 全课唯一跟模型厂商有关的一行。换 OpenAI 就换这里
model = ChatDeepSeek(model="deepseek-chat", temperature=0)


def show(msg) -> None:
    print(f"  类型：{type(msg).__name__}")
    print(f"  内容：{msg.content}")


print("=" * 60)
print("把下面全部内容复制回来")
print("=" * 60)

# [正文] 实验一：直接丢一句话进去
print("\n== 实验一：直接问一句 ==")
reply = model.invoke("用一句话说明什么是 Python 的列表。")
show(reply)

# [正文] 实验二：改用消息列表，效果一样
print("\n== 实验二：把同一句话包成消息 ==")
reply = model.invoke([HumanMessage(content="用一句话说明什么是 Python 的列表。")])
show(reply)

# [正文] 实验三：加一条系统设定，回话风格就变了
print("\n== 实验三：同一个问题，加一条系统设定 ==")
reply = model.invoke(
    [
        SystemMessage(content="你只能用不超过 15 个字回答，不许举例。"),
        HumanMessage(content="用一句话说明什么是 Python 的列表。"),
    ]
)
show(reply)

# [正文] 实验四：模型不记得上一句
print("\n== 实验四：分两次问，它记得吗 ==")
first = model.invoke([HumanMessage(content="我叫小白，记住我的名字。")])
print("第一次问：我叫小白，记住我的名字。")
print(f"  它答：{first.content}")

second = model.invoke([HumanMessage(content="我叫什么名字？")])
print("第二次问（新开一次调用）：我叫什么名字？")
print(f"  它答：{second.content}")

# [正文] 实验五：把上一轮的话一起带上，它就“记得”了
print("\n== 实验五：把前两句一起送进去 ==")
third = model.invoke(
    [
        HumanMessage(content="我叫小白，记住我的名字。"),
        AIMessage(content=first.content),
        HumanMessage(content="我叫什么名字？"),
    ]
)
print(f"  它答：{third.content}")

# [脚本额外] 这次一共问了几次、花了多少词元
print("\n[脚本额外] 最后一次调用的用量：")
print(f"  {getattr(third, 'usage_metadata', None)}")

print("\n" + "=" * 60)
print("复制到这里为止")
print("=" * 60)
