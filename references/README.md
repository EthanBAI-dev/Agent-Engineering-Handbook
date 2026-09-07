# references/ —— 官方文档本地镜像

用 [`scripts/fetch-docs.sh`](../scripts/fetch-docs.sh) 抓取，**可一键重建**：

```bash
bash scripts/fetch-docs.sh          # 全量
bash scripts/fetch-docs.sh claude   # 只更新 Claude Code 文档
bash scripts/fetch-docs.sh platform # 只更新 Claude 平台文档
bash scripts/fetch-docs.sh repos    # 只更新 GitHub 仓库文档
```

## 当前镜像

| 目录 | 来源 | 内容 | 页数/文件数 |
| --- | --- | --- | --- |
| `anthropic-claude-code/` | `code.claude.com/docs` | Claude Code 全量官方文档 | 202 页 |
| `anthropic-platform/` | `docs.claude.com` → `platform.claude.com` | 平台文档（已剔除逐接口 API 参考） | 240 页 |
| `openai-codex/` | `github.com/openai/codex` | Codex 官方 `docs/` + README + CHANGELOG | 15 篇 |
| `google-gemini-cli/` | `github.com/google-gemini/gemini-cli` | Gemini CLI 官方 `docs/` | 124 篇 |
| `mcp-spec/` | `github.com/modelcontextprotocol/modelcontextprotocol` | MCP 规范、schema、SEP 提案 | 440 篇 |
| `openai-agents-sdk/` | `github.com/openai/openai-agents-python` | Agents SDK 文档 | 408 篇 |
| `agents-md/` | `github.com/openai/agents.md` | AGENTS.md 约定 | — |

每个目录下的 `_MANIFEST.md` 记录了**来源 URL、commit SHA、抓取时间**。

## 抓取范围说明

- Mintlify 站点（Anthropic 两站）通过 `llms.txt` 索引 + 每页 `.md` 端点抓取，拿到的是**纯 Markdown 原文**，不是 HTML。
- GitHub 仓库用 `--depth 1 --filter=blob:none --sparse` 只拉文档目录，不拉源码和历史。
- 抓完会**删除图片、字体、锁文件**（`prune_binaries`），镜像只保留文本 —— 它是给人和 Agent 检索用的，不是给浏览器渲染的。
- 平台文档排除了 `docs/en/api/` 下 459 个逐接口参考页：体积大、对本专题价值低，需要时直接查在线版。

## 未能抓取的源

以下站点被本环境的出站网络策略拦截（HTTP 403），**不是抓取脚本的问题**，在没有此限制的机器上跑同一个脚本即可：

- `anthropic.com/engineering`（Anthropic 工程博客 —— `docs/01-sources.md` 里的必读长文都在这）
- `developers.openai.com/codex`、`platform.openai.com/docs`
- `modelcontextprotocol.io`（但规范源仓库已镜像在 `mcp-spec/`，内容等价且更新更快）
- `ai.google.dev`、`docs.cursor.com`、`aider.chat`

> 想补齐的话，在本地机器上执行 `bash scripts/fetch-docs.sh`，再把 `references/` 提交上来即可。

## 怎么用这份镜像

1. **全文检索**比翻网页快得多：
   ```bash
   rg -n "compact|context window" references/anthropic-claude-code --type md
   rg -l "sandbox" references/openai-codex references/google-gemini-cli
   ```
2. **让 Agent 读本地文件**而不是联网搜索 —— 结果稳定、可引用、不受网络限制。
3. **对比不同工具的同一概念**（例如三家怎么定义「审批模式」），这是本专题很多选题的来源。
4. **追踪变更**：定期重跑脚本，`git diff references/` 就是官方文档的变更日志。

## 版权

镜像内容的著作权归各自权利人（Anthropic、OpenAI、Google、MCP 项目等）所有，
此处仅为**离线阅读与检索**保留副本，未作修改（除删除二进制资源外）。
各 GitHub 仓库的许可证随镜像一并保留在对应目录下。

⚠️ 如果本仓库要公开发布，请先确认各来源的条款是否允许再分发；
不确定就把 `references/` 加进 `.gitignore`，只保留 `scripts/fetch-docs.sh`，
让读者自己一键重建。
