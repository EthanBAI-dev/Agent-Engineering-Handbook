export const TOTAL_LESSONS = 30;

export type CourseLesson = {
  number: number;
  slug?: string;
  title: string;
  shortTitle: string;
  description: string;
  status: "open" | "next" | "planned";
  duration?: string;
};

export const prefaceLesson: CourseLesson = {
  number: 0,
  slug: "00-preface-and-setup",
  title: "先知道 LangGraph 是什么，再把第一张图跑起来",
  shortTitle: "前言与环境",
  description: "认识 LangGraph，选择网页或本地路径，并完成第一次运行。",
  status: "open",
  duration: "12 分钟",
};

const definedLessons: CourseLesson[] = [
  {
    number: 1,
    slug: "01-graph-and-state",
    title: "Agent 不是一次回答，而是一条会改变 State 的路",
    shortTitle: "图与 State",
    description: "看懂 State、Node、Edge 和条件循环。",
    status: "open",
    duration: "8 分钟",
  },
  {
    number: 2,
    slug: "02-tool-loop",
    title: "模型不会亲手算：它先决定要不要调用工具",
    shortTitle: "工具循环",
    description: "跟着 tool call 和 tool result 走完 ReAct 闭环。",
    status: "open",
    duration: "10 分钟",
  },
  {
    number: 3,
    slug: "03-memory-and-threads",
    title: "同一个 thread 为什么记得，换一个就忘了",
    shortTitle: "会话记忆",
    description: "理解 checkpoint、thread_id 和恢复。",
    status: "open",
    duration: "9 分钟",
  },
  {
    number: 4,
    title: "Agent 怎样暂停，等人类批准后再继续",
    shortTitle: "人工审批",
    description: "理解 interrupt、resume 与安全边界。",
    status: "next",
  },
  {
    number: 5,
    title: "把四块拼起来：设计你的第一个完整 Agent",
    shortTitle: "完整 Agent 蓝图",
    description: "组合图、工具、会话记忆与人工审批。",
    status: "planned",
  },
  { number: 6, title: "模型、Prompt 与 Messages", shortTitle: "模型与消息", description: "分清模型与编排器的职责。", status: "planned" },
  { number: 7, title: "安全连接第一个模型 API", shortTitle: "连接模型 API", description: "在服务端安全完成真实调用。", status: "planned" },
  { number: 8, title: "建立 /api/agent 并部署到 Vercel", shortTitle: "Agent API", description: "让网页连接 Python LangGraph。", status: "planned" },
  { number: 9, title: "Streaming：让用户看见 Agent 正在做什么", shortTitle: "流式事件", description: "逐步显示 token、节点和工具事件。", status: "planned" },
  { number: 10, title: "调用限额、成本与第一个在线 Agent", shortTitle: "限额与成本", description: "保护 API 预算和在线服务。", status: "planned" },
  { number: 11, title: "Router 与结构化输出", shortTitle: "Router", description: "让请求进入可验证的正确分支。", status: "planned" },
  { number: 12, title: "State Schema：给状态定合同", shortTitle: "State Schema", description: "明确输入、输出与字段边界。", status: "planned" },
  { number: 13, title: "Reducer：并行更新怎样合并", shortTitle: "Reducer", description: "比较覆盖、追加和自定义合并。", status: "planned" },
  { number: 14, title: "消息太长怎么办", shortTitle: "上下文管理", description: "裁剪、过滤和总结消息。", status: "planned" },
  { number: 15, title: "持久化会话项目", shortTitle: "持久化会话", description: "进程重启后恢复并切换 thread。", status: "planned" },
  { number: 16, title: "审批策略：什么动作必须问人", shortTitle: "审批策略", description: "按风险分配自动、审批与禁止。", status: "planned" },
  { number: 17, title: "人工修改 State 与反馈", shortTitle: "编辑 State", description: "修改参数后从 checkpoint 继续。", status: "planned" },
  { number: 18, title: "Time Travel：回到旧状态再走一遍", shortTitle: "Time Travel", description: "回放旧状态并分叉新结果。", status: "planned" },
  { number: 19, title: "Retry、错误节点与幂等性", shortTitle: "错误恢复", description: "安全重试有副作用的步骤。", status: "planned" },
  { number: 20, title: "项目：可信文件整理 Agent", shortTitle: "可信 Agent 项目", description: "验收批准、拒绝和失败恢复。", status: "planned" },
  { number: 21, title: "Parallelization：能同时做的不要排队", shortTitle: "并行分支", description: "比较串行和并行时间线。", status: "planned" },
  { number: 22, title: "Map-reduce：批量处理再汇总", shortTitle: "Map-reduce", description: "扇出处理多份材料再汇聚。", status: "planned" },
  { number: 23, title: "Subgraph：把复杂图拆成部件", shortTitle: "Subgraph", description: "封装并复用子流程。", status: "planned" },
  { number: 24, title: "Planner–Executor：先规划再执行", shortTitle: "Planner–Executor", description: "检查计划并在失败后重排。", status: "planned" },
  { number: 25, title: "Multi-Agent：什么时候才需要多个 Agent", shortTitle: "Multi-Agent", description: "判断多角色协作是否值得。", status: "planned" },
  { number: 26, title: "Search 与 Agentic RAG", shortTitle: "Search 与 RAG", description: "检索外部知识并标注来源。", status: "planned" },
  { number: 27, title: "测试、Evaluation 与 Observability", shortTitle: "评测与观测", description: "用数据集定位失败路径。", status: "planned" },
  { number: 28, title: "工具权限、提示注入与安全边界", shortTitle: "安全边界", description: "阻止越权调用和恶意输入。", status: "planned" },
  { number: 29, title: "账号、身份与数据隔离", shortTitle: "账号与隔离", description: "确保用户不能读取他人会话。", status: "planned" },
  { number: 30, title: "数据库、长期记忆与毕业项目", shortTitle: "长期记忆", description: "跨会话保存资料并完成最终验收。", status: "planned" },
];

export const courseLessons: CourseLesson[] = Array.from(
  { length: TOTAL_LESSONS },
  (_, index) => {
    const number = index + 1;
    return definedLessons.find((lesson) => lesson.number === number)!;
  },
);

export const openLessons = courseLessons.filter((lesson) => lesson.status === "open");
export const availableLessons = [prefaceLesson, ...openLessons];

export function getLessonBySlug(slug: string) {
  return availableLessons.find((lesson) => lesson.slug === slug);
}

export function lessonHref(lesson: CourseLesson) {
  return lesson.slug ? `/lessons/${lesson.slug}` : undefined;
}
