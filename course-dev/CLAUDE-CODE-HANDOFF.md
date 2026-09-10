# Agent Hands-on Lab｜Claude Code 续开发交接

> 更新时间：2026-09-10  
> 当前阶段：轻量互动课程 MVP  
> 部署目标：Vercel，Root Directory 为 `apps/web`

## 1. 产品定位

Agent Hands-on Lab 是一套面向中文初学者的 LangGraph 互动课程。每课采用“读、动、改、证”结构：

1. 用短文章回答一个明确问题。
2. 通过流程图或状态动画观察 Agent 每一步发生什么。
3. 修改一个参数或选择一条路线。
4. 用可检查结果证明已经理解。

产品路线已经确定：

```text
无 API 的流程动画
  → /api/agent 运行真实 Python LangGraph
  → 调用限额与成本保护
  → 账号、数据库和长期记忆
```

第 00 课是前言，不计入正式 01–30 课。

## 2. 当前已经完成

### 课程文稿

- `content/lessons/00-preface-and-setup.md`
- `content/lessons/01-graph-and-state.md`
- `content/lessons/02-tool-loop.md`
- `content/lessons/03-memory-and-threads.md`
- `content/lessons/04-human-in-the-loop.md`
- `content/lessons/05-complete-agent-blueprint.md`

00–05 已有 Markdown 初稿。第 01–30 课的完整标题、来源映射、唯一主概念和学习者证据见：

- `course-dev/30-lesson-curriculum-map.md`

### 网站

- Next.js 16 + React 19，包管理器为 pnpm。
- 首页展示“00 前言 + 01–30 正式课程”的完整目录。
- 第 00、01、02 课拥有独立静态页面。
- 第 00 课包含 LangGraph 导读、五步流程预演、网页/本地双轨步骤器和命令复制。
- 第 01 课包含 State、Node、Edge、Reducer 的单步图实验和阈值挑战。
- 第 02 课包含 model、tools、MessagesState 的工具循环和 Edge 选择挑战。
- 完成状态使用浏览器 `localStorage`，当前没有账号和数据库。

### 术语解释

Markdown 原稿使用段后引用块；网站使用渐进式术语浮层：

- 关键词带虚线下划线。
- 支持鼠标悬停、键盘聚焦和手机点击。
- 支持 Escape 和失焦关闭。
- 触发词使用按钮语义与 `aria-describedby`，解释使用 `role="tooltip"`。

组件：`apps/web/src/components/term.tsx`。

### Python 实验

真实示例位于 `lab/langgraph/examples/`：

- `01_hello_graph.py`
- `02_tool_agent.py`
- `03_memory.py`
- `04_human_in_loop.py`

课程事实与网页确定性结果必须以这些脚本和当前 LangGraph 官方语义为准。

## 3. 当前验证状态

在 `apps/web` 中：

```powershell
pnpm lint
pnpm build
```

两项均通过。生产构建会生成：

```text
/
/lessons/00-preface-and-setup
/lessons/01-graph-and-state
/lessons/02-tool-loop
```

浏览器已经验证：

- 首页进入第 00 课。
- 术语点击显示、Escape 关闭。
- 第 00 课五步流程运行完成。
- 网页/本地路径切换正常。
- 第 01 课执行 `plan` 后，`count` 从 0 更新为 1，日志新增一项。
- 第 02 课执行 model 后，MessagesState 从 1 条变为 2 条并出现 tool call。
- 390 × 844 手机宽度没有整页横向溢出，术语浮层没有越出屏幕。

## 4. 重要文件

```text
apps/web/src/app/page.tsx                       首页与课程目录
apps/web/src/app/lessons/[slug]/page.tsx        课程路由、分页、元数据
apps/web/src/app/globals.css                    全站视觉与响应式样式
apps/web/src/lib/course.ts                      00–30 课程元数据
apps/web/src/components/term.tsx                术语浮层
apps/web/src/components/lesson-zero-*.tsx       第 00 课
apps/web/src/components/lesson-one-*.tsx        第 01 课
apps/web/src/components/lesson-two-*.tsx        第 02 课
course-dev/interactive-course-plan.md           课程实验契约与开发规则
course-dev/30-lesson-curriculum-map.md           30 课来源与课程地图
course-dev/conversation-log.md                  产品决策与对话记录
```

## 5. 开发约束

继续开发前先阅读：

1. 仓库根目录和 `apps/web/AGENTS.md`。
2. `course-dev/interactive-course-plan.md`。
3. `course-dev/30-lesson-curriculum-map.md`。
4. 对应课程 Markdown 与 Python 示例。

必须保持：

- 00 是前言，正式课程仍为 01–30。
- 每课只有一个主概念，不重复完整教授其他课内容。
- 第一阶段不加入模型 API、账号、数据库、支付、云端终端或任意 Python 执行。
- 不把模型 API Key 放进浏览器代码。
- 不伪造未真实运行的模型输出。
- 交互实验必须有固定输入、操作、预期输出和通过条件。
- 网站修改后至少运行 `pnpm lint` 和 `pnpm build`。

## 6. 推荐的下一项任务

下一步建议开发第 03 课“Thread、Checkpoint 与会话记忆”，暂时仍使用无 API 的确定性动画。

建议顺序：

1. 阅读 `content/lessons/03-memory-and-threads.md`。
2. 阅读 `lab/langgraph/examples/03_memory.py`。
3. 在 `interactive-course-plan.md` 中复核第 03 课实验契约；缺少时先补契约。
4. 新建 `lesson-three-article.tsx`、`lesson-three-lab.tsx` 和必要的 `lib/lesson-three.ts`。
5. 互动实验至少允许切换两个 `thread_id`，观察“同一个 thread 记得，换一个 thread 忘记”。
6. 显示 checkpoint 数量和恢复前后的 State，不把 checkpoint 错写成长期记忆。
7. 将课程 03 状态从 `next` 改为 `open`，配置 slug，并接入课程路由映射。
8. 将本课首次术语接入 `Term` 组件。
9. 更新 `conversation-log.md` 与本交接文档。
10. 运行 lint、build，并测试桌面和 390px 手机宽度。

## 7. 可直接交给 Claude Code 的提示词

```text
请继续开发 Agent Hands-on Lab。

先完整阅读根目录和 apps/web/AGENTS.md，再阅读：
- course-dev/CLAUDE-CODE-HANDOFF.md
- course-dev/interactive-course-plan.md
- course-dev/30-lesson-curriculum-map.md
- content/lessons/03-memory-and-threads.md
- lab/langgraph/examples/03_memory.py

本轮只开发第 03 课“Thread、Checkpoint 与会话记忆”，不要接入真实模型 API、账号或数据库。保持现有“读、动、改、证”的教学模式和视觉风格，复用 Term 术语组件。互动动画要让用户切换两个 thread_id，直观看到同 thread 恢复、不同 thread 隔离，并显示 checkpoint 与 State 的变化。

完成后更新课程元数据、分页、课程计划、对话记录和本交接文档。运行 pnpm lint、pnpm build，并测试桌面及 390px 手机布局。不要修改与本任务无关的用户文件。
```

## 8. 本地启动

```powershell
Set-Location -LiteralPath 'D:\Projects\AIagent\Agent-Engineering-Handbook\apps\web'
pnpm install
pnpm dev
```

浏览器打开：<http://localhost:3000>。

如果端口 3000 已有该项目的开发服务器，不要再启动第二个实例，直接使用已有地址。
