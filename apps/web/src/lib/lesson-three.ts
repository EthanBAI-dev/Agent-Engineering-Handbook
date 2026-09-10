export type ThreadId = "a" | "b";

export type ThreadMessage = {
  id: string;
  role: "user" | "assistant";
  label: string;
  content: string;
  turn: number;
};

export type ThreadRecord = {
  messages: ThreadMessage[];
  checkpoints: number;
};

export type MemoryPrompt = {
  index: number;
  text: string;
  expected: ThreadId;
  note: string;
};

export type SendRecord = {
  turn: number;
  thread: ThreadId;
  restored: number;
  seen: number;
  checkpoint: number;
  sawName: boolean;
  sawCoffee: boolean;
  explanation: string;
};

export type MemoryLabState = {
  threads: Record<ThreadId, ThreadRecord>;
  history: SendRecord[];
};

/** 三条消息来自 content/lessons/03-memory-and-threads.md 的本课挑战。 */
export const memoryPrompts: MemoryPrompt[] = [
  {
    index: 0,
    text: "记住：我在学 LangGraph，我叫小白。",
    expected: "a",
    note: "这条是 thread a 的第一句话，它建立了「名字」这个事实。",
  },
  {
    index: 1,
    text: "记住：我喜欢喝咖啡。",
    expected: "b",
    note: "这条属于另一段会话。放进 b，才能验证两边互不相通。",
  },
  {
    index: 2,
    text: "我叫什么？",
    expected: "a",
    note: "回到 a 提问。它应该看得见「小白」，看不见「咖啡」。",
  },
];

export const createInitialMemoryState = (): MemoryLabState => ({
  threads: {
    a: { messages: [], checkpoints: 0 },
    b: { messages: [], checkpoints: 0 },
  },
  history: [],
});

const hasFact = (messages: ThreadMessage[], keyword: string) =>
  messages.some((message) => message.role === "user" && message.content.includes(keyword));

/**
 * 回复文本由 thread 里实际存在的事实推导，不是抄写某次真实模型输出。
 * 本课的确定事实是「model 这一步看到哪些输入消息」，措辞只用于演示。
 */
function composeAnswer(prompt: MemoryPrompt, sawName: boolean, sawCoffee: boolean): string {
  if (prompt.index === 0) return "好的，我记住了：你叫小白，正在学 LangGraph。";
  if (prompt.index === 1) return "好的，我记住了：你喜欢喝咖啡。";
  if (!sawName) return "这段会话里我没有看到你的名字。";
  return sawCoffee
    ? "你叫小白。而且这段会话里还写着你喜欢喝咖啡。"
    : "你叫小白。";
}

export function sendToThread(state: MemoryLabState, thread: ThreadId): MemoryLabState {
  const turn = state.history.length;
  const prompt = memoryPrompts[turn];
  if (!prompt) return state;

  const record = state.threads[thread];
  const restored = record.messages.length;

  const userMessage: ThreadMessage = {
    id: `t${turn}-user`,
    role: "user",
    label: "你",
    content: prompt.text,
    turn,
  };

  const seenMessages = [...record.messages, userMessage];
  const sawName = hasFact(seenMessages, "小白");
  const sawCoffee = hasFact(seenMessages, "咖啡");

  const assistantMessage: ThreadMessage = {
    id: `t${turn}-assistant`,
    role: "assistant",
    label: "model",
    content: composeAnswer(prompt, sawName, sawCoffee),
    turn,
  };

  const checkpoint = record.checkpoints + 1;

  return {
    threads: {
      ...state.threads,
      [thread]: {
        messages: [...seenMessages, assistantMessage],
        checkpoints: checkpoint,
      },
    },
    history: [
      ...state.history,
      {
        turn,
        thread,
        restored,
        seen: seenMessages.length,
        checkpoint,
        sawName,
        sawCoffee,
        explanation:
          restored === 0
            ? `thread ${thread} 还没有 checkpoint，State 从空的 messages 开始。model 这一步只看到 1 条输入。`
            : `checkpointer 在 thread ${thread} 找到 ${restored} 条已保存消息，先恢复成 State，再追加新消息。model 这一步看到 ${seenMessages.length} 条输入。`,
      },
    ],
  };
}

export const nextPrompt = (state: MemoryLabState): MemoryPrompt | undefined =>
  memoryPrompts[state.history.length];

export const isFinished = (state: MemoryLabState) => state.history.length >= memoryPrompts.length;

/** 通过条件：三条消息分别落在 a / b / a，最后一次提问看得见名字、看不见咖啡。 */
export function evaluateRun(state: MemoryLabState): {
  passed: boolean;
  feedback: string;
} | undefined {
  if (!isFinished(state)) return undefined;

  const [first, second, third] = state.history;
  const routedRight = memoryPrompts.every((prompt, index) => state.history[index].thread === prompt.expected);

  if (routedRight && third.sawName && !third.sawCoffee) {
    return {
      passed: true,
      feedback: "对了。thread a 记得名字，却完全看不到 thread b 的咖啡——隔离就是这样发生的。",
    };
  }

  if (first.thread === second.thread && second.thread === third.thread) {
    return {
      passed: false,
      feedback: "三条都进了同一个 thread，所以最后一次提问连咖啡也看见了。把第 2 条换到另一个 thread 再试一次。",
    };
  }

  if (!third.sawName) {
    return {
      passed: false,
      feedback: `最后一次提问落在 thread ${third.thread}，那里没有保存过名字，所以 model 答不出来。名字写在哪个 thread，就要回哪个 thread 问。`,
    };
  }

  return {
    passed: false,
    feedback: "顺序对得不完全。目标是：名字写进 a，咖啡写进 b，再回 a 提问。",
  };
}
