# Agent Hands-on Lab · 互动课程开发图

> 状态：00–05 文稿已完成初稿，第 00–03 课网页已实现并验证 ｜ 目标平台：Vercel ｜ 第一阶段不使用模型 API

> 第 00 课是前言，不计入正式 30 课。第 01–30 课的完整标题、外部课程来源和逐课产出已固定在 [`30-lesson-curriculum-map.md`](30-lesson-curriculum-map.md)；本文继续保存当前开发中的精确实验契约。

## 源材料清单

| ID | 文件 | 类型 | 作用 | 权威性 |
| --- | --- | --- | --- | --- |
| S01 | `lab/langgraph/examples/01_hello_graph.py` | 可运行代码 | 第 1 课 StateGraph 基准实验 | primary |
| S02 | `lab/langgraph/examples/02_tool_agent.py` | 可运行代码 | 第 2 课工具循环 | primary |
| S03 | `lab/langgraph/examples/03_memory.py` | 可运行代码 | 第 3 课 thread/checkpointer | primary |
| S04 | `lab/langgraph/examples/04_human_in_loop.py` | 可运行代码 | 第 4 课 interrupt/resume | primary |
| S05 | `lab/langgraph/README.md` | 环境说明 | 课程约定、状态和真实踩坑 | supporting |
| S06 | `lab/langgraph/pyproject.toml`、`.env.example` | 环境配置 | Python 版本、依赖和环境变量模板 | primary |
| S07 | S01–S04 的组合 | 编辑新增 | 第 5 课综合 Agent 蓝图，不引入新 API | editorial |

## 课程主线

下表是已经进入写作或实现阶段的 00–05。06–30 不在这里重复维护，以完整课程地图为准。

| 课 | 源材料 | 前置 | 核心问题 | 本课新概念 | 暂不讲 | 互动实验 | 学习者产出 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 00 总纲与环境 | S05–S06 | 无 | 这门课怎样学，怎样把代码跑起来？ | 双轨学习方式、终端、工作目录、uv、环境变量 | Agent 内部机制、部署 | 运行无 API 的第 1 个脚本 | 环境检查通过，能解释命令在哪个目录执行 |
| 01 图与状态 | S01 | 无 | Agent 为什么会一步步向前执行？ | State、Node、Edge、reducer、条件循环 | LLM、工具、持久化 | 单步执行图并修改循环阈值 | 能解释图的三部分并让 work 多跑两次 |
| 02 工具循环 | S02 | 01 | 模型怎样决定调用工具并继续？ | MessagesState、ToolNode、ReAct 循环 | 长期记忆、HITL | 在 model/tools 间逐步运行 | 能指出闭合循环的 Edge |
| 03 会话记忆 | S03 | 01–02 | 为什么同一个 thread 记得，换 thread 就忘？ | checkpointer、thread_id、checkpoint | 跨用户长期记忆 | 切换 thread 比较消息历史 | 能判断消息属于哪个 thread |
| 04 人工审批 | S04 | 01、03 | Agent 怎样暂停并等待人类？ | interrupt、resume、持久化恢复 | 任意代码执行、生产队列 | 对两条危险操作分别批准/拒绝 | 能解释为什么需要 checkpointer |
| 05 综合蓝图 | S07 | 01–04 | 怎样把前四课拼成一个可信的完整 Agent？ | 无；只负责整合与边界判断 | 新框架 API、生产数据库、部署 | 为“文件整理 Agent”排列节点并标出审批点 | 交付一张包含 State、工具、记忆和审批的 Agent 蓝图 |

## 概念归属

| 概念 | 归属课 | 允许预告 | 允许回顾 | 禁止重复 |
| --- | --- | --- | --- | --- |
| 课程环境与命令约定 | 00 | 首页可说“无需安装也能先学” | 后续只给运行命令 | 01–05 不重复安装步骤 |
| State / Node / Edge | 01 | 首页用一句话预告 | 后续用图例简短回顾 | 后续不重新完整定义三者 |
| reducer | 01 | 无 | 02 用 MessagesState 回顾 | 02 不重讲普通 list reducer 实验 |
| ReAct 工具循环 | 02 | 01 结尾提出问题 | 04 可引用工具执行风险 | 其他课不重复完整循环推导 |
| thread/checkpoint | 03 | 01 只说 state 当前存在 | 04 回顾恢复前提 | 04 不重复多 thread 对比实验 |
| interrupt/resume | 04 | 02 提到危险工具需审批 | 无 | 无 |
| 四部分组合与生产边界 | 05 | 00 展示终点 | 后续项目课可引用蓝图 | 05 不重新完整定义 01–04 的概念 |

## 术语说明规则

- 每课都有独立 URL，因此每篇正文都重新计算“第一次出现”，不能假设读者读过上一课。
- 英文技术术语第一次出现在学习者正文时，统一写成 `English（中文意思）`。
- 在首次出现段落之后紧跟 Markdown 引用块，用 `> **术语说明｜English**` 回答“它是做什么的”，不能只给字面翻译。
- 同一段首次出现多个术语时，合并成一个引用列表；相邻术语不拆成多个连续提示框，避免打断阅读。
- 代码、命令、字段名和函数名保持原样；如果它们首次出现在代码块中，在代码块后的引用块补中文含义和作用。
- 品牌名、文件名、路径和普通产品名不强行翻译。
- 非归属课可以给简短中文提示，但不能借术语解释重新完整教授其他课拥有的概念。

### 网页中的渐进式术语解释

Markdown 原稿继续保留段后引用块，保证脱离网站、关闭 JavaScript 或直接在 GitHub 阅读时，解释仍然完整。网页把同一类解释改成渐进披露：正文中的关键词保留中文含义并加虚线下划线，鼠标悬停、键盘聚焦或手机点击后显示“它是做什么的”。

- 组件必须支持 hover、focus 和 click，不能只照顾鼠标。
- 触发词使用按钮语义和 `aria-describedby`；浮层使用 `role="tooltip"`。
- 再次点击、移走焦点或按 Escape 后关闭，正文布局不能因浮层出现而跳动。
- 每篇课页仍重新计算首次术语；只在第一次完整解释，后文不反复弹出同一段定义。
- 解释保持一到两句话，复杂机制回到正文或互动实验，不把整段教程塞进浮层。
- 第一批实现范围为第 00–02 课；第 03 课已按同一规则接入，后续继续推广到 04–30。

## 第 00 课简报

- 源文件：`lab/langgraph/README.md` 第 1–56 行、`lab/langgraph/pyproject.toml` 第 1–11 行、`lab/langgraph/.env.example` 第 1–9 行。
- 学习者问题：不知道终端在哪里、命令应该在哪个目录运行，也分不清浏览器学习和本地 Python 实验。
- 一句话结果：学习者能选择浏览器或本地双轨路径，并在本地运行第一个无 API 的 LangGraph 脚本。
- 本课拥有：课程总纲、双轨学习、终端、目录、uv、环境变量与密钥安全。
- 有序教学块：课程终点 → 两条学习路径 → 终端与目录 → 环境检查 → 安装依赖 → 首次运行 → API Key 边界 → 故障排查。
- 暂不讲：State/Node/Edge 的正式定义、工具循环、持久化实现、部署。
- 验收标准：`uv run python examples/01_hello_graph.py` 退出码为 0，并看到 `最终 state`。
- 下一课过渡：环境能跑以后，第一步不是接模型，而是看懂图怎样改变 State。

## 第 05 课简报

- 来源：S01–S04 的编辑整合；不声称存在新的独立源码实验。
- 上一课交入：学习者已经分别理解图、工具循环、会话记忆和人工审批。
- 学习者问题：单个概念都看懂了，但不知道真实 Agent 应该怎样组合，也不知道哪些能力不能直接用于生产。
- 一句话结果：学习者能画出一个“文件整理 Agent”蓝图，并把检查点、工具节点和人工审批放在正确位置。
- 本课拥有：组合顺序、职责边界、失败点与生产化清单；不拥有新的 LangGraph API。
- 有序教学块：明确任务 → 定义 State → 放置 model/tools 循环 → 加 checkpointer → 在危险工具前 interrupt → 标注失败与恢复 → 判断哪些部件仍是教学版。
- 实验：给出打乱的组件卡片，让学习者排列执行路径并标出必须审批的删除动作。
- 验收标准：蓝图包含 `model ⇄ tools`、同一 `thread_id`、checkpointer、删除前 approval，以及拒绝后的安全结束路径。
- 暂不讲：Postgres checkpointer、用户账号、限流、Vercel Function 和模型成本；这些进入后续工程化模块。
- 下一课过渡：蓝图明确后，后续课程再逐层把教学版部件换成生产版。

## 第 1 课简报

- 源文件：`lab/langgraph/examples/01_hello_graph.py`
- 精确来源：State 定义见第 21–26 行，三个 Node 见第 29–38 行，条件路由见第 41–43 行，Graph/Edge 见第 46–56 行，运行入口见第 58–66 行。
- 学习者问题：不懂 Agent 为什么不是一次性函数，也不知道图中的节点和状态是什么。
- 一句话结果：学习者能通过单步执行看到三个节点怎样共享并更新同一个 State。
- 本课拥有：State、Node、Edge、reducer、条件循环。
- 有序教学块：
  1. 先看初始 State。
  2. 单步执行 plan，观察 count 覆盖与 log 累加。
  3. 单步执行 work，观察条件边制造循环。
  4. 执行 review 并到达 END。
  5. 把阈值从 4 改成 6并重新运行。
- 暂不讲：模型调用、工具 schema、checkpointer、数据库、部署。
- 代码路径：`lab/langgraph/examples/01_hello_graph.py`
- 网页路径：`apps/web/src/app/lessons/[slug]/page.tsx`、`apps/web/src/components/lesson-one-article.tsx`
- 验收标准：
  - 默认阈值 4 时，work 执行 3 次，最终 count 为 4。
  - 阈值 6 时，work 执行 5 次，最终 count 为 6。
  - 页面能明确区分覆盖字段和 reducer 累加字段。
- 下一课过渡：现在流程是代码决定的；如果让模型选择是否调用工具，会发生什么？

## 第 1 课实验契约

| 字段 | 内容 |
| --- | --- |
| 问题 | 条件阈值怎样改变 work 循环次数？ |
| 输入 | topic=`学 LangGraph`、count=0、log=[]、threshold=4/6 |
| 固定项 | plan/work 每次 count +1；review 不修改 count；log 始终累加 |
| 操作 | 重置 → 逐步执行 → 修改阈值 → 重新执行 |
| 预期输出 | 阈值 4：count=4、5 条 log；阈值 6：count=6、7 条 log |
| 通过条件 | 阈值为 6 且运行结束，work 恰好执行 5 次 |

## 第 1 课教学图说明

| 项目 | 内容 |
| --- | --- |
| 教学主张 | Agent 不是一次性函数，而是多个 Node 沿 Edge 顺序执行，并持续修改同一个 State。 |
| 数据来源 | `lab/langgraph/examples/01_hello_graph.py` 第 21–26、29–56 行。 |
| 图形形式 | 可交互流程图：`START → plan → work ↺ / review → END`。 |
| 必要标注 | 当前 Node、刚走过的 Edge、`count` 覆盖前后值、`log` reducer 新增项、条件阈值。 |
| 交互目的 | 每点击一次只执行一个节点，让学习者把“节点运行”和“State 改变”建立一一对应。 |
| 目标位置 | `apps/web/src/components/lesson-one-lab.tsx`。 |
| 小屏策略 | 流程节点允许换行，State 面板移到流程图下方，按钮保持可点击宽度。 |

## 第 2 课简报

- 源文件：`lab/langgraph/examples/02_tool_agent.py`
- 精确来源：工具定义见第 19–33 行，MessagesState 与模型绑定见第 35–42 行，Graph/ToolNode/条件边见第 45–55 行，运行入口见第 58–65 行。
- 上一课交入：读者已经理解 Node 沿 Edge 执行，并知道 reducer 会累加 State 字段。
- 学习者问题：知道模型会“调用工具”，但不明白模型、工具和消息之间怎样组成一个能继续运行的循环。
- 一句话结果：学习者能跟随一条消息链，解释 model 为什么去 tools，以及 tools 为什么必须回到 model。
- 本课拥有：MessagesState、ToolNode、tool call、tool result、ReAct 工具循环。
- 只做回顾：Node、Edge、reducer；不重新完整定义。
- 有序教学块：
  1. 从“模型不会直接执行 Python 函数”开始。
  2. model 节点输出 tool call，而不是计算结果。
  3. tools 节点执行函数，把 tool result 追加到 messages。
  4. `tools → model` 让模型拿到结果后继续判断。
  5. model 不再发出 tool call 时走向 END。
- 暂不讲：真实模型配置、API Key、并行工具调用差异、记忆、数据库、审批。
- 代码路径：`lab/langgraph/examples/02_tool_agent.py`
- 网页路径：`apps/web/src/components/lesson-two-article.tsx` 与 `apps/web/src/lib/lesson-two.ts`
- 验收标准：学习者选择 `tools → model` 作为闭合循环的关键 Edge，并能说出删除它会导致模型看不到工具结果。
- 下一课过渡：messages 现在只活在这一次运行里；刷新或换会话后，Agent 怎样记住过去？

## 第 2 课实验契约

| 字段 | 内容 |
| --- | --- |
| 问题 | 模型提出工具调用后，结果怎样回到模型并形成最终回答？ |
| 输入 | “先算 128 加 349，再数一下 the quick brown fox jumps 有几个词” |
| 固定项 | 工具为 `add`、`word_count`；演示使用一个 tool-call batch；messages 只追加不覆盖 |
| 操作 | 单步执行 model → tools → model → END，观察消息列表 |
| 预期输出 | `add=477`、`word_count=5`，最后得到包含两个结果的回答 |
| 通过条件 | 正确选择闭合循环的 Edge：`tools → model` |

## 第 2 课教学图说明

| 项目 | 内容 |
| --- | --- |
| 教学主张 | 工具调用不是模型亲自执行函数；model 发出调用意图，tools 执行并把结果交还 model。 |
| 数据来源 | `lab/langgraph/examples/02_tool_agent.py` 第 19–55 行。 |
| 图形形式 | 可交互循环图：`START → model ⇄ tools`，model 没有 tool call 时进入 `END`。 |
| 必要标注 | 当前 Node、tool call、tool result、messages 数量、`tools → model` 回边。 |
| 交互目的 | 让消息和节点同步推进，避免读者把“模型决定调用”误解成“模型执行工具”。 |
| 目标位置 | `apps/web/src/components/lesson-two-lab.tsx`。 |
| 小屏策略 | 图和消息列表上下排列，消息卡片保持角色标签，图允许横向滚动。 |

## 第 3 课简报

- 源文件：`lab/langgraph/examples/03_memory.py`
- 精确来源：`InMemorySaver` 导入见第 12 行，图与 `compile(checkpointer=...)` 见第 24–33 行，`thread_id` 配置与 `invoke` 见第 36–41 行，三次提问见第 44–47 行，`get_state` 见第 49–50 行。
- 上一课交入：读者已经知道 messages 在一次运行里只追加不覆盖，但不知道下一次调用图时它去了哪里。
- 学习者问题：以为「Agent 忘了」是模型记性差，不知道这是上一轮 State 根本没有被交给下一轮。
- 一句话结果：学习者能把三条消息分配到正确的 thread，并解释为什么 a 记得名字、b 看不到。
- 本课拥有：checkpointer、checkpoint、`thread_id`、`InMemorySaver`、`get_state`、会话记忆与长期记忆的边界。
- 只做回顾：State 与 MessagesState；不重新完整定义。
- 有序教学块：
  1. 先说清楚「忘」不是模型的问题，是 State 没有被传下去。
  2. 用酒店前台的比喻分开「谁在存」和「存给谁」。
  3. `compile(checkpointer=...)` 与 `configurable.thread_id` 两行代码。
  4. 自己把三条消息分到 a / b，观察隔离。
  5. 用 `get_state` 直接查快照，再讲清 InMemorySaver 和 thread_id 的两条边界。
- 暂不讲：interrupt/resume、时间旅行、Postgres checkpointer、账号与权限隔离、跨会话长期记忆。
- 代码路径：`lab/langgraph/examples/03_memory.py`
- 网页路径：`apps/web/src/components/lesson-three-article.tsx`、`lesson-three-lab.tsx` 与 `apps/web/src/lib/lesson-three.ts`
- 验收标准：
  - 按 a / b / a 分配后，thread a 存 4 条消息、checkpoint 为 v2，与 `03_memory.py` 末尾的 `get_state` 结果一致。
  - 三条都放进同一个 thread 时，最后一次提问会连咖啡也看见。
  - 最后一次提问放进没有名字的 thread 时，model 答不出名字。
- 下一课过渡：State 既然能存下来，就能在中途停下来——下一课让图暂停并等待人类批准。

## 第 3 课实验契约

| 字段 | 内容 |
| --- | --- |
| 问题 | 同一句提问，放进不同 thread 为什么得到不同答案？ |
| 输入 | 三条固定消息：①「记住：我在学 LangGraph，我叫小白。」②「记住：我喜欢喝咖啡。」③「我叫什么？」 |
| 固定项 | 每条消息由学习者指定 thread；messages 只追加；回复文本由该 thread 内已存在的事实推导，不抄写某次真实模型输出 |
| 操作 | 选择 thread → 调用图 → 查看恢复条数、model 看到的输入条数与 checkpoint 版本 → 用 `get_state` 查快照 → 重新分配再跑一次 |
| 预期输出 | a / b / a：thread a 4 条消息、v2，答「你叫小白。」；thread b 2 条消息、v1，不含名字 |
| 通过条件 | 三条分别落在 a / b / a，且最后一次提问看得见名字、看不见咖啡 |

## 第 3 课教学图说明

| 项目 | 内容 |
| --- | --- |
| 教学主张 | checkpointer 负责存，`thread_id` 负责分组；隔离不是模型的判断，而是它压根没收到另一段会话的消息。 |
| 数据来源 | `lab/langgraph/examples/03_memory.py` 第 12、24–50 行。 |
| 图形形式 | 双列会话对照：左右两列 thread 同屏显示，当前目标 thread 高亮，另一列保持可见但降饱和。 |
| 必要标注 | 目标 `thread_id`、本次恢复的消息条数、model 这一步看到的输入条数、每个 thread 的 checkpoint 版本与消息数、`get_state` 读数。 |
| 交互目的 | 让学习者亲手把消息分错一次，看到「同一个 thread 什么都看得见」和「换一个 thread 什么都看不见」两种失败。 |
| 目标位置 | `apps/web/src/components/lesson-three-lab.tsx`。 |
| 小屏策略 | 组稿区与两列 thread 改为纵向堆叠，thread 列取消最大高度直接展开，轨迹卡片两行显示。 |

## MVP 范围

包含：首页 30 课目录、第 00–03 课独立页面、术语渐进解释、课次分页、第 00 课双轨起步实验、第 1 课互动图与 State diff、第 2 课工具循环与 MessagesState、第 3 课双 thread 会话隔离与 get_state 快照、练习检查、真实源码片段、本地完成状态、响应式布局。

明确排除：模型 API、Python 服务、账号、数据库、支付、云端终端、任意代码执行。

## 继续开发交接

### 当前状态

- 产品模式已确定为“读、动、改、证”，完整文案见 `course-dev/product-concept.md`。
- 第 1 章文章、流程图、State diff 与阈值挑战已实现。
- 第 2 章文章、工具循环图、MessagesState 与 Edge 挑战已实现。
- 第 00 课已加入 LangGraph 导读、最小流程预演、网页/本地双轨步骤器与命令复制。
- 第 3 章文章、双列 thread 对照、checkpoint 版本、`get_state` 快照与分配挑战已实现。
- 第 00–03 课已接入可悬停、聚焦和点击的术语浮层。
- 默认阈值 4 与挑战阈值 6 的结果已和 Python 源实验核对。
- 第 2 章确定性动画已验证得到 `477`、`5` 和 5 条消息。
- 第 3 章 a / b / a 分配已验证得到 thread a 4 条消息、v2，与 `03_memory.py` 的 `get_state` 一致。
- 首页、四条独立课页、上一课/下一课与 00–30 课次跳转已实现。
- `pnpm lint` 与 `pnpm build` 已通过，根页面为静态预渲染。

### 接下来按顺序做

| 顺序 | 工作 | 文件 | 验证 |
| ---: | --- | --- | --- |
| 1 | 收集学习者对两章阅读节奏的真实反馈 | `course-dev/conversation-log.md` | 能指出具体困惑位置 |
| 2 | 修正文字、动画或手机端问题 | `apps/web/src/app/page.tsx`、`globals.css`、`components/` | 两章逻辑基准不变 |
| 3 | 完成 GitHub 上传与 Vercel 导入 | 仓库与 Vercel 项目 | 获得公开 HTTPS URL |
| 4 | 第 4 章先写简报再实现 | 本文件、`04_human_in_loop.py` | 复用第 3 课的 checkpointer 前提，不重复多 thread 实验 |

### 已确定，不重复讨论

- 产品采用轻量互动网站，不复刻完整云端实验室。
- 第一阶段不接 API、账号、数据库和沙箱。
- 部署目标为 Vercel，网站根目录为 `apps/web`。
- Python 实验是课程事实来源，网页结果必须与其一致。
