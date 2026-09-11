/**
 * 第 05 课：把 01–04 的部件拼成完整蓝图。
 *
 * 这一课不引入新 API，考的是组合与边界判断。通过标准不是「画得和示例一样」，
 * 而是 content/lessons/05-complete-agent-blueprint.md 里那五条约束全部成立。
 */

export type CardId =
  | "model"
  | "safe_tools"
  | "approval"
  | "risky_tools"
  | "report";

export type SlotId = "entry" | "safe" | "danger" | "approved" | "rejected";

export type Card = { id: CardId; label: string; note: string };

export const cards: Card[] = [
  { id: "model", label: "model", note: "读消息，决定下一步" },
  { id: "safe_tools", label: "safe_tools", note: "只读、可逆的工具" },
  { id: "approval", label: "approval", note: "停下来等人点头" },
  { id: "risky_tools", label: "risky_tools", note: "会产生副作用的工具" },
  { id: "report", label: "report", note: "整理并输出结果" },
];

export const cardById = (id: CardId) => cards.find((c) => c.id === id)!;

export type Slot = { id: SlotId; from: string; label: string; hint: string };

export const slots: Slot[] = [
  { id: "entry", from: "START →", label: "第一个节点", hint: "谁来读消息、决定下一步？" },
  { id: "safe", from: "model 普通调用 →", label: "普通工具", hint: "只读操作走哪里？" },
  { id: "danger", from: "model 危险调用 →", label: "危险调用之前", hint: "删除动作先经过谁？" },
  { id: "approved", from: "批准 →", label: "批准之后", hint: "人点头之后才执行什么？" },
  { id: "rejected", from: "拒绝 →", label: "拒绝之后", hint: "拒绝也要有一条安全路径" },
];

/** safe_tools 执行完之后去哪：这条边决定循环闭不闭合。 */
export type ReturnEdge = "model" | "report" | "end";

export const returnEdges: { id: ReturnEdge; label: string }[] = [
  { id: "model", label: "回到 model" },
  { id: "report", label: "去 report" },
  { id: "end", label: "直接 END" },
];

export type Blueprint = {
  placed: Partial<Record<SlotId, CardId>>;
  safeReturn: ReturnEdge | null;
  checkpointer: boolean;
  sameThread: boolean;
};

export const emptyBlueprint = (): Blueprint => ({
  placed: {},
  safeReturn: null,
  checkpointer: false,
  sameThread: false,
});

export type Check = {
  id: string;
  label: string;
  passed: boolean;
  /** 没通过时告诉学习者去看哪里，而不是直接给答案。 */
  hint: string;
};

export function evaluate(bp: Blueprint): Check[] {
  const { placed, safeReturn, checkpointer, sameThread } = bp;
  return [
    {
      id: "loop",
      label: "safe_tools 执行后回到 model",
      passed: placed.safe === "safe_tools" && safeReturn === "model",
      hint:
        placed.safe !== "safe_tools"
          ? "普通调用那一格还没放上 safe_tools。"
          : "工具结果不回到 model，模型就看不到它——第 02 课那条回边。",
    },
    {
      id: "gate",
      label: "删除动作先进入 approval",
      passed: placed.danger === "approval",
      hint: "危险调用那一格如果直接放 risky_tools，副作用在人点头之前就发生了。",
    },
    {
      id: "reject",
      label: "approval 拒绝后不进入 risky_tools",
      passed: placed.rejected === "report" && placed.approved === "risky_tools",
      hint:
        placed.rejected === "risky_tools"
          ? "拒绝路径不能碰任何副作用。"
          : "拒绝之后要有一条安全的结束路径，批准之后才执行危险工具。",
    },
    {
      id: "checkpointer",
      label: "图带有 checkpointer",
      passed: checkpointer,
      hint: "没有它，interrupt 停下来之后没有地方记住停在哪——第 04 课的前提。",
    },
    {
      id: "thread",
      label: "暂停与恢复使用同一个 thread_id",
      passed: sameThread,
      hint: "换一个 thread_id，恢复时找不到原来那份现场——第 03 课的结论。",
    },
  ];
}

export const allPassed = (checks: Check[]) => checks.every((c) => c.passed);

/** 已经放进图里的卡片不再出现在待选区。 */
export const remainingCards = (bp: Blueprint) => {
  const used = new Set(Object.values(bp.placed));
  return cards.filter((c) => !used.has(c.id));
};
