"""一个按剧本回话的假模型。

用它是为了让手写循环那一讲**零成本可跑**：不用钥匙、不花钱、每次结果一样。

它对外的样子和真模型一致——都有 `invoke(messages)`，
都返回一条带 `tool_calls` 或带 `content` 的 AI 消息。
所以循环代码原封不动，把假模型换成真模型只改一行。
"""

from langchain_core.messages import AIMessage


class FakeToolCallingModel:
    """按剧本依次回话。

    剧本里每一项要么是 ("tool", 工具名, 参数字典)，要么是 ("final", 一段话)。
    """

    def __init__(self, script: list[tuple]):
        self.script = script
        self.turn = 0

    def invoke(self, messages: list) -> AIMessage:
        item = self.script[min(self.turn, len(self.script) - 1)]
        self.turn += 1

        if item[0] == "tool":
            _, name, args = item
            return AIMessage(
                content="",
                tool_calls=[{"name": name, "args": args, "id": f"call_{self.turn}"}],
            )
        return AIMessage(content=item[1])
