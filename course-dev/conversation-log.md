# AI Agent 学习对话记录

> 用途：记录学习者的问题、Agent 的教学回应、实际操作、验证结果和下一步，后续作为教程写作的一手素材。
>
> 记录原则：保留真实学习路径，不美化踩坑；API Key、令牌、账号和其他敏感信息一律不记录。正式教程可以引用这里的经验，但不直接复制私人对话。

## 2026-09-09｜项目启动与 LangGraph 环境搭建

### 1. 拉取并部署仓库

**学习者**

> https://github.com/EthanBAI-dev/Agent-Engineering-Handbook 拉下来部署

**Agent 回应与操作**

- 将仓库克隆到 `D:\Projects\AIagent\Agent-Engineering-Handbook`。
- 检查仓库结构、README、Makefile 和构建配置。
- 确认它是 Markdown 内容生产仓库，没有现成的网站应用、Docker 部署配置或静态站点配置。
- 说明必须先确定“部署”的含义，才能继续。

**结论**

仓库已成功拉取，但当前没有可直接部署的网站程序。

### 2. 明确真实目标

**学习者**

> 我想进行开发aiagent，从零开始，你帮我搭建环境，然后还要记录工具书，后期目标是打算出一个教学

**Agent 回应与操作**

- 将目标调整为：从零学习 AI Agent 开发，并把学习过程持续沉淀为教程。
- 检查本机开发环境：Python、uv、Node.js、pnpm、Docker 和 Git 均已安装。
- 阅读仓库的总计划，确认项目已经规划了“AI 编程与 Agent”内容支柱。
- 在仓库内新建 `lab/langgraph/`，用 uv 建立独立 Python 项目。
- 安装 LangGraph 1.2.11、LangChain Anthropic 和 python-dotenv。

**产物**

- `lab/langgraph/pyproject.toml`
- `lab/langgraph/uv.lock`
- `lab/langgraph/.env.example`
- `lab/langgraph/README.md`

### 3. 创建前四个实验

**Agent 回应与操作**

建立四个递进实验：

1. `01_hello_graph.py`：State、Node、Edge、条件边和 reducer。
2. `02_tool_agent.py`：手写 `model → tools → model` 的 ReAct 循环。
3. `03_memory.py`：checkpointer 和 `thread_id` 对话记忆。
4. `04_human_in_loop.py`：`interrupt()` 与 `Command(resume=...)` 人工审批。

**实际验证**

- 第 1 课已实跑：图执行 `plan → work → work → work → review`，最终 `count = 4`，日志按 reducer 累加。
- 第 4 课已实跑：模拟批准删除与拒绝删除，两条路径均正确恢复并结束。
- 第 2、3 课在假 Key 下通过构图检查，但没有发送真实模型请求。
- 环境中未发现 `ANTHROPIC_API_KEY`，因此真实 LLM 调用暂未验证。

**踩坑记录**

第一次运行第 1 课时，Windows 控制台使用 cp932 编码，输出中文触发 `UnicodeEncodeError`。例子中加入：

```python
sys.stdout.reconfigure(encoding="utf-8")
```

修复后实跑通过。这个问题将保留在教程中，因为它是中文 Windows 用户可能真实遇到的环境问题。

### 4. 确定学习方式

**学习者**

> 我接下来需要怎么做，我想让agent手把手教我，然后帮我完成教程。

**Agent 回应**

确定采用以下循环：

```text
讲解 → 学习者运行 → 分析结果 → 修改实验 → 沉淀教程
```

第一项学习任务是运行：

```powershell
cd D:\Projects\AIagent\Agent-Engineering-Handbook\lab\langgraph
uv run python examples\01_hello_graph.py
```

然后将条件从 `count < 4` 改为 `count < 6`，观察循环次数如何变化。

### 5. 增加对话记录

**学习者**

> 你把对话也记录下来吧。

**Agent 回应与操作**

- 建立本文件，补录项目开始以来的学习对话、操作、结果和待办。
- 原始学习记录保存在 `course-dev/`，与正式教程正文分开。
- 后续每完成一个实验或形成一个关键判断，就在本文件继续追加。

## 当前进度

- [x] 拉取手册仓库
- [x] 检查本机开发工具链
- [x] 建立 LangGraph uv 项目
- [x] 创建四个递进实验
- [x] 实跑无 LLM 的第 1、4 课
- [x] 建立学习对话记录
- [ ] 学习者亲自运行第 1 课
- [ ] 完成 `count < 6` 修改实验
- [ ] 配置模型 API Key
- [ ] 实跑第 2、3 课
- [ ] 把第 1 课整理成正式教程章节

## 2026-09-09｜零基础环境操作：终端在哪里

**学习者**

> 终端在哪里

**Agent 回应**

- 当前使用的是 Windows，最容易找到的终端是系统自带的 PowerShell 或 Windows Terminal。
- 按键盘 `Win` 键，输入 `PowerShell`，打开“Windows PowerShell”即可。
- 打开后，先复制教程中的 `cd` 命令进入项目目录，再执行 `uv run` 命令。
- Codex 可以代为执行命令，但为了真正掌握开发流程，第一课建议学习者亲自运行一次。

**教程改进点**

正式教程不能默认读者知道“终端”“工作目录”和“运行命令”是什么。环境章节需要增加 Windows 截图或图示，并把每条命令拆成可复制的单步操作。

## 2026-09-09｜产品方向：Agent 互动教学网站

**学习者**

> 我能做一个什么网站，或者这种插件，或者别的吗，互动教学网站一类的，别人在我这一点一点就把agent学会了这种。最好vercel就能运行，这可行吗，不可行就继续这种教程式的。

**Agent 判断**

- 可行，第一产品形态应选择互动教学网站，而不是浏览器插件或桌面应用。
- 网站暂定名为 **Agent Learning Lab（Agent 闯关实验室）**。
- 采用“双轨结构”：网站提供互动学习体验，现有 Markdown 和 Python 实验继续作为课程源材料与可下载代码。
- 第一版部署目标为 Vercel，采用 Next.js 前端；确定性教学实验先在浏览器运行，不依赖模型 Key。
- 真实 LLM、长期记忆、账号和云端进度放到后续阶段，避免 MVP 被费用、密钥和数据库阻塞。

**第一版学习体验**

1. 学习者阅读一个很短的任务说明。
2. 点击“下一步”，观察 Agent 图中的节点依次点亮。
3. 右侧 State 面板显示每一步字段变化。
4. 学习者修改一个参数或补一条边。
5. 网站自动检查结果并解锁下一课。
6. 每课都能查看并下载对应的真实 Python 代码。

**首批四课**

| 课 | 互动内容 | 对应源代码 |
| --- | --- | --- |
| 1 | 点击执行 `plan → work → review`，观察 State diff | `lab/langgraph/examples/01_hello_graph.py` |
| 2 | 看模型何时选择工具、工具结果如何回到模型 | `lab/langgraph/examples/02_tool_agent.py` |
| 3 | 切换 thread，观察“记得”与“忘记” | `lab/langgraph/examples/03_memory.py` |
| 4 | 在危险操作前点击批准或拒绝，再恢复图 | `lab/langgraph/examples/04_human_in_loop.py` |

**技术边界**

- Next.js 可以直接部署到 Vercel。
- Vercel Functions 支持 Node.js 和 Python，也支持流式响应，因此后续可以接入真实 Agent。
- Vercel Function 的本地内存和文件不能作为可靠的长期记忆；生产记忆需要 Postgres、MongoDB 或 Redis checkpointer。
- 模型 API Key 只能保存在服务端环境变量中，不能放进浏览器代码。
- 第一版不允许用户执行任意 Python 代码；只运行预定义、可验证的教学步骤。任意代码沙箱留到成熟阶段。

**阶段划分**

- MVP：落地页、课程目录、第 1 课互动图、State diff、练习检查、本地进度。
- 第二阶段：补齐四课、接入 AI 导师、服务端限流。
- 第三阶段：登录、云端学习进度、持久化 Agent 记忆、作品分享。
- 后续：需求得到验证后，再考虑浏览器插件或 VS Code 插件。

**下一项待确认工作**

- [ ] 在仓库中新建 Next.js 网站，并实现第 1 课可点击原型。

### 后端能力分级

**学习者**

> 而且如果做这种网站，需要什么水平的后端

**Agent 判断**

- MVP 不要求传统后端能力：课程、流程动画和练习检查可在浏览器完成，进度先存在 `localStorage`。
- 加入 AI 导师后，需要初级后端能力：Next.js API Route、HTTP/JSON、环境变量、流式响应、错误处理和简单限流。
- 加入登录、跨设备进度和长期 Agent 记忆后，需要中级后端能力：认证、数据库设计、权限控制、迁移、日志和成本控制。
- 允许用户执行任意 Python、运行长任务或多 Agent 并发属于高级后端与安全工程，不放入第一版。

**决定**

先做无登录、无数据库、无真实模型调用的第 1 课互动原型。网站结构稳定后，再加入服务端模型调用；有真实用户后，最后加入数据库和账号。

### 相似项目与差异化调研

**学习者**

> 这种类似的项目有人做了吗？

**调研结论**

有相似项目，说明“浏览器内学习 Agent”已有需求；但截至本次检索，没有发现一个主流产品完全等同于“中文零基础 + 节点逐步点亮 + State diff + 闯关检查 + 对应真实 LangGraph 代码”。

| 项目 | 已经做得好的部分 | 与计划产品的区别 |
| --- | --- | --- |
| LangChain Academy | 官方 LangGraph 课程，覆盖图、State、Memory、HITL 与部署 | 以课程、视频和资源为主，不以零基础逐步状态动画为核心 |
| DeepLearning.AI《AI Agents in LangGraph》 | 1.5 小时左右的视频课、代码例子和作业 | 定位中级 Python 用户，主要是视频 + Notebook |
| Hugging Face Agents Course | 从基础到进阶，有测验和预配置 Spaces 实验 | 范围较广，不专注 LangGraph 的节点与 State 心智模型 |
| Microsoft AI Agents for Beginners | 大型开源课程、多语言、视频和 Python 示例 | 需要 Fork/Clone，依赖 Microsoft Agent Framework/Azure 体系 |
| DAIR.AI Academy Labs | 浏览器内真实工作区、终端、检查点，无需本地安装 | 体验最接近，但重点是与编码 Agent 一起做项目，不是逐步解释 LangGraph State |
| LangSmith Studio | 可视化图、运行节点、查看中间 State、断点和时间旅行 | 面向开发和调试，不是为零基础学习者设计的课程产品 |

**差异化方向**

1. 中文零基础，不默认学习者知道终端、目录、API 或环境变量。
2. 每次只执行一个节点，同时高亮 Edge 并显示 State 的前后差异。
3. 先用无模型的确定性实验建立 Agent 心智模型，再接真实 LLM。
4. 每课以一个可验证任务结束，而不是只看视频或复制 Notebook。
5. 网页互动、可下载 Python 代码和真实踩坑日志三者保持一致。

### Vercel 如何真正运行 Python Agent

**学习者**

> 不是后端工程，是网站要运行agent，就需要api，还有什么python，vercel能运行吗

**技术结论**

- 真正调用 LLM 的 Agent 需要模型供应商 API；无模型的流程教学模拟不需要。
- Python 和 LangGraph 可以运行在 Vercel Python Function 中；Vercel 当前支持 Python 3.12、3.13、3.14，Python Runtime 仍标记为 Beta。
- Next.js 前端和 FastAPI/Python 后端可以放在同一项目：网页位于根目录，`api/index.py` 暴露 Agent API，`pyproject.toml` 声明 LangGraph 等 Python 依赖。
- 浏览器调用 `/api/agent`；Python Function 在服务端执行 LangGraph，再调用模型 API，并把结果流式返回网页。
- 模型 API Key 保存于 Vercel 服务端环境变量，绝不进入前端代码。
- `InMemorySaver` 不能作为可靠线上记忆；多轮会话、暂停恢复和跨设备进度需要外部 Postgres/MongoDB/Redis checkpointer。
- 网站公开后必须加入限流、调用额度和错误处理，否则模型 API 可能被滥用并产生费用。

**推荐架构**

```text
浏览器中的 Next.js 教学界面
          ↓ HTTPS / JSON / Stream
Vercel Python Function（FastAPI）
          ↓
LangGraph：State / Node / Edge / Tools
          ↓
模型 API（OpenAI / Anthropic / 其他）
          ↓
可选持久化数据库（第二阶段）
```

### DAIR.AI Academy：价格、复刻边界与是否值得照做

**学习者**

> DAIR AI 这个平台，Learn AI by building，Short, interactive labs where you build real projects alongside AI Agents in a live workspace. Right in your browser, nothing to install. 我能复刻吗，它是怎么收费的，有必要做一样的吗？

**截至 2026-09-09 的公开价格**

- Free：$0/月，可访问免费课程、基础社区和免费活动。
- Pro 月付：$49/月。
- Pro 年付：$350/年，页面折算为 $29/月。
- Pro 包含全部课程、Hands-on Labs、AI Builder、证书、活动和优先支持。
- Teams：5 个席位起，联系销售询价；学生可邮件申请特殊价格。

**产品判断**

- 可以独立实现同类“浏览器互动实验室”，但不能复制其课程正文、代码、图形、品牌、文案或近似界面，也不应逆向其私有实现。
- DAIR 的完整体验较重：公开介绍显示，每个实验会启动真实 Linux sandbox，运行 Agent SDK，并通过自动检查器读取文件判断任务是否完成。
- 第一版没有必要复制实时终端、文件编辑器和独立沙箱。先验证用户是否愿意完成“节点动画 + State diff + 参数修改 + 自动检查”课程。
- 只有当轻量课程获得真实使用和反馈后，再增加云端沙箱、终端和可下载项目。

**独立路线**

| 阶段 | 实现 | 成本与风险 |
| --- | --- | --- |
| MVP | 预定义 Agent 模拟、图动画、State diff、前端练习检查 | 低，可直接上 Vercel |
| V1 | Python LangGraph API、真实模型、调用限额 | 中，有模型费用 |
| V2 | 登录、进度、作品保存、数据库 | 中 |
| V3 | 每用户 Linux 沙箱、终端、文件编辑器、Agent SDK、自动测试 | 高，需要隔离、配额与安全治理 |

**决定建议**

借鉴 DAIR 的“短课、动手、自动检查、保留作品”学习闭环，但不复刻它的完整平台。先做一个更聚焦的中文 LangGraph 可视化实验室，用最小成本验证差异化。

### 范围确认：只做轻量版

**学习者**

> 我只想做轻量版的，没有那么大能力做这么重的，我做轻量版的就可以。

**最终范围**

轻量版只解决一个问题：让零基础学习者在网页中看见 Agent 每一步如何改变 State，并通过小练习确认自己真的理解。

**MVP 包含**

- 一个简单落地页和课程入口。
- 第 1 课互动流程图：`plan → work → review`。
- “执行下一步”与“重新开始”按钮。
- 当前节点和经过的 Edge 高亮。
- State 修改前后差异。
- 将循环阈值从 4 改到 6 的练习与自动检查。
- 对应真实 Python 源码和复制命令。
- 浏览器本地保存完成状态。
- 可直接部署到 Vercel。

**MVP 明确不做**

- 账号和登录。
- 数据库和跨设备进度。
- 真实模型 API 调用。
- 云端 Linux、浏览器终端和文件编辑器。
- 任意 Python 执行。
- 订阅、支付、证书和社区。

**成功标准**

一个从未接触 LangGraph 的学习者，不安装环境、不提供 API Key，仅通过网页操作，就能解释 State、Node、Edge 和条件循环，并独立完成阈值修改练习。

### Vercel 运行 Python 是否必须付费

**学习者**

> Vercel 能运行 Python 的话是不是就要收费了？

**结论**

- 不一定。Vercel Hobby 免费套餐包含 Vercel Functions，因此在免费额度内运行 Python Function 不会因为使用 Python 而单独收费。
- 当前 Hobby 每月包含约 4 CPU 小时、360 GB-hours Provisioned Memory 和 100 万次 Function 调用；超出 Hobby 限制时通常暂停相关能力，等待额度周期恢复，而不是自动按量收费。
- Hobby 官方定位为个人、非商业项目。产品进入商业运营后，应迁移到 Pro 或重新核对届时条款。
- 真正的 Agent 还会产生模型供应商 API 费用；这与 Vercel 是否免费是两笔独立成本。
- 已冻结的轻量 MVP 不调用 Python Function 和模型 API，因此初版可以是纯静态/浏览器应用。

**成本顺序**

```text
轻量互动 MVP：Vercel 静态托管，通常 $0
加入低流量 Python API：可能仍为 $0（Hobby 额度内）
加入真实 LLM：开始产生模型 API 用量费用
加入大量用户或商业运营：考虑 Vercel Pro 与限流
加入云端 Sandbox：另有计算资源费用
```

### 路线确认并开始第 1 阶段

**学习者**

> 先做不需要 API 的流程动画。再加入 /api/agent，跑真实 Python LangGraph。再加入调用限额。最后加入账号、数据库和长期记忆。就按你这个思路来。

**已完成工作**

- 在 `apps/web/` 创建 Next.js 互动教学网站。
- 建立课程源材料、四课主线、概念归属和第 1 课实验契约：`course-dev/interactive-course-plan.md`。
- 完成第 1 课单步执行和自动运行。
- 流程节点与 Edge 会随执行高亮。
- State 面板会显示 `count` 覆盖和 `log` reducer 累加。
- 完成阈值 4 → 6 的互动练习和自动验收。
- 使用 `localStorage` 保存本课完成状态。
- 嵌入与网页逻辑对应的真实 Python 代码。
- 增加后续三课路线卡片，但保持锁定状态。

**实际验证**

| 阈值 | work 次数 | 最终 count | log 长度 | 结果 |
| ---: | ---: | ---: | ---: | --- |
| 4 | 3 | 4 | 5 | 通过 |
| 6 | 5 | 6 | 7 | 通过 |

生产构建 `pnpm build` 成功，根路由被预渲染为静态页面。当前不包含模型 API、Python 服务、账号或数据库。

最终质量检查还发现并修复了 3 个 React Effect 状态更新规范问题；随后 `pnpm lint` 与 `pnpm build` 均以退出码 0 通过。课程简报补充了 Python 源码精确行号和互动流程图的教学主张、数据来源、必要标注及小屏策略。

**本轮关键产物**

- `apps/web/src/app/page.tsx`
- `apps/web/src/app/globals.css`
- `apps/web/src/lib/lesson-one.ts`
- `apps/web/README.md`
- `course-dev/interactive-course-plan.md`

**下一步**

- [ ] 由学习者亲自体验第 1 课并反馈哪里看不懂。
- [ ] 根据真实反馈修改第 1 课，而不是立即扩展复杂功能。
- [ ] 第 1 课稳定后，开始第 2 课工具循环。

### 2026-09-09｜从单个动画升级为互动文章

**学习者**

> 我想好了，这个文章还是得写，网站要做成互动动画和内容相结合的网站，你帮我把这段 idea 文字润色一下。设计一下模式。然后做第一章和第二章。

**Agent 讲解/操作**

- 将产品定位润色为“把技术文章变成可操作实验的 Agent 入门网站”
- 确定“读、动、改、证”四步教学闭环
- 第一章只讲图与 State；第二章只讲模型与工具循环，避免概念重复
- 将长文章、章节导航、互动流程、挑战和真实代码整合在同一页面
- 增加与网站视觉一致的社交分享图

**运行与验证**

- 第 1 章：阈值 4/6 的结果与 Python 实验一致
- 第 2 章：`add=477`、`word_count=5`、最终 5 条消息
- `pnpm lint`：通过
- `pnpm build`：通过，根页面静态预渲染

**本轮学会了什么**

- 核心模式：文章负责建立理解，动画负责暴露过程，挑战负责验证掌握
- 课程边界：真实 API、记忆、账号和数据库仍然留到后续阶段

**下一步**

- [ ] 学习者体验两章，反馈最想跳过和最难理解的位置
- [ ] 完成 GitHub 上传并部署到 Vercel

### 2026-09-09｜GitHub 上传准备

**学习者**

> 上传到 GitHub。

**Agent 讲解/操作**

- 检查到本地 `origin` 仍指向原作者仓库
- 启动 GitHub 官方网页登录，避免误推到原作者仓库
- 本次授权码已过期；代码尚未推送，之后需要重新发起一次 GitHub 登录

---

### 2026-09-10｜产品更名

**学习者**

> 叫 Agent hands on lab 吧。

**Agent 讲解/操作**

- 品牌统一更名为 **Agent Hands-on Lab**
- 同步更新页面、元数据、项目说明、课程规划和社交分享封面
- 保留旧名称在历史对话中的原始记录，不改写已发生的决策过程

---

### 2026-09-10｜30 课分页架构

**学习者**

> 一共有 30 课呢，考虑一下分页。

**Agent 讲解/操作**

- 将两课长页面拆成“课程目录页 + 每课独立页面”
- 首页显示 30 个课位，当前开放第 1、2 课
- 每课加入上一课、下一课、返回目录和 01–30 课次条
- 未开放课程显示锁定状态，不生成空白页面
- 第 5–30 课暂不编造标题，等待课程地图和源材料确认（当时状态；现已由 `30-lesson-curriculum-map.md` 补齐并取代）

**运行与验证**

- 首页、第 1 课、第 2 课均返回 HTTP 200
- 两条课页拥有各自的标题与摘要，不继承首页分享图片
- `pnpm lint` 与 `pnpm build` 通过，两条课页均为静态生成

---

### 2026-09-10｜先完成 00–05 Markdown 课程

**学习者**

> 然后你先把 md 文档做好。00–05 一个一个地写好，根据之前获取的优秀课程大纲和我的 Skill。00 先写总纲和环境配置，相当于前言。

**Agent 讲解/操作**

- 使用课程构建规则，先固定环境、概念归属和综合课边界，再按 00 → 05 顺序写作
- `00` 集中课程总纲、双轨学习、PowerShell、目录、uv、首次运行和密钥安全
- `01–04` 分别对应图与 State、工具循环、会话记忆、人工审批
- 原材料没有独立第 05 课，因此明确把 `05` 定义为编辑综合课，不伪造新的源码实验
- 按中文技术文章规则保持短段落、生活化类比、明确边界、可复制命令和课末验收

**运行与验证**

- 第 01、04 课脚本实跑退出码为 0
- 第 02、03 课在不调用模型的前提下完成图结构检查
- 01 的 `count=4`、5 条 log 与文稿一致
- 04 的批准/拒绝两条路径与文稿一致，且脚本不会真的删除文件
- 6 篇文稿的全部本地 Markdown 链接可解析

**关键修正**

- 根据当前 LangGraph 官方语义，修正文稿和示例注释：resume 时节点从开头重新执行，不是从 `interrupt()` 所在 Python 行原地继续

**产物**

- `content/lessons/00-preface-and-setup.md`
- `content/lessons/01-graph-and-state.md`
- `content/lessons/02-tool-loop.md`
- `content/lessons/03-memory-and-threads.md`
- `content/lessons/04-human-in-the-loop.md`
- `content/lessons/05-complete-agent-blueprint.md`
- `course-dev/00-05-figure-plan.md`

---

### 2026-09-10｜明确 30 课来源并补写 LangGraph 导读

**学习者**

> 我要明确，你的大纲是从哪里来的，30 节课有没有按照这个来？00 还要一上来就写 LangGraph 是什么，否则很多人不知道。

**Agent 讲解/操作**

- 明确纠正：此前的“30 课”只是课程容量和分页课位，真正完成来源映射的只有 00–05，不能声称完整 30 课已经来自某份优秀大纲
- 重新核对 LangChain Academy、DeepLearning.AI、Hugging Face 与 Microsoft 的官方课程目录
- 新建 `course-dev/30-lesson-curriculum-map.md`，为 01–30 分配标题、唯一主概念、主要来源和学习者证据
- 按既定产品路线把 `/api/agent`、Vercel 部署和调用限额前移到 08–10；账号、数据隔离、数据库和长期记忆放在 29–30
- 规定 00 是前言，不计入正式 01–30 课
- 重写 00 开头，先解释 LangGraph 是长期运行、有状态 Agent 的底层编排框架和运行时，并说明它不是模型或 API 服务

**本轮形成的原则**

- 外部课程决定主题覆盖和难度顺序，本地可运行代码与当前官方文档决定事实
- 不照抄任何一家课程；原创价值是中文零基础重排与“读、动、改、证”互动机制
- 每一课开写前都必须有唯一主概念、官方来源、实验契约和可检查产出

---

### 2026-09-10｜统一 00–05 的首次术语解释

**学习者**

> 单词术语第一次出现时，加上中文意思，并在本小节下面简单写它是做什么的。

**Agent 讲解/操作**

- 按每篇独立课程重新计算首次出现，不假设学习者一定从上一课顺序进入
- 将核心术语统一改成 `English（中文意思）`，并在同一句或下一句补充职责
- 覆盖 Agent、LangGraph、State、Node、Edge、Reducer、ToolNode、ReAct、MessagesState、thread、checkpoint、checkpointer、interrupt、resume、API Key 等核心术语
- 保留代码、命令、函数名和字段名原样，在相邻正文解释，不把可运行代码翻译成中文
- 将规则写入 `course-dev/interactive-course-plan.md`，供 06–30 继续复用

**审校边界**

- 本轮是定向术语可读性修改，不改变实验流程、代码结果和每课概念归属
- 品牌、路径、文件名和普通产品名不强行添加括号翻译

---

### 2026-09-10｜把术语用途改成段后引用

**学习者**

> 尝试用引用的方式，把解释放在段落后面。

**Agent 讲解/操作**

- 保留正文首次出现时的 `English（中文意思）`
- 将“它是做什么的”从正文长句移到紧邻段落后的 Markdown 引用块
- 单个术语使用 `> **术语说明｜术语**`，同一段多个术语合并为一个引用列表
- 同步处理 00–05，并把这种展示规则写入课程开发规划

**目的**

- 正文负责解释场景和机制，引用块负责快速查阅术语职责
- 减少一个段落同时承担故事、定义和用途说明造成的阅读压力

---

### 2026-09-10｜把 00–02 做成图文互动课

**学习者**

> 后续网页把术语解释隐藏起来，在关键词下加虚线，鼠标移动或点击时浮现解释。然后开发 00–02，在文章合适位置加入互动教学，图文并茂。

**Agent 讲解/操作**

- 将 Markdown 段后引用保留为可独立阅读的原稿，网页使用渐进式术语浮层。
- 新增支持鼠标悬停、键盘聚焦、手机点击和 Escape 关闭的术语组件。
- 将第 00 课接入网站，先解释 LangGraph，再提供最小流程预演和“只用网页 / 本地运行”双轨步骤器。
- 保留第 01 课的 State 单步实验与第 02 课的工具循环实验，并在首次术语处接入浮层。
- 把 00 加入课程分页，同时让首页使用已经确认的 01–30 课程地图标题。

**运行与验证**

- `pnpm lint`：通过。
- `pnpm build`：通过；首页与第 00–02 课均静态生成。
- 桌面浏览器：术语点击与 Escape 关闭、00 五步流程、双轨切换、01 State 更新、02 tool call 消息均通过。
- 手机浏览器（390 × 844）：页面无整页横向溢出，步骤器改为单列，术语浮层保持在可视宽度内。

**本轮学会了什么**

- 核心模式：正文负责叙事，浮层负责即时释义，动画负责暴露过程，挑战负责验证理解。
- 无障碍边界：术语解释不能只依赖 hover，否则手机和键盘用户无法使用。

**下一步**

- [ ] 根据 00–02 的真实使用反馈，决定是否把术语组件推广到 03–30。

---

### 2026-09-10｜转交 Claude Code 继续开发

**学习者**

> 结束之后写个进度总结，上传 GitHub，并告诉我怎样用 Claude Code 继续开发。

**Agent 讲解/操作**

- 新建 `course-dev/CLAUDE-CODE-HANDOFF.md`，记录产品定位、完成状态、验证结果、关键文件、开发约束和第 03 课建议步骤。
- 在交接文档中附上可直接粘贴给 Claude Code 的续开发提示词。
- 上传前检查 Git 远程与 GitHub 登录状态，避免把用户代码误推到原作者仓库。

**运行与验证**

- 当前 `origin` 指向 `EthanBAI-dev/Agent-Engineering-Handbook`。
- GitHub CLI 当前未登录；需要完成一次 GitHub 网页授权后创建或推送到用户自己的仓库。

**下一步**

- [ ] 完成 GitHub 授权并推送当前分支。
- [ ] 在 Claude Code 中从交接提示词开始第 03 课。

---

### 2026-09-10｜Claude Code 接手，完成第 03 课「会话记忆」

**学习者**

> 我用 codex 进行了一些开发，你可以尝试继续开发，你先读取看看，看看它进行到哪一步了？

**Agent 讲解/操作**

- 通读 `CLAUDE-CODE-HANDOFF.md`、`interactive-course-plan.md`、第 03 课文稿与 `03_memory.py`，确认下一项任务是第 03 课。
- 新增 `apps/web/src/lib/lesson-three.ts`：三条固定消息、按 thread 分组的确定性运行逻辑与通过条件判定。
- 新增 `lesson-three-lab.tsx`：thread 选择器、双列会话对照、checkpointer 说明行、`get_state` 快照面板、分配轨迹与判定反馈。
- 新增 `lesson-three-article.tsx`：按“读、动、改、证”重写正文，首次术语接入 `Term` 组件。
- `globals.css` 增加 `.thread-console`、`.thread-columns`、`.snapshot-panel`、`.thread-trace` 等样式与 820px / 600px 响应式规则。
- 课程元数据把第 03 课改为 `open` 并配 slug，第 04 课改为 `next`；课程路由与首页文案同步。
- 关键设计决定：回复文本由「这个 thread 里到底存了什么」推导，不抄写某次真实模型输出，并在页面上写明这是示意文本。
- checkpoint 按「一次调用一版」简化显示，同时注明真实 LangGraph 每个 super-step 都会写 checkpoint。

**运行与验证**

- 命令：`pnpm lint`、`pnpm build`、Playwright 驱动 Chromium 在 1440px 与 390px 下实测。
- 预期结果：四条课页静态预渲染；a / b / a 分配后 thread a 为 4 条消息、checkpoint v2，与 `03_memory.py` 末尾 `get_state` 的读数一致。
- 实际结果：全部通过。三条都放进同一个 thread 时最后一次提问会连咖啡一起看到；放进没有名字的 thread 时答不出名字；两种宽度下横向溢出均为 0px，术语浮层未越界，Escape 可关闭，控制台无报错。

**本轮学会了什么**

- 核心概念：thread 隔离不是模型的判断，而是它压根没收到另一段会话的消息；把这一点做成「可以故意分错」的实验，比正确演示更有说服力。
- 踩坑：`.term-popover` 有 150ms 过渡，自动化测试直接读 `isVisible()` 会误判为不可见，必须等待可见状态。
- 踩坑：手机端给 thread 列留最大高度会把最后一条消息切一半，堆叠布局下应取消最大高度。
- 可写进教程的素材：三种分配路线各自的失败信息，可以直接做成第 03 课的常见错误清单。

**下一步**

- [ ] 按交接文档第 6 节开发第 04 课「interrupt 与人工审批」。
- [ ] 完成 Vercel 导入，拿到公开 HTTPS URL。

---

### 2026-09-10｜术语全局提示、正文加厚，以及 06–30 课全部写完

**学习者**

> 01-02 我读了一下，互动部分我觉得不错，我现在觉得不行的部分是没和 md 文档进行结合的感觉，文字内容偏少。还有一个网站整体的问题是，术语的提示只出现在了第一次好像，我希望上面都是有提示的，即便多次重复的。
>
> 你把这个部分进行备份吧，一个是现在的版本，一个是增加正文之后的版本。然后你主攻后续文章 md 的生成。

**Agent 讲解/操作**

- 术语：新建 `apps/web/src/lib/glossary.ts`（50 余条）与 `auto-term.tsx` 自动标注，
  正文里**每一次出现**都给提示，取代原来「只解释第一次」的规则。
  跳过代码块、示意图和标题；只下钻原生标签与 Fragment。
- 正文：新建 `article-kit.tsx` 六种正文构件，按 md 把第 01 课从 900 字扩到 3600 字。
- 备份：`variants/` 保存精简版，新增 `/lessons/<slug>/brief` 对照路由。
- 课程 md：06–30 全部写完，并为其中 20 课写了可实跑示例。
- 关键决定：新建 `examples/_fake.py` 脚本化模型。第一阶段不接真实 API，
  但课程规则要求「确定数值必须来自可运行代码」——这个模型是两者的交集。

**运行与验证**

- 命令：`uv sync`、逐个 `uv run python examples/*.py`、`pnpm lint`、`pnpm build`、Playwright 实测。
- 实际结果：全量回归 23/25 通过（02、03 仅因需要真实 API Key）；
  第 01 课 41 处术语触发、State 重复 12 次且每次都能弹出、代码块内误标注为 0。

**本轮学会了什么**

- 核心概念：写课程和写代码是同一件事——不跑一遍，就会把假设当成事实。
  本轮有三处假设被实跑推翻，全部改写进了课程。
- 踩坑：`add_messages` 按消息 id 合并，两个 ScriptedModel 实例给出相同 id 会让新回答覆盖旧回答。
- 踩坑：子图只要在 schema 里**声明**了父图的累加字段，父图已有的值就会被回写并再累加一次。
- 踩坑：map-reduce 扇出为 0 时，reduce 节点根本不会执行，结果字段静默停在初始值。
- 踩坑：没有入边的节点 `compile()` 不报错、运行也不报错，就是不执行。
- 可写进教程的素材：以上四条都已成为对应课程的核心内容。

**下一步**

- [ ] 学习者判断第 01 课「精简版 vs 完整版」哪个更好，再决定 00/02/03 是否同样加厚。
- [ ] 把网页互动实现推进到第 04 课。
- [ ] Vercel 导入 `apps/web`，注意默认分支目前不含该目录。

---

## 后续记录模板

### YYYY-MM-DD｜主题

**学习者**

> 原始问题或反馈

**Agent 讲解/操作**

- 做了什么
- 为什么这样做

**运行与验证**

- 命令：
- 预期结果：
- 实际结果：

**本轮学会了什么**

- 核心概念：
- 踩坑：
- 可写进教程的素材：

**下一步**

- [ ] 下一项可执行任务
