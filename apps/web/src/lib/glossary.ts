/**
 * 全站术语表。
 *
 * 规则：正文里每一次出现都给提示，不再只解释第一次。
 * surfaces 是这个术语在正文中可能出现的写法，自动标注按「最长优先」匹配。
 * 解释保持一到两句话，回答「它是做什么的」，不做字面翻译。
 */
export type GlossaryEntry = {
  surfaces: string[];
  definition: string;
};

export const glossary: GlossaryEntry[] = [
  // —— 框架与角色 ——
  {
    surfaces: ["LangGraph（智能体流程编排框架）", "LangGraph"],
    definition: "按图组织节点的运行顺序，保存运行现场，并支持分支、循环、暂停和恢复。它不是大模型。",
  },
  {
    surfaces: ["Agent（智能体）", "Agent"],
    definition: "围绕一个目标选择步骤、调用工具，并根据结果决定下一步，而不是只回答一句话。",
  },
  {
    surfaces: ["Python（编程语言）", "Python"],
    definition: "运行本课代码的编程语言；工具函数最终由它真正执行。",
  },

  // —— 第 01 课：图与 State ——
  {
    surfaces: ["State（运行状态）", "State"],
    definition: "保存当前运行现场的数据；每个节点都读它，也都往里写回一小块变化。",
  },
  {
    surfaces: ["Node（节点）", "Node"],
    definition: "读取 State、完成一种明确动作，再返回需要更新的字段。它不决定下一站是谁。",
  },
  {
    surfaces: ["Edge（边）", "Edge"],
    definition: "连接节点，决定流程固定前进、条件分支、循环，还是结束。",
  },
  {
    surfaces: ["Reducer（归并规则）", "reducer（归并规则）", "Reducer", "reducer"],
    definition: "规定新值怎样与旧 State 合并：是用新值覆盖，还是接在旧值后面累加。",
  },
  {
    surfaces: ["TypedDict（类型字典）", "TypedDict"],
    definition: "规定 State 有哪些字段，以及每个字段是什么数据类型。",
  },
  {
    surfaces: ["Annotated（附加规则标注）", "Annotated"],
    definition: "在类型之外，再给某个字段绑定额外的合并规则。",
  },
  {
    surfaces: ["operator.add"],
    definition: "作为列表字段的 Reducer，把新列表接在旧列表后面，而不是覆盖它。",
  },
  {
    surfaces: ["StateGraph（状态图）", "StateGraph"],
    definition: "声明一张图：往里加节点、加边，最后编译成可以调用的应用。",
  },
  {
    surfaces: ["START（图入口）", "START"],
    definition: "标记流程从哪里开始，不是你写的业务函数。",
  },
  {
    surfaces: ["END（图出口）", "END"],
    definition: "标记流程在哪里结束，不是你写的业务函数。",
  },
  {
    surfaces: ["add_conditional_edges"],
    definition: "先运行一个判断函数，再根据它的返回值选择下一站；循环就是这样造出来的。",
  },
  {
    surfaces: ["add_edge"],
    definition: "固定连接两个节点，下一站只有一个，不需要判断。",
  },
  {
    surfaces: ["should_continue"],
    definition: "本课的判断函数：读取更新后的 State，返回下一站应该是 work 还是 review。",
  },
  {
    surfaces: ["compile（编译图）", "compile"],
    definition: "把节点、边和 checkpointer 组合成一个可以真正调用的应用。",
  },
  {
    surfaces: ["stream（逐步流式运行）", "stream"],
    definition: "逐步返回每个节点的输出，用来观察运行过程而不是只看结果。",
  },
  {
    surfaces: ["invoke（完整调用）", "invoke"],
    definition: "执行一次完整调用，一直跑到结束或暂停位置，取得最终结果。",
  },

  // —— 第 02 课：工具循环 ——
  {
    surfaces: ["model（模型节点）", "model"],
    definition: "读取消息，决定直接回答还是生成工具调用请求；它不亲自执行 Python 函数。",
  },
  {
    surfaces: ["tools（工具节点）", "tools"],
    definition: "承载并执行工具函数的节点，把真实结果写回消息列表。",
  },
  {
    surfaces: ["tool call（工具调用请求）", "tool call"],
    definition: "写明「想调用哪个工具、传什么参数」的结构化请求，由模型生成。",
  },
  {
    surfaces: ["tool result（工具返回结果）", "tool result"],
    definition: "工具真正执行后得到的结果，会被送回 model 供它继续判断。",
  },
  {
    surfaces: ["ToolNode（工具执行节点）", "ToolNode"],
    definition: "读取最后一条模型消息里的 tool call，找到并执行对应函数，再生成一条工具消息。",
  },
  {
    surfaces: ["@tool（工具装饰器）", "@tool"],
    definition: "把普通函数包装成模型可识别的工具：提取函数名、参数和说明，让模型知道它何时可用。",
  },
  {
    surfaces: ["bind_tools（绑定工具说明）", "bind_tools"],
    definition: "只是把工具说明交给模型，让它能生成合法的调用请求；它本身不执行任何工具。",
  },
  {
    surfaces: ["tools_condition（工具路由条件）", "tools_condition"],
    definition: "检查最后一条模型消息里有没有 tool call，据此决定去 tools 还是去 END。",
  },
  {
    surfaces: ["MessagesState（消息状态）", "MessagesState"],
    definition: "LangGraph 内置的 State，按顺序保存用户、模型和工具消息，让下一次判断看得见前文。",
  },
  {
    surfaces: ["messages（消息列表）", "messages"],
    definition: "保存用户、模型和工具之间来往记录的字段；它只追加，不覆盖。",
  },
  {
    surfaces: ["HumanMessage（用户消息）", "HumanMessage"],
    definition: "消息列表里代表用户提问的那一条。",
  },
  {
    surfaces: ["AIMessage（模型消息）", "AIMessage"],
    definition: "消息列表里代表模型输出的那一条：可能是最终回答，也可能是一个工具调用请求。",
  },
  {
    surfaces: ["ToolMessage（工具消息）", "ToolMessage"],
    definition: "消息列表里代表工具执行结果的那一条，由 ToolNode 生成。",
  },
  {
    surfaces: ["ReAct（推理—行动循环）", "ReAct"],
    definition: "让模型反复经历「判断下一步—执行工具—观察结果」，直到能给出最终回答。",
  },
  {
    surfaces: ["create_react_agent（预构建 ReAct Agent 工厂函数）", "create_react_agent"],
    definition: "官方预构建的工厂函数，一行生成常见的模型—工具循环；先能手画这张图，再用它才不像魔法。",
  },
  {
    surfaces: ["model.invoke（调用模型方法）", "model.invoke"],
    definition: "把当前消息列表发送给模型，取得一条新的模型消息。",
  },

  // —— 第 03 课：会话记忆 ——
  {
    surfaces: ["checkpointer（检查点保存器）", "checkpointer"],
    definition: "负责在图运行的每一步保存和读取状态快照的组件。",
  },
  {
    surfaces: ["checkpoint（状态快照）", "checkpoint"],
    definition: "图在某一步的快照，包含当时的 State 和继续运行所需要的位置信息。",
  },
  {
    surfaces: ["thread_id（会话标识）", "thread_id"],
    definition: "一段会话的编号。带同一个编号进来就接着上次，换一个编号就是全新对话。",
  },
  {
    surfaces: ["thread（会话线程）", "thread"],
    definition: "一段独立的对话，由 thread_id 区分；不同 thread 的消息互相看不见。",
  },
  {
    surfaces: ["InMemorySaver（内存检查点保存器）", "InMemorySaver"],
    definition: "把快照暂存在当前 Python 进程内存里，进程一退就清空；够学习用，不是生产存储。",
  },
  {
    surfaces: ["get_state（读取状态方法）", "get_state"],
    definition: "读取指定会话最近保存的 State，让你直接检查里面到底存了什么。",
  },
  {
    surfaces: ["app.invoke（调用图方法）", "app.invoke"],
    definition: "把输入和会话配置交给整张图，运行到结束或暂停位置。",
  },
  {
    surfaces: ["configurable"],
    definition: "调用图时传运行配置的地方，thread_id 就放在这里面。",
  },
  {
    surfaces: ["super-step"],
    definition: "图向前推进的一轮；LangGraph 在每个 super-step 之后写一次 checkpoint。",
  },

  // —— 环境与安全 ——
  {
    surfaces: ["ANTHROPIC_API_KEY"],
    definition: "验证程序是否有权调用 Anthropic 模型服务的环境变量。",
  },
  {
    surfaces: ["API Key（接口密钥）", "API Key"],
    definition: "证明程序有权使用某项在线服务，并把用量记到对应账户；真实密钥只能放在服务端或本地环境变量里。",
  },
  {
    surfaces: ["API（应用程序编程接口）"],
    definition: "让程序之间交换请求和结果的接口，Agent 靠它连接数据库和外部服务。",
  },
  {
    surfaces: ["环境变量"],
    definition: "保存在系统里、程序运行时读取的配置值；用它存放密钥，就不必把密钥写进代码。",
  },
  {
    surfaces: ["uv（Python 环境与依赖管理器）", "uv"],
    definition: "安装和管理 Python 版本与项目依赖的工具，课程用它准备本地环境。",
  },
  {
    surfaces: ["PowerShell（Windows 命令行工具）", "PowerShell"],
    definition: "Windows 自带的命令行工具，用来进入目录、检查软件和运行课程脚本。",
  },
  {
    surfaces: ["终端"],
    definition: "用文字操作电脑的窗口：你在里面输入命令，程序把输出打回来。",
  },
  {
    surfaces: ["工作目录"],
    definition: "终端当前所在的文件夹。命令在哪个目录执行，往往决定它能不能找到文件。",
  },
];

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** 最长优先，避免 MessagesState 被拆成 State、checkpointer 被拆成 checkpoint。 */
const surfaceIndex = glossary
  .flatMap((entry) => entry.surfaces.map((surface) => ({ surface, definition: entry.definition })))
  .sort((a, b) => b.surface.length - a.surface.length);

export const definitionOf = (surface: string) =>
  surfaceIndex.find((item) => item.surface === surface)?.definition;

export const createGlossaryPattern = () =>
  new RegExp(surfaceIndex.map((item) => escapeRegExp(item.surface)).join("|"), "g");
