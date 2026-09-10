# Agent Hands-on Lab

> 一套把技术文章、流程动画和小练习编排在一起的 LangGraph 零基础教程。

当前完成第 00 课前言和前两章，全部可以先在浏览器中运行，不使用模型 API、Python 后端、账号或数据库。

网站按“第 00 课前言 + 30 课正文”设计：首页是课程地图，每课拥有独立 URL，课尾提供上一课、下一课和 00–30 课次跳转。未开放课程不会生成空白页面。

## 本地运行

在 PowerShell 中逐行执行：

```powershell
cd D:\Projects\AIagent\Agent-Engineering-Handbook\apps\web
pnpm dev
```

浏览器打开 <http://localhost:3000>。

当前页面：

- 课程目录：`/`
- 第 00 课：`/lessons/00-preface-and-setup`
- 第 1 课：`/lessons/01-graph-and-state`
- 第 2 课：`/lessons/02-tool-loop`

## 已完成章节

### 第 00 课：前言与环境

- 上来先解释 LangGraph 是什么、又不是什么
- 单步预演 `输入 → Node → State → Edge → 输出`
- 选择“只用网页”或“本地运行”双轨路径
- 本地路径逐步给出 PowerShell 命令和成功判断标准
- 术语使用虚线提示，支持悬停、键盘聚焦和手机点击

### 第一章：图与 State

- 阅读 State、Node、Edge 的短文解释
- 单步执行 `plan → work → review → END`
- 查看 `count` 覆盖和 `log` reducer 累加
- 将条件阈值从 4 改为 6，通过挑战

### 第二章：工具循环

- 区分 model 提出调用与 ToolNode 执行函数
- 单步观察 tool call、tool result 和最终回答进入 MessagesState
- 找出闭合 ReAct 循环的关键 Edge：`tools → model`
- 了解确定性动画与真实模型行为的边界

## 验证

```powershell
pnpm build
```

第 1 章的逻辑基准：

| 阈值 | work 次数 | 最终 count | log 长度 |
| ---: | ---: | ---: | ---: |
| 4 | 3 | 4 | 5 |
| 6 | 5 | 6 | 7 |

基准源代码：`../../lab/langgraph/examples/01_hello_graph.py`。

第 2 章的逻辑基准：

- `add(128, 349)` 返回 `477`
- `word_count("the quick brown fox jumps")` 返回 `5`
- 动画消息总数为 5：1 条用户消息、1 条 tool call、2 条工具结果、1 条最终回答

基准源代码：`../../lab/langgraph/examples/02_tool_agent.py`。

## 部署到 Vercel

在 Vercel 导入仓库后，将 **Root Directory** 设置为 `apps/web`。框架会自动识别为 Next.js，不需要运行时环境变量。

可选设置 `NEXT_PUBLIC_SITE_URL` 为正式域名，用于生成正确的社交分享元数据；Vercel 生产环境也会自动提供项目域名。

## 路线

1. 无 API 的流程动画（当前阶段）。
2. `/api/agent` 运行真实 Python LangGraph。
3. 调用限额和费用保护。
4. 账号、数据库和长期记忆。
