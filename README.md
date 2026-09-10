# Agent Engineering Handbook

> 帮普通人和小团队，用 AI Agent 做出真正能用的产品。

这是一个**内容生产仓库**：先以 Markdown 沉淀，再输出成博客 / 视频 / 电子书。

三个支柱：**AI 编程与 Agent** · **AI 做网站和数字产品** · **AI 接单与一人公司**。

内容按 **6 : 3 : 1** 组织——六成流量内容让人看到，三成项目实测让人相信，
一成系统深度沉淀成资产。核心产能模型是**一次真实实验派生七条内容**。

## 从这里开始

| 文档 | 作用 |
| --- | --- |
| [`docs/00-plan.md`](docs/00-plan.md) | **总计划 v2**：定位、三支柱、里程碑、产能模型、风险 |
| [`docs/07-content-strategy.md`](docs/07-content-strategy.md) | **内容策略**：6:3:1 配比、五个标题公式、一次实验七条内容、负面清单 |
| [`docs/01-sources.md`](docs/01-sources.md) | **资料源清单**：哪里拿最官方、最优秀的文档，以及如何持续追踪更新 |
| [`docs/02-visual-system.md`](docs/02-visual-system.md) | **配图体系**：图怎么选、用什么工具做、视觉规范与导出流程 |
| [`docs/03-writing-style.md`](docs/03-writing-style.md) | **写作规范**：结构、语气、术语表、代码与命令的呈现约定 |
| [`docs/04-outline.md`](docs/04-outline.md) | **选题大纲 v2**：10 个母实验，每个派生 7 条内容 |
| [`docs/05-creators.md`](docs/05-creators.md) | **创作者清单**：YouTube / Bilibili / X 各 10 位，附核实流程 |
| [`docs/06-video-workflow.md`](docs/06-video-workflow.md) | **视频工作流**：文章→脚本→录制→剪辑→分发的完整链路 |
| [`references/`](references/) | **官方文档本地镜像**（1300+ 页），`bash scripts/fetch-docs.sh` 一键重建 |
| [`templates/`](templates/) | 文章模板、视频脚本模板、图表模板、Checklist |
| [`lab/langgraph/`](lab/langgraph/) | **LangGraph 实验室**：23 个可跑示例，绝大多数无需 API Key |
| [`course-dev/conversation-log.md`](course-dev/conversation-log.md) | **学习对话记录**：问题、操作、验证、踩坑与下一步 |
| [`course-dev/30-lesson-curriculum-map.md`](course-dev/30-lesson-curriculum-map.md) | **30 课课程地图**：逐课标题、概念归属、外部来源和学习证据 |
| [`apps/web/`](apps/web/) | **Agent Hands-on Lab**：无需 API 的互动教学网站，可部署到 Vercel |
| [`content/lessons/`](content/lessons/) | **00–30 课程文稿**：从图与 State 一路到长期记忆与毕业项目 |

## 目录结构

```
.
├── docs/            # 方法论与计划（先写这里）
├── references/      # 官方文档本地镜像（脚本生成，可重建）
├── scripts/         # fetch-docs.sh 等工具脚本
├── posts/           # 正式文章（一篇一目录，含自己的图和视频脚本）
├── lab/             # 动手代码区（一个技术栈一个目录）
│   └── langgraph/   # LangGraph 23 个可跑示例 + 环境记录
├── apps/
│   └── web/         # Agent Hands-on Lab 互动教学网站
├── course-dev/      # 教程制作记录（对话、课程规划与交接）
├── content/lessons/ # 课程正文：00 总纲与 01–30 教学文章
├── templates/       # 文章 / 视频 / 图表 / 评审模板
└── assets/
    ├── diagrams/    # 图表源文件 (.mmd / .excalidraw / .d2) + 导出 (.svg/.png)
    └── covers/      # 封面图
```

## 常用命令

```bash
make docs       # 抓取/更新 references/ 官方文档镜像
make diagrams   # assets/diagrams/*.mmd -> .svg
make frames     # 竖屏切片帧 1080x1920
make clip       # 合成 60s 竖屏视频（需完整版 ffmpeg）
```

## 约定

- **源文件必须入库**：每张图都要能被后人改，`.mmd`/`.excalidraw`/`.d2` 与导出物一起提交。
- **SVG 优先，PNG 兜底**：SVG 用于网页，2x PNG 用于不支持 SVG 的平台。
- **可复现**：命令行演示用 [VHS](https://github.com/charmbracelet/vhs) 的 `.tape` 脚本生成，不手工录屏。
- **来源可溯**：任何「最佳实践」结论，要么给官方文档链接，要么标注为「个人经验」。

## 状态

**M0 基建已完成**：7 份方法论文档、模板、1300 页官方文档离线镜像、配图与视频工具链。

**Agent Hands-on Lab 课程**：
- 00–30 课正文全部完成（[`content/lessons/`](content/lessons/)）
- 23 个可实跑示例（[`lab/langgraph/`](lab/langgraph/)），需要模型的地方用
  [`_fake.py`](lab/langgraph/examples/_fake.py) 的脚本化模型，**绝大多数无需 API Key**
- 互动网站已实现第 00–03 课（[`apps/web/`](apps/web/)），可部署到 Vercel，
  Root Directory 填 `apps/web`

**下一步**：把网页互动实现推进到第 04 课及以后；母实验 A「用 AI 复刻网站并上线」。
