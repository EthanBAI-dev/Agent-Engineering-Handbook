---
title: "开始之前：课程总纲与环境配置"
slug: "00-preface-and-setup"
order: 0
status: "draft"
verified_at: "2026-09-10"
tested_with: "Python 3.12.10 / uv 0.11.3 / LangGraph 1.2.11"
---

# 开始之前：课程总纲与环境配置

> 本课结果：选好学习路径，找到终端，进入正确目录，并运行第一个不需要模型接口密钥的课程程序。

## LangGraph（智能体流程编排框架）到底是什么

先想象一个普通聊天机器人：你问一句，它回答一句，这次请求就结束了。

但一个真正做事的 Agent（智能体）往往不能一步完成任务。它可能要先理解目标，再查询资料、调用工具、检查结果；遇到删除文件、发送邮件这类危险动作时，还应该停下来等人批准。任务失败后，它最好能保留现场，而不是从头再来。

Agent 的作用是围绕目标选择步骤、调用工具，并根据结果继续行动。

**LangGraph 就是用来组织这类多步骤 Agent 的。**

按照官方定义，LangGraph 是一个用于构建、管理和部署“长期运行、有状态 Agent”的底层编排框架和运行时。你可以把每一步写成 Node（节点），用 Edge（边）规定下一步去哪，再用 State（运行状态）保存流程中的消息和数据。

LangGraph 负责组织执行顺序、保存运行现场，并支持暂停和恢复；Node（节点）完成流程中的一小步工作；Edge（边）规定完成当前节点后去哪里；State（运行状态）保存流程中的消息和共享数据。

最小结构可以先记成：

```text
输入 → 节点 → 更新 State → 选择下一条 Edge → 下一个节点 → 输出
```

LangGraph 不是大模型，也不提供模型额度。它更像 Agent 的“流程控制器”：模型负责理解和生成，工具负责执行动作，LangGraph 负责让这些步骤按可观察、可暂停、可恢复的方式协作。

因此，这门课不会只教你做一个聊天框。你会逐步做出能调用工具、保存会话、等待审批、失败恢复并最终部署成网站服务的 Agent。

官方说明：[LangGraph overview](https://docs.langchain.com/oss/python/langgraph/overview)

## 这门课适合零基础吗

这门课不要求你先学完 Python（本课程示例使用的编程语言），也不要求你一开始就购买模型 API（应用程序编程接口）额度。

Python 用来运行本地课程实验；模型 API 让程序通过网络调用大模型服务。

你可以先在网页里看懂流程，再到本地运行同一份 Python 代码。两条路最终会在同一个 Agent 项目里会合。

## 这 30 课最后要做出什么

我们的终点不是背会一串名词。

你会从一张最小流程图出发，逐步加上工具、会话记忆、人工审批、真实模型、调用限额、账号和数据库。最后得到一个能运行、能观察、能控制成本，也知道什么时候必须停下来问人的 Agent。

第 00 课是前言；它和第 01–05 课共同构成学习起步段：

1. 第 00 课：认识课程，完成环境配置
2. 第 01 课：看懂 State、Node、Edge 和循环
3. 第 02 课：让 model（模型节点）决定是否调用 tools（工具节点）
4. 第 03 课：用 thread（会话线程）和 checkpoint（状态快照）保存会话
5. 第 04 课：在危险操作前暂停并等待审批
6. 第 05 课：把前四种能力拼成第一个完整 Agent 蓝图

model（模型节点）判断下一步做什么；tools（工具节点）执行真实函数；thread（会话线程）区分不同会话；checkpoint（状态快照）保存某一时刻的运行现场。

完整课程分成六个单元：可视化基础、真实模型、状态与短期记忆、可控与可靠工作流、高级 Agent 模式、部署与产品化。第 01–30 课的逐课标题、来源和产出见[《30 课课程地图与来源说明》](../../course-dev/30-lesson-curriculum-map.md)。

这不是照抄某一家课程：LangChain Academy 提供 LangGraph 的主概念顺序，DeepLearning.AI 提供“从零实现到完整项目”的实践路径，Hugging Face 提供“入门—原理—框架—用例—结课项目”的学习闭环，Microsoft 课程补充设计模式、可信性和生产化主题。我们再把它们改造成适合中文初学者的“读、动、改、证”互动课程。

## 你有两条学习路径

### 路径 A：先用网页理解

如果你从没打开过终端，先走这条路。

网页会把当前节点、刚走过的 Edge 和 State 的变化同时显示出来。你每次只执行一步，不需要安装 Python，也不需要 API Key（接口密钥）。

API Key 的作用是证明调用者有权使用模型服务，并把调用费用记到对应账户。

这条路径解决的是“我到底在看什么”。它不能替代真实代码，但能让你第一次打开代码时不再面对一堵墙。

### 路径 B：在本地运行 Python

如果你愿意动手，就在读完每课后运行对应脚本。

本地实验会让你看到真实 LangGraph 的输出、错误和环境问题。第 01、04 课不需要模型 API；第 02、03 课需要模型 API 才能完成真实对话。

推荐顺序是：先看网页动画，再运行代码，最后完成课后挑战。

## 终端到底是什么

终端就是一个“用文字操作电脑”的窗口。

你平时通过鼠标打开文件夹；在终端里，你可以输入命令进入文件夹或运行程序。它不是黑客工具，也不会因为打开就修改电脑。

在 Windows 里，按下 `Win` 键，搜索 **PowerShell（Windows 命令行工具）**，然后打开它。

PowerShell 用来输入课程命令、进入目录和运行程序。

看到类似下面的一行，就说明终端已经打开：

```text
PS C:\Users\你的名字>
```

光标闪烁的位置就是输入命令的位置。每输入一行，按一次 Enter。

## 先检查三个工具

在 PowerShell 中逐行运行：

```powershell
python --version
uv --version
git --version
```

这三条命令分别检查 Python、uv（Python 环境与依赖管理器）和 Git（版本控制工具）。

uv 用来安装并管理项目需要的软件包和环境；Git 用来下载项目并记录文件变化。

这套课程当前验证环境是：

```text
Python 3.12.10
uv 0.11.3
LangGraph 1.2.11
```

Python 建议使用 3.12。小版本不必完全相同，但 `python --version` 至少要能正常输出版本号。

如果某条命令提示“无法识别”，先不要同时修三个问题。记下出错的那一条，只处理它。

## 进入实验目录

命令只能在正确的文件夹里运行。

这就像你要打开厨房里的盐，得先走进厨房。终端里的“当前目录”，就是你现在站在哪个文件夹。

在当前电脑上运行：

```powershell
Set-Location -LiteralPath 'D:\Projects\AIagent\Agent-Engineering-Handbook\lab\langgraph'
```

然后检查位置：

```powershell
Get-Location
```

你应该看到路径以 `Agent-Engineering-Handbook\lab\langgraph` 结尾。

如果你以后把项目移动到别处，这条路径也要跟着改。不要在 `C:\Users\你的名字` 里直接运行课程脚本。

## 让 uv 准备环境

这个项目使用 `uv` 管理 Python 版本、虚拟环境和依赖。

这样可以让每位学习者尽量使用同一套可复现的软件环境。

你不需要自己创建虚拟环境，也不需要手动执行 `activate`。在实验目录中运行：

```powershell
uv sync
```

`uv` 会读取项目里的 `pyproject.toml` 和锁文件，准备课程需要的依赖。第一次运行会下载文件，时间取决于网络。

看到命令结束并重新出现 `PS ...>` 提示符，就说明这一步已经完成。警告不一定是失败；真正需要处理的是最后明确写着 `error` 或非零退出的信息。

## 运行第一个程序

现在运行：

```powershell
uv run python examples/01_hello_graph.py
```

这段程序不调用模型，因此不需要 API Key，也不会产生模型费用。

成功时，你会先看到每个节点的输出，最后看到类似：

```text
最终 state:
  topic = 学 LangGraph
  count = 4
```

暂时不懂 `state` 和 `count` 没关系。第 01 课会把它们拆开来看。

## API Key 什么时候才需要

第 02、03 课会调用真实模型。到那时才需要配置 API Key。

先复制环境变量模板：

```powershell
Copy-Item -LiteralPath '.env.example' -Destination '.env'
```

然后用文本编辑器打开 `.env`，把自己的 key 填在等号后面：

```text
ANTHROPIC_API_KEY=你的真实密钥
```

`.env` 已经被 Git 忽略，不会正常进入仓库。但你仍然要遵守三条规则：

- 不要把真实 key 发到聊天里
- 不要把 key 写进 Python、Markdown 或前端代码
- 不要截图公开带有 key 的终端和编辑器

网页模拟课程不需要这一步。没有 key 时，照样可以完成第 00、01、04 课和前两课的网页动画。

## macOS 或 Linux 怎么做

代码和学习顺序完全相同，只有进入目录和复制文件的命令不同。

进入你下载的仓库后运行：

```bash
cd Agent-Engineering-Handbook/lab/langgraph
uv sync
uv run python examples/01_hello_graph.py
```

需要 API Key 时复制模板：

```bash
cp .env.example .env
```

不要把 Windows 的 `Copy-Item` 原样复制到 macOS，也不要把 macOS 的 `cp` 当成 PowerShell 教程的唯一写法。

## 最常见的四个问题

### `python` 或 `uv` 无法识别

工具没有安装，或者安装后终端还没有刷新。

先关闭 PowerShell，再重新打开并检查版本。如果仍然失败，再单独处理那一个工具。

### 提示找不到 `pyproject.toml`

你站错目录了。

重新运行本课的 `Set-Location` 和 `Get-Location`，确认路径以 `lab\langgraph` 结尾。

### 中文输出报 `UnicodeEncodeError`

这是部分中文或日文 Windows 终端的编码问题，不是 LangGraph 逻辑出错。

课程中的无模型示例已经主动把输出切到 UTF-8。如果你改写脚本后又遇到它，保留下面这行：

```python
sys.stdout.reconfigure(encoding="utf-8")
```

### 第 02、03 课提示缺少 API Key

先确认你是否真的要运行真实模型。

如果只是学习结构，使用网页动画即可。如果要运行 Python，再检查 `.env` 是否位于 `lab/langgraph`，变量名是否为 `ANTHROPIC_API_KEY`。

## 完成本课的标准

离开第 00 课之前，确认下面四件事：

- 你知道 PowerShell 在哪里打开
- `python --version` 和 `uv --version` 能输出结果
- `Get-Location` 显示你在 `lab\langgraph`
- `uv run python examples/01_hello_graph.py` 能运行到 `最终 state`

如果四项都满足，环境已经够用。不要继续优化终端主题，也不要安装一堆本课用不到的工具。

## 下一课

环境已经能跑了。下一步不是接模型，而是看懂这张图为什么会一步一步向前走。

[进入第 01 课：Agent 不是一次回答，而是一条会改变 State 的路](01-graph-and-state.md)
