export type ToolGraphNode = "start" | "model" | "tools" | "end";
export type ToolRoute =
  | "start-model"
  | "model-tools"
  | "tools-model"
  | "model-end";

export type DemoMessage = {
  id: string;
  role: "user" | "assistant" | "tool";
  label: string;
  content: string;
  toolName?: "add" | "word_count";
};

export type ToolLessonState = {
  step: 0 | 1 | 2 | 3 | 4;
  current: ToolGraphNode;
  messages: DemoMessage[];
  lastRoute?: ToolRoute;
  explanation: string;
};

export const toolQuestion =
  "先算 128 加 349，再数一下 ‘the quick brown fox jumps’ 有几个词。";

export const createInitialToolState = (): ToolLessonState => ({
  step: 0,
  current: "start",
  messages: [
    {
      id: "user-question",
      role: "user",
      label: "你",
      content: toolQuestion,
    },
  ],
  explanation: "请求已经进入 MessagesState。下一步由 model 判断是否需要工具。",
});

export function advanceToolGraph(state: ToolLessonState): ToolLessonState {
  if (state.step === 0) {
    return {
      ...state,
      step: 1,
      current: "model",
      lastRoute: "start-model",
      messages: [
        ...state.messages,
        {
          id: "assistant-calls",
          role: "assistant",
          label: "model · tool call",
          content: "请求调用 add(128, 349) 和 word_count(text)。",
        },
      ],
      explanation: "model 没有亲自计算。它只生成结构化的 tool call，说明想调用什么。",
    };
  }

  if (state.step === 1) {
    return {
      ...state,
      step: 2,
      current: "tools",
      lastRoute: "model-tools",
      messages: [
        ...state.messages,
        {
          id: "tool-add",
          role: "tool",
          label: "tools · result",
          toolName: "add",
          content: "477",
        },
        {
          id: "tool-count",
          role: "tool",
          label: "tools · result",
          toolName: "word_count",
          content: "5",
        },
      ],
      explanation: "ToolNode 真正执行两个函数，并把结果作为 ToolMessage 追加到 messages。",
    };
  }

  if (state.step === 2) {
    return {
      ...state,
      step: 3,
      current: "model",
      lastRoute: "tools-model",
      messages: [
        ...state.messages,
        {
          id: "assistant-answer",
          role: "assistant",
          label: "model · final answer",
          content: "128 + 349 = 477；这句话有 5 个词。",
        },
      ],
      explanation: "tools → model 把结果送回来。model 读取新消息后，组织最终回答。",
    };
  }

  return {
    ...state,
    step: 4,
    current: "end",
    lastRoute: "model-end",
    explanation: "这次 model 没有再发出 tool call，条件边因此把流程送到 END。",
  };
}

