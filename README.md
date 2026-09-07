# Agent Engineering Handbook

> AI Agent 使用与工程化手册 —— 面向 Claude Code / Codex / Gemini CLI 等编码 Agent 的实战技巧专题。

这是一个**博文专题的写作仓库**：先以 Markdown 沉淀内容，再输出成博客 / 电子书 / 分享稿。
仓库同时收录「官方一手资料索引」和「配图方法论」，让每篇文章都有据可查、有图可看。

## 从这里开始

| 文档 | 作用 |
| --- | --- |
| [`docs/00-plan.md`](docs/00-plan.md) | **专题总计划**：定位、栏目、里程碑、节奏、质量门禁、度量 |
| [`docs/01-sources.md`](docs/01-sources.md) | **资料源清单**：哪里拿最官方、最优秀的文档，以及如何持续追踪更新 |
| [`docs/02-visual-system.md`](docs/02-visual-system.md) | **配图体系**：图怎么选、用什么工具做、视觉规范与导出流程 |
| [`docs/03-writing-style.md`](docs/03-writing-style.md) | **写作规范**：结构、语气、术语表、代码与命令的呈现约定 |
| [`docs/04-outline.md`](docs/04-outline.md) | **选题大纲**：5 个模块、24 篇文章的排期表 |
| [`docs/05-creators.md`](docs/05-creators.md) | **创作者清单**：YouTube / Bilibili / X 各 10 位，附核实流程 |
| [`docs/06-video-workflow.md`](docs/06-video-workflow.md) | **视频工作流**：文章→脚本→录制→剪辑→分发的完整链路 |
| [`references/`](references/) | **官方文档本地镜像**（1300+ 页），`bash scripts/fetch-docs.sh` 一键重建 |
| [`templates/`](templates/) | 文章模板、视频脚本模板、图表模板、Checklist |

## 目录结构

```
.
├── docs/            # 方法论与计划（先写这里）
├── references/      # 官方文档本地镜像（脚本生成，可重建）
├── scripts/         # fetch-docs.sh 等工具脚本
├── posts/           # 正式文章（一篇一目录，含自己的图和视频脚本）
├── templates/       # 文章 / 视频 / 图表 / 评审模板
└── assets/
    ├── diagrams/    # 图表源文件 (.mmd / .excalidraw / .d2) + 导出 (.svg/.png)
    └── covers/      # 封面图
```

## 约定

- **源文件必须入库**：每张图都要能被后人改，`.mmd`/`.excalidraw`/`.d2` 与导出物一起提交。
- **SVG 优先，PNG 兜底**：SVG 用于网页，2x PNG 用于不支持 SVG 的平台。
- **可复现**：命令行演示用 [VHS](https://github.com/charmbracelet/vhs) 的 `.tape` 脚本生成，不手工录屏。
- **来源可溯**：任何「最佳实践」结论，要么给官方文档链接，要么标注为「个人经验」。

## 状态

🚧 筹备中 —— 当前处于 M0 阶段（见 [`docs/00-plan.md`](docs/00-plan.md) 里程碑表）。
