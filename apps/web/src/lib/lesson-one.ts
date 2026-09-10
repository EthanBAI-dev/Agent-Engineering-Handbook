export type GraphNode = "start" | "plan" | "work" | "review" | "end";
export type RouteName =
  | "start-plan"
  | "plan-work"
  | "work-loop"
  | "work-review"
  | "review-end";

export type LessonState = {
  topic: string;
  count: number;
  log: string[];
};

export type StepRecord = {
  executed: "plan" | "work" | "review" | "end";
  route: RouteName;
  before: LessonState;
  after: LessonState;
  explanation: string;
};

export const initialState: LessonState = {
  topic: "学 LangGraph",
  count: 0,
  log: [],
};

const cloneState = (state: LessonState): LessonState => ({
  ...state,
  log: [...state.log],
});

export function advanceGraph(
  current: GraphNode,
  state: LessonState,
  threshold: number,
): { current: GraphNode; state: LessonState; record: StepRecord } {
  const before = cloneState(state);

  if (current === "start") {
    const after = {
      ...before,
      count: before.count + 1,
      log: [...before.log, `planning: ${before.topic}`],
    };
    return {
      current: "plan",
      state: after,
      record: {
        executed: "plan",
        route: "start-plan",
        before,
        after,
        explanation: "plan 读取 State：count 覆盖为新值，log 通过 reducer 追加一项。",
      },
    };
  }

  if (current === "plan" || (current === "work" && state.count < threshold)) {
    const after = {
      ...before,
      count: before.count + 1,
      log: [...before.log, `work pass #${before.count}`],
    };
    return {
      current: "work",
      state: after,
      record: {
        executed: "work",
        route: current === "plan" ? "plan-work" : "work-loop",
        before,
        after,
        explanation:
          current === "plan"
            ? "固定 Edge 把流程交给 work。"
            : `条件 ${before.count} < ${threshold} 成立，所以 work 再执行一次。`,
      },
    };
  }

  if (current === "work") {
    const after = {
      ...before,
      log: [...before.log, "review"],
    };
    return {
      current: "review",
      state: after,
      record: {
        executed: "review",
        route: "work-review",
        before,
        after,
        explanation: `条件 ${before.count} < ${threshold} 不成立，流程转向 review。`,
      },
    };
  }

  return {
    current: "end",
    state: before,
    record: {
      executed: "end",
      route: "review-end",
      before,
      after: before,
      explanation: "review 完成后沿固定 Edge 到达 END，图停止执行。",
    },
  };
}

export function countWorkPasses(history: StepRecord[]) {
  return history.filter((step) => step.executed === "work").length;
}

