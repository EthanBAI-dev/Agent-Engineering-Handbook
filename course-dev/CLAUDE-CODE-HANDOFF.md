# Agent Hands-on Lab｜Claude Code 续开发交接

> 更新时间：2026-09-10（第 04 课已上线）  
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
- 第 00–04 课拥有独立静态页面。
- 第 00 课包含 LangGraph 导读、五步流程预演、网页/本地双轨步骤器和命令复制。
- 第 01 课包含 State、Node、Edge、Reducer 的单步图实验和阈值挑战。
- 第 02 课包含 model、tools、MessagesState 的工具循环和 Edge 选择挑战。
- 第 03 课包含双列 thread 对照、checkpoint 版本、`get_state` 快照，以及“把三条消息分配到正确 thread”的挑战。
- 第 04 课包含暂停流程条、`__interrupt__` 载荷、四个执行次数计数器，以及“批准一条、拒绝一条”的挑战。
- 术语提示已改为**每一次出现都给**，由 `lib/glossary.ts` 与 `components/auto-term.tsx` 自动标注。
- 第 01、04 课正文已按 Markdown 加厚；00–03 的精简版保留在 `components/variants/`，
  可通过 `/lessons/<slug>/brief` 对照阅读。
- 完成状态使用浏览器 `localStorage`，当前没有账号和数据库。

### 术语解释

Markdown 原稿使用段后引用块；网站使用渐进式术语浮层：

- 关键词带虚线下划线。
- 支持鼠标悬停、键盘聚焦和手机点击。
- 支持 Escape 和失焦关闭。
- 触发词使用按钮语义与 `aria-describedby`，解释使用 `role="tooltip"`。

组件：`apps/web/src/components/term.tsx`，已覆盖第 00–03 课。

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
/lessons/03-memory-and-threads
/lessons/04-human-in-the-loop
```

浏览器已经验证：

- 首页进入第 00 课。
- 术语点击显示、Escape 关闭。
- 第 00 课五步流程运行完成。
- 网页/本地路径切换正常。
- 第 01 课执行 `plan` 后，`count` 从 0 更新为 1，日志新增一项。
- 第 02 课执行 model 后，MessagesState 从 1 条变为 2 条并出现 tool call。
- 第 03 课按 a / b / a 分配后，thread a 为 4 条消息、checkpoint v2，`get_state` 读数一致，挑战判定通过。
- 第 03 课三条都放进同一个 thread 时，最后一次提问会同时看到名字和咖啡；放进没有名字的 thread 时答不出名字。
- 第 04 课暂停时 `next = (approval,)`；恢复后 propose 1 次、interrupt 之前 2 次、之后 1 次，
  与 `04_human_in_loop.py` 实测一致；副作用在前累计 2 次、在后 1 次。
- 00–04 五条课页在 1440px 与 390px 下横向溢出均为 0px，术语浮层不越界（窄屏改为底部浮条）。

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
apps/web/src/components/lesson-three-*.tsx      第 03 课
apps/web/src/components/lesson-four-*.tsx       第 04 课
apps/web/src/lib/lesson-four.ts                 第 04 课确定性运行逻辑
apps/web/src/lib/glossary.ts                    全站术语表
apps/web/src/components/auto-term.tsx           术语自动标注
apps/web/src/components/article-kit.tsx         正文构件（代码块/清单/误区等）
apps/web/src/lib/lesson-three.ts                第 03 课确定性运行逻辑
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

下一步建议开发第 05 课“完整 Agent 蓝图”。它是编辑综合课，不引入新的 LangGraph API。

建议顺序：

1. 阅读 `content/lessons/05-complete-agent-blueprint.md`。
2. 在 `interactive-course-plan.md` 中补写第 05 课简报、实验契约与教学图说明。
3. 新建 `lesson-five-article.tsx`、`lesson-five-lab.tsx` 和 `lib/lesson-five.ts`。
4. 互动实验按课程地图的设定做“组件卡片排序”：给出打乱的节点卡片，
   让学习者排出执行路径，并标出必须审批的删除动作。
5. 验收要点：蓝图包含 `model ⇄ tools`、同一个 `thread_id`、checkpointer、
   删除前 approval，以及拒绝后的安全结束路径。
6. 正文按新标准写（`Prose` + `article-kit`），不要再写精简版。
7. 将课程 05 状态从 `next` 改为 `open`，配置 slug，并接入课程路由映射。
8. 更新 `conversation-log.md` 与本交接文档。
9. 运行 lint、build，并测试桌面和 390px 手机宽度。

## 7. 可直接交给 Claude Code 的提示词

```text
请继续开发 Agent Hands-on Lab。

先完整阅读根目录和 apps/web/AGENTS.md，再阅读：
- course-dev/CLAUDE-CODE-HANDOFF.md
- course-dev/interactive-course-plan.md
- course-dev/30-lesson-curriculum-map.md
- content/lessons/05-complete-agent-blueprint.md

本轮只开发第 05 课“完整 Agent 蓝图”，不要接入真实模型 API、账号或数据库。
它是编辑综合课，不引入新的 LangGraph API，只负责把 01–04 的部件组合起来。
互动实验做成组件卡片排序：给出打乱的节点，让学习者排出执行路径并标出必须审批的动作。
正文按新标准写，使用 Prose 与 article-kit 的构件；术语交给 auto-term 自动标注，
不要手工包裹，需要新词就加进 lib/glossary.ts。

完成后更新课程元数据、分页、课程计划、对话记录和本交接文档。
运行 pnpm lint、pnpm build，并测试桌面及 390px 手机布局。
```

## 8. 本地启动

```powershell
Set-Location -LiteralPath 'D:\Projects\AIagent\Agent-Engineering-Handbook\apps\web'
pnpm install
pnpm dev
```

浏览器打开：<http://localhost:3000>。

如果端口 3000 已有该项目的开发服务器，不要再启动第二个实例，直接使用已有地址。
