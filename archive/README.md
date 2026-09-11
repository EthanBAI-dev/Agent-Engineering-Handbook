# archive · 早期「内容生产仓库」时期的产物

这个仓库最初是一个**内容生产仓库**：写博客、做竖屏视频、沉淀选题方法论。
后来重心转向 **Agent 教学网站**（`apps/web` + `content/lessons` + `lab/langgraph`），
这批文件不再参与日常开发，但记录了当时的判断，保留备查。

| 目录 | 是什么 | 还有什么用 |
| --- | --- | --- |
| `posts/01-agent-loop/` | 第一篇正式文章，含深度版与 60 秒竖屏脚本 | 中文技术写作的语气样本 |
| `assets/diagrams/` | 上面那篇文章的配图源文件、导出与视频帧 | `.mmd` 写法可参考 |
| `docs/00-plan.md` | 三支柱定位与里程碑 | 项目为什么会长成现在这样 |
| `docs/04-outline.md` | 10 个母实验的选题大纲 | 未来做内容分发时可回看 |
| `docs/05-creators.md` | 创作者清单与核实流程 | 同上 |
| `docs/06-video-workflow.md` | 文章→脚本→录制→剪辑→分发 | 课程要做视频版时可复用 |
| `docs/07-content-strategy.md` | 6:3:1 配比与标题公式 | 同上 |
| `templates/` | 文章模板、视频脚本模板 | 同上 |
| `scripts/` | 视频帧渲染与合成脚本 | 需要 ffmpeg，未随课程维护 |

**仍在使用、没有归档的部分**：`docs/01-sources.md`（资料源）、`docs/02-visual-system.md`（视觉规范）、
`docs/03-writing-style.md`（写作规范）、`templates/diagram-starters.md`、`templates/review-checklist.md`、
`scripts/fetch-docs.sh`、`scripts/render-diagrams.sh`。

这里的东西不保证能跑通。要恢复其中任何一项，从 git 历史里取比直接用更稳妥。
