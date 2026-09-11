# Agent Engineering Handbook

> 一套面向中文初学者的 **Agent 互动教学网站**：读一段，动一步，真正看懂 Agent 怎么运行。

课程用 LangGraph 讲清楚 Agent 的运行机制，30 课从「图与 State」一路到「长期记忆与毕业项目」。
每一课都有一个**可以自己动手的互动实验**，以及一份**能在本地真跑起来的 Python 代码**。

课程里的每个确定数值都来自实跑，不是写出来看着合理的。第一阶段不接模型 API：
需要模型的地方用脚本化假模型，图的其余部分是真的 LangGraph 在跑。

## 项目主体

| 目录 | 作用 |
| --- | --- |
| [`apps/web/`](apps/web/) | **教学网站**（Next.js）。部署到 Vercel，Root Directory 填 `apps/web` |
| [`content/lessons/`](content/lessons/) | **课程正文** 00–30，Markdown 是内容的唯一来源 |
| [`lab/langgraph/`](lab/langgraph/) | **可实跑实验** 23 个，课程的事实来源，绝大多数无需 API Key |
| [`course-dev/`](course-dev/) | 课程制作：课程地图、实验契约、开发交接、对话记录 |

## 支撑材料

| 目录 | 作用 |
| --- | --- |
| [`docs/01-sources.md`](docs/01-sources.md) | 资料源清单：官方文档在哪、怎么持续追踪 |
| [`docs/02-visual-system.md`](docs/02-visual-system.md) | 视觉规范：图怎么选、用什么做、导出流程 |
| [`docs/03-writing-style.md`](docs/03-writing-style.md) | 写作规范：结构、语气、术语与代码的呈现约定 |
| [`docs/04-figure-and-ui-spec.md`](docs/04-figure-and-ui-spec.md) | **配图与互动 UI 规范**：正文里怎么写图和交互的需求 |
| [`assets/lessons/`](assets/lessons/) | 课程配图（源文件与导出一起入库） |
| [`references/`](references/) | 官方文档本地镜像，`make docs` 一键重建 |
| [`templates/`](templates/) | 图表起手式、评审 Checklist |
| [`archive/`](archive/) | 早期「内容生产仓库」时期的博客与视频产物，保留备查 |

## 目录结构

```
.
├── apps/web/          教学网站（项目主体）
├── content/lessons/   课程正文 00–30
├── lab/langgraph/     可实跑实验 + 环境说明
├── course-dev/        课程制作记录与开发交接
├── docs/              资料源、视觉、写作、配图与交互规范
├── assets/
│   ├── lessons/       课程配图（.mmd/.excalidraw 源 + .svg 导出）
│   └── diagrams/      通用图与渲染配置
├── references/        官方文档本地镜像（脚本生成，可重建）
├── scripts/           fetch-docs.sh / render-diagrams.sh
├── templates/         图表起手式、评审 Checklist
└── archive/           早期博客与视频时期的产物
```

## 常用命令

```bash
make web        # 本地启动教学网站
make diagrams   # assets/**/*.mmd -> .svg
make docs       # 抓取/更新 references/ 官方文档镜像

cd lab/langgraph && uv run python examples/01_hello_graph.py   # 跑第一个实验
```

## 约定

- **课程事实来自实跑**：文章里的确定数值必须能在 `lab/langgraph/` 里复现，跑不出来就标「未验证」。
- **源文件必须入库**：每张图都要能被后人改，`.mmd`/`.excalidraw` 与导出物一起提交。
- **术语每次出现都有提示**：解释集中在 `apps/web/src/lib/glossary.ts`，正文自动标注。
- **来源可溯**：任何「最佳实践」结论，要么给官方文档链接，要么标注为「个人经验」。

## 状态

**课程正文**：00–30 全部完成初稿。
**可实跑实验**：23 个，覆盖 01、04、06、09–30；02、03 需要真实 API Key。
**互动网站**：第 00–04 课已实现，其余课程按顺序推进。
**精简版与完整版**：00–03 两版都有（精简版免费、完整版为付费方向，收费尚未实现）。

下一步见 [`course-dev/CLAUDE-CODE-HANDOFF.md`](course-dev/CLAUDE-CODE-HANDOFF.md)。
