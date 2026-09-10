"""统一的模型入口。所有需要 LLM 的例子都从这里拿 model。"""

import os
import sys

from dotenv import load_dotenv

sys.stdout.reconfigure(encoding="utf-8")
load_dotenv()  # 读同目录往上的 .env


def get_model(**kwargs):
    if not os.getenv("ANTHROPIC_API_KEY"):
        raise SystemExit(
            "没有 ANTHROPIC_API_KEY。\n"
            "  1) cp .env.example .env\n"
            "  2) 填进去 key\n"
            "  3) 重跑"
        )
    from langchain_anthropic import ChatAnthropic

    return ChatAnthropic(model="claude-sonnet-5", temperature=0, **kwargs)
