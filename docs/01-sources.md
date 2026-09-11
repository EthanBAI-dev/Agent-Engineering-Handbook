# 资料源清单：去哪里拿最官方、最优秀的文档

> 最后更新：2026-09-07
> **本仓库的引用铁律**：结论优先引用 T1（一手官方），T2 用于补充视角，T3 只作为线索不作为论据。

## 📁 已有本地镜像

上述 T1/T2 中可抓取的部分**已镜像到 [`references/`](../references/)**（约 1300 页 Markdown），
用 `bash scripts/fetch-docs.sh` 可随时重建/更新。写作时优先本地检索：

```bash
rg -n "context window" references/anthropic-claude-code --type md
```

被网络策略拦截、尚未镜像的源（Anthropic 工程博客、OpenAI 官方文档站等）见
[`references/README.md`](../references/README.md) 的「未能抓取的源」。

## 分级标准

| 级别 | 含义 | 可信度 | 在文章里的用法 |
| --- | --- | --- | --- |
| **T1** | 厂商官方文档 / 官方博客 / 官方开源仓库 | 高，但会静默变更 | 直接引用，标注访问日期 |
| **T2** | 官方 Cookbook、规范标准、权威工程博客 | 高 | 引用方法论 |
| **T3** | 社区教程、博主、视频、awesome 列表 | 中 | 找选题灵感，结论需自验 |
| **T4** | 论文与基准测试 | 高但滞后 | 讲机制、给数据 |

---

## T1 · 厂商一手文档

### Anthropic / Claude

| 资源 | 地址 | 为什么值得看 |
| --- | --- | --- |
| Claude Code 官方文档 | `https://code.claude.com/docs` | **本专题最重要的单一来源**。设置、hooks、slash commands、MCP、SDK、IDE 集成全在这里 |
| Claude 平台文档 | `https://docs.claude.com` | 模型能力、prompt 工程、tool use、prompt caching、上下文管理 |
| Anthropic 工程博客 | `https://www.anthropic.com/engineering` | 质量最高的一批长文，见下方「必读清单」 |
| Claude Code 仓库（Issues / Changelog） | `https://github.com/anthropics/claude-code` | 看 CHANGELOG 和 Issue，能提前知道行为变更 |
| Anthropic Cookbook | `https://github.com/anthropics/claude-cookbooks` | 可运行的 notebook，讲 tool use、RAG、评估 |
| Claude Agent SDK 文档 | `https://code.claude.com/docs/en/sdk/sdk-overview` | 把 Claude Code 当 SDK 用，写自定义 Agent |

**Anthropic 工程博客必读清单**（写本专题前先全读一遍）：
- *Building effective agents* —— Agent vs Workflow 的分野，本专题模块 1 的理论底座
- *Claude Code best practices* —— 官方版实操指南，我们的文章要在它之上做增量
- *Effective context engineering for AI agents* —— 上下文即预算，模块 2 的核心
- *Writing effective tools for agents* —— MCP / 工具设计，模块 4 的底座
- *How we built our multi-agent research system* —— 多 Agent 编排的真实工程复盘

> 标题以官方站上的实际标题为准，写作时补全 URL 和访问日期。

### OpenAI / Codex

| 资源 | 地址 | 说明 |
| --- | --- | --- |
| Codex 开发者文档 | `https://developers.openai.com/codex/` | Codex CLI / IDE / 云端任务的官方入口 |
| `openai/codex` 仓库 | `https://github.com/openai/codex` | Rust 实现的 CLI，读源码是了解沙箱与审批机制最快的路 |
| OpenAI Platform 文档 | `https://platform.openai.com/docs` | 模型、Responses API、工具调用、结构化输出 |
| OpenAI Cookbook | `https://github.com/openai/openai-cookbook` | 可运行示例 |
| Agents SDK (Python / JS) | `https://openai.github.io/openai-agents-python/` | 编排、handoff、guardrails、tracing |

### Google / Gemini

| 资源 | 地址 | 说明 |
| --- | --- | --- |
| Gemini CLI | `https://github.com/google-gemini/gemini-cli` | 开源，文档在 `docs/` 目录里，比官网还全 |
| Gemini API 文档 | `https://ai.google.dev/gemini-api/docs` | 长上下文、function calling |

### 其他值得盯的编码 Agent

- **Cursor** —— `https://docs.cursor.com`（Rules、Agent 模式的设计值得对比）
- **GitHub Copilot** —— `https://docs.github.com/copilot`（企业侧的策略与合规部分很有料）
- **Aider** —— `https://aider.chat/docs/`（开源，repo map 的实现是很好的教学素材）
- **Cline / Roo Code** —— 开源 VS Code Agent，读源码看 prompt 设计
- **Devin / Windsurf / Amp** —— 关注其产品博客里的工程复盘

---

## T2 · 规范与标准

| 资源 | 地址 | 说明 |
| --- | --- | --- |
| **Model Context Protocol** | `https://modelcontextprotocol.io` | 规范 + SDK + 官方 server 示例。模块 4 的主干 |
| MCP 规范仓库 | `https://github.com/modelcontextprotocol` | 看 spec 的 PR 能提前知道协议演进 |
| **AGENTS.md** | `https://agents.md` | 跨工具的 Agent 指令文件约定，与 `CLAUDE.md` 的关系要讲清楚 |
| OpenAPI / JSON Schema | — | 写工具定义时的基础功 |

---

## T3 · 社区与人（选题灵感来源）

- **Awesome 列表**：`awesome-claude-code`、`awesome-mcp-servers`、`awesome-ai-agents`
- **个人博客**：Simon Willison（`simonwillison.net`，追工具变更最快最准）、Hamel Husain（评估）、Eugene Yan（LLM 系统设计）、Chip Huyen（AI 工程）
- **Newsletter / 播客**：Latent Space、The Pragmatic Engineer、Interconnects
- **中文**：宝玉（`baoyu.io`，官方文档与长文的高质量翻译）、各厂中文技术公众号
- **视频创作者**：见 [`05-creators.md`](../archive/docs/05-creators.md)
- **论坛**：Hacker News、r/ClaudeAI、r/LocalLLaMA、各工具的 Discord

> ⚠️ T3 的所有结论都要自己复现一遍才能写进文章。社区里过期和以讹传讹的内容非常多。

---

## T4 · 论文与基准

| 资源 | 说明 |
| --- | --- |
| **SWE-bench / SWE-bench Verified** | 编码 Agent 的事实标准基准，理解它的构造才看得懂厂商宣传 |
| **Terminal-Bench** | 终端环境下的 Agent 能力评测 |
| **τ-bench** | 工具使用 + 多轮对话的评测 |
| arXiv `cs.SE` + `cs.AI` | 关键词：`LLM agent`、`code agent`、`tool use`、`context` |
| Papers with Code / Hugging Face Papers | 追热度 |

---

## 如何持续追踪（不靠刷推）

1. **GitHub Watch → Releases only**：`anthropics/claude-code`、`openai/codex`、`google-gemini/gemini-cli`、`modelcontextprotocol/*`。只订阅 release，噪音最低。
2. **CHANGELOG 优先于博客**：产品博客滞后，CHANGELOG 是最快的一手信号。
3. **文档 diff**：官方文档站多数由 GitHub 仓库驱动，订阅文档仓库的 commit 就能看到「悄悄改了什么」。文档站没开源的，用 `changedetection.io` 之类的工具盯关键页面。
4. **RSS 聚合**：博客 + arXiv 关键词 + GitHub releases atom feed（`https://github.com/<owner>/<repo>/releases.atom`）统一进阅读器。
5. **季度复检**：每季度用本清单跑一遍，更新已发文章头部的「适用版本」标注。

---

## 引用规范（写文章时照做）

```markdown
> 官方说法：Claude Code 的 `CLAUDE.md` 会在会话开始时自动加载。
> —— [Claude Code Docs · Memory](https://code.claude.com/docs/en/memory)（访问于 2026-09-07，CLI v2.x）
```

- 链接一律指向**具体页面锚点**，不要指向站点首页。
- 标注**访问日期**和**验证时使用的版本号**。
- 引用官方原话用引用块；转述则明确写「据官方文档」。
- 自己的经验结论，明确标注「个人实测」，不要伪装成官方立场。
- 视频/推文类来源，同时记录标题与作者，防止链接失效后无法追溯。
