/**
 * 第 04 课：interrupt 与人工审批。
 *
 * 所有计数都对齐 lab/langgraph/examples/04_human_in_loop.py 的实跑行为：
 *   propose（暂停点之前的节点）        执行 1 次，不重跑
 *   approval 中 interrupt 之前的代码   执行 2 次
 *   approval 中 interrupt 之后的代码   执行 1 次
 */

export type GraphNodeName = "start" | "propose" | "approval" | "report" | "end";
export type Phase = "idle" | "paused" | "done";
export type Answer = "yes" | "no";
export type SideEffectPlacement = "before" | "after";

export type Scenario = {
  id: "cache" | "passwd";
  thread: string;
  path: string;
  hint: string;
  expected: Answer;
};

export const scenarios: Scenario[] = [
  {
    id: "cache",
    thread: "t1",
    path: "/tmp/cache",
    hint: "临时缓存目录，删掉可以重建。这条适合批准。",
    expected: "yes",
  },
  {
    id: "passwd",
    thread: "t2",
    path: "/etc/passwd",
    hint: "系统账户文件，删掉机器就废了。这条必须拒绝。",
    expected: "no",
  },
];

export type LogLine = {
  id: string;
  text: string;
  tone: "normal" | "pause" | "danger" | "good";
};

export type ApprovalRun = {
  scenario: Scenario;
  placement: SideEffectPlacement;
  phase: Phase;
  current: GraphNodeName;
  visited: GraphNodeName[];
  /** 图停在哪个节点，对应 get_state(cfg).next */
  next: GraphNodeName[];
  path: string;
  result: string;
  payload?: { question: string; type: string };
  answer?: Answer;
  proposeRuns: number;
  approvalHeadRuns: number;
  approvalTailRuns: number;
  sideEffectRuns: number;
  log: LogLine[];
};

const line = (id: string, text: string, tone: LogLine["tone"] = "normal"): LogLine => ({
  id,
  text,
  tone,
});

export function createRun(scenario: Scenario, placement: SideEffectPlacement): ApprovalRun {
  return {
    scenario,
    placement,
    phase: "idle",
    current: "start",
    visited: ["start"],
    next: ["propose"],
    path: scenario.path,
    result: "",
    proposeRuns: 0,
    approvalHeadRuns: 0,
    approvalTailRuns: 0,
    sideEffectRuns: 0,
    log: [line("init", `准备用 thread_id = "${scenario.thread}" 调用图`)],
  };
}

/** 第一次 invoke：跑到 interrupt 就停住。 */
export function startRun(run: ApprovalRun): ApprovalRun {
  if (run.phase !== "idle") return run;

  const headRuns = 1;
  const sideEffectRuns = run.placement === "before" ? 1 : 0;

  const log = [
    ...run.log,
    line("propose", "propose 执行：Agent 提出要删除文件"),
    line("head-1", "approval 开始执行——interrupt 之前的代码跑了第 1 次"),
  ];
  if (run.placement === "before") {
    log.push(line("side-1", "⚠ 副作用在 interrupt 之前，已经发生 1 次", "danger"));
  }
  log.push(
    line("pause", "遇到 interrupt()：checkpointer 保存现场，图停住，问题交给图外的人", "pause"),
  );

  return {
    ...run,
    phase: "paused",
    current: "approval",
    visited: [...run.visited, "propose", "approval"],
    next: ["approval"],
    proposeRuns: 1,
    approvalHeadRuns: headRuns,
    sideEffectRuns,
    payload: { question: `确认删除 ${run.path} ?`, type: "yes/no" },
    log,
  };
}

/** Command(resume=...)：节点从开头重新执行，再走到 interrupt 时拿到答案。 */
export function resumeRun(run: ApprovalRun, answer: Answer): ApprovalRun {
  if (run.phase !== "paused") return run;

  const headRuns = run.approvalHeadRuns + 1;
  const approved = answer === "yes";
  const sideEffectRuns =
    run.placement === "before" ? headRuns : approved ? 1 : run.sideEffectRuns;

  const log = [
    ...run.log,
    line("resume", `Command(resume="${answer}") 带着同一个 thread_id 回来`),
    line(
      "head-2",
      `approval 从头重新执行——interrupt 之前的代码跑了第 ${headRuns} 次`,
      run.placement === "before" ? "danger" : "normal",
    ),
  ];
  if (run.placement === "before") {
    log.push(line("side-2", `⚠ 副作用又发生了一次，累计 ${headRuns} 次`, "danger"));
  }
  log.push(line("tail", `再次到达 interrupt()，这次它直接返回 "${answer}"`));
  if (run.placement === "after" && approved) {
    log.push(line("side-after", "副作用在批准之后才发生，共 1 次", "good"));
  }

  const result = approved ? `已删除 ${run.path}` : "已取消";
  log.push(line("result", `写入 result = ${result}`, approved ? "normal" : "good"));
  log.push(line("report", "report 执行，流程走到 END"));

  return {
    ...run,
    phase: "done",
    current: "end",
    visited: [...run.visited, "report", "end"],
    next: [],
    answer,
    result,
    approvalHeadRuns: headRuns,
    approvalTailRuns: 1,
    sideEffectRuns,
    log,
  };
}

export const graphOrder: GraphNodeName[] = ["start", "propose", "approval", "report", "end"];

export const nodeLabel: Record<GraphNodeName, string> = {
  start: "START",
  propose: "propose",
  approval: "approval",
  report: "report",
  end: "END",
};

export const nodeNote: Record<GraphNodeName, string> = {
  start: "流程入口",
  propose: "说明要做什么",
  approval: "停下来问人",
  report: "整理并输出",
  end: "流程结束",
};
