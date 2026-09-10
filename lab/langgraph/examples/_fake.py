"""无需 API Key 的脚本化模型，用于课程中的确定性实验。

课程规则是「文章里的确定数值必须来自可运行代码」，但第一阶段又不接真实模型 API。
两者的交集就是这个模型：你提前写好它每一轮返回什么，图的其余部分——节点、条件边、
ToolNode、checkpointer——全都是真的 LangGraph 在跑。

它不模拟智能。它只让「图怎样运转」这件事可以被反复验证。

    from _fake import ScriptedModel, ai, ai_tool_call

    model = ScriptedModel([
        ai_tool_call("add", {"a": 128, "b": 349}),
        ai("128 + 349 = 477。"),
    ])
"""

from __future__ import annotations

from typing import Any, Iterator, Sequence

from langchain_core.callbacks import CallbackManagerForLLMRun
from langchain_core.language_models import BaseChatModel
from langchain_core.messages import AIMessage, AIMessageChunk, BaseMessage
from langchain_core.outputs import ChatGeneration, ChatGenerationChunk, ChatResult


def ai(content: str) -> AIMessage:
    """一条普通的模型回答。"""
    return AIMessage(content=content)


def ai_tool_call(name: str, args: dict[str, Any], call_id: str | None = None) -> AIMessage:
    """一条只包含工具调用意图、没有正文的模型消息。"""
    return AIMessage(
        content="",
        tool_calls=[{"name": name, "args": args, "id": call_id or f"call_{name}"}],
    )


def ai_tool_calls(*calls: tuple[str, dict[str, Any]]) -> AIMessage:
    """一条同时提出多个工具调用的模型消息。"""
    return AIMessage(
        content="",
        tool_calls=[
            {"name": name, "args": args, "id": f"call_{name}_{index}"}
            for index, (name, args) in enumerate(calls)
        ],
    )


class ScriptedModel(BaseChatModel):
    """按剧本逐轮返回消息的假模型。

    script：第 n 次被调用时返回第 n 条消息。
    loop：剧本用完后是否从头再来；默认 False，用完再调用会直接报错，
          这样「图比预期多跑了一轮」会立刻暴露，而不是悄悄给出旧答案。
    """

    script: list[AIMessage]
    loop: bool = False
    calls: int = 0
    serial: int = 0
    bound_tools: list[str] = []

    @property
    def _llm_type(self) -> str:
        return "scripted"

    def bind_tools(self, tools: Sequence[Any], **kwargs: Any) -> "ScriptedModel":
        """记下工具名称。真实模型在这里拿到工具说明，这里只是为了能打印出来。"""
        names = [getattr(tool, "name", getattr(tool, "__name__", str(tool))) for tool in tools]
        return self.model_copy(update={"bound_tools": names})

    def _next(self) -> AIMessage:
        if self.calls >= len(self.script):
            if not self.loop:
                raise RuntimeError(
                    f"剧本只有 {len(self.script)} 条，但模型被调用了第 {self.calls + 1} 次。"
                    " 图比预期多跑了一轮，先检查条件边。"
                )
            self.calls = 0
        message = self.script[self.calls]
        self.calls += 1
        self.serial += 1
        # 每次都给一个新 id。add_messages 按 id 合并：把同一个消息对象重复交回去，
        # 会被当成「更新那条旧消息」而不是「追加一条新消息」。
        return message.model_copy(update={"id": f"scripted-{self.serial}"})

    def _generate(
        self,
        messages: list[BaseMessage],
        stop: list[str] | None = None,
        run_manager: CallbackManagerForLLMRun | None = None,
        **kwargs: Any,
    ) -> ChatResult:
        return ChatResult(generations=[ChatGeneration(message=self._next())])

    def _stream(
        self,
        messages: list[BaseMessage],
        stop: list[str] | None = None,
        run_manager: CallbackManagerForLLMRun | None = None,
        **kwargs: Any,
    ) -> Iterator[ChatGenerationChunk]:
        """逐字吐出正文，用来观察 streaming；工具调用不切片，一次给出。"""
        message = self._next()
        if message.tool_calls:
            yield ChatGenerationChunk(
                message=AIMessageChunk(content="", tool_calls=message.tool_calls)
            )
            return
        text = str(message.content)
        for char in text:
            yield ChatGenerationChunk(message=AIMessageChunk(content=char))
