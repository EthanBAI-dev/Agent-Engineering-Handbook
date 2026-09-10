"use client";

import { useMemo, useState } from "react";
import {
  createInitialMemoryState,
  evaluateRun,
  isFinished,
  memoryPrompts,
  nextPrompt,
  sendToThread,
  type MemoryLabState,
  type ThreadId,
} from "@/lib/lesson-three";

const memoryPythonCode = `from langgraph.checkpoint.memory import InMemorySaver

graph = StateGraph(MessagesState)
graph.add_node("model", call_model)
graph.add_edge(START, "model")
graph.add_edge("model", END)

app = graph.compile(checkpointer=InMemorySaver())

def ask(text: str, thread: str) -> None:
    cfg = {"configurable": {"thread_id": thread}}
    out = app.invoke({"messages": [("user", text)]}, cfg)
    print(f"[{thread}] AI: {out['messages'][-1].content}")

snap = app.get_state({"configurable": {"thread_id": "a"}})
print("thread a 存了", len(snap.values["messages"]), "条消息")`;

const threadIds: ThreadId[] = ["a", "b"];

export function LessonThreeLab() {
  const [run, setRun] = useState<MemoryLabState>(createInitialMemoryState);
  const [target, setTarget] = useState<ThreadId>("a");
  const [inspected, setInspected] = useState<ThreadId>("a");

  const pending = nextPrompt(run);
  const finished = isFinished(run);
  const verdict = useMemo(() => evaluateRun(run), [run]);
  const latest = run.history[run.history.length - 1];

  const send = () => {
    if (!pending) return;
    const next = sendToThread(run, target);
    setRun(next);
    setInspected(target);
    const result = evaluateRun(next);
    if (result?.passed) localStorage.setItem("agent-lab-lesson-3", "complete");
  };

  const reset = () => {
    setRun(createInitialMemoryState());
    setTarget("a");
    setInspected("a");
  };

  const snapshot = run.threads[inspected];

  return (
    <div className="chapter-lab memory-lab" aria-label="第三课会话记忆互动实验">
      <div className="lab-toolbar">
        <div>
          <p className="panel-kicker">INTERACTIVE 03</p>
          <h3>把三条消息发进正确的 thread</h3>
        </div>
        <span className={`status-pill ${finished ? "status-end" : ""}`} aria-live="polite">
          {finished ? "三条都已发送" : `第 ${run.history.length + 1} / ${memoryPrompts.length} 条`}
        </span>
      </div>

      <div className="thread-console">
        <div className="thread-compose">
          <p className="panel-kicker">下一条消息</p>
          {pending ? (
            <>
              <blockquote className="thread-prompt">{pending.text}</blockquote>
              <p className="thread-note">{pending.note}</p>
              <div className="thread-picker" role="group" aria-label="选择这条消息进入哪个 thread">
                {threadIds.map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={target === id ? "selected" : ""}
                    aria-pressed={target === id}
                    onClick={() => setTarget(id)}
                  >
                    thread_id = &quot;{id}&quot;
                  </button>
                ))}
              </div>
              <button className="primary-button" type="button" onClick={send}>
                以 thread {target} 调用图<span aria-hidden="true">→</span>
              </button>
            </>
          ) : (
            <>
              <blockquote className="thread-prompt done">三条消息已经全部发送。</blockquote>
              <p className="thread-note">改变分配方式再跑一次，可以看到不同的记忆结果。</p>
              <button className="primary-button" type="button" onClick={reset}>
                重新分配<span aria-hidden="true">↺</span>
              </button>
            </>
          )}
        </div>

        <div className="thread-columns">
          {threadIds.map((id) => {
            const record = run.threads[id];
            return (
              <section
                key={id}
                className={`thread-column ${!finished && target === id ? "is-target" : ""}`}
                aria-label={`thread ${id} 的消息与 checkpoint`}
              >
                <div className="state-title">
                  <span>THREAD &quot;{id}&quot;</span>
                  <span>{record.checkpoints ? `v${record.checkpoints} · ${record.messages.length} 条` : "无 checkpoint"}</span>
                </div>
                <div className="message-list">
                  {record.messages.length === 0 ? (
                    <p className="thread-empty">这段会话还没有任何消息。</p>
                  ) : (
                    record.messages.map((message) => (
                      <div className={`message message-${message.role}`} key={message.id}>
                        <span>{message.label}</span>
                        <p>{message.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <div className="tool-explanation" aria-live="polite">
        <span>这一步 checkpointer 做了什么？</span>
        <p>
          {latest
            ? latest.explanation
            : "两个 thread 都是空的。第一次调用图时，checkpointer 没有东西可恢复，State 从零开始。"}
        </p>
      </div>

      <div className="snapshot-panel">
        <div className="snapshot-head">
          <p className="panel-kicker">GET_STATE</p>
          <div className="thread-picker small" role="group" aria-label="选择要查看快照的 thread">
            {threadIds.map((id) => (
              <button
                key={id}
                type="button"
                className={inspected === id ? "selected" : ""}
                aria-pressed={inspected === id}
                onClick={() => setInspected(id)}
              >
                {id}
              </button>
            ))}
          </div>
        </div>
        <pre>
          <code>{`app.get_state({"configurable": {"thread_id": "${inspected}"}})
→ len(snap.values["messages"]) == ${snapshot.messages.length}
→ checkpoint ${snapshot.checkpoints ? `v${snapshot.checkpoints}` : "尚未写入"}`}</code>
        </pre>
      </div>

      <div className="edge-challenge">
        <div>
          <p className="panel-kicker">CHECK YOUR MEMORY</p>
          <h4>消息到底属于谁？</h4>
          <p>目标：名字写进 a，咖啡写进 b，再回 a 提问。thread a 应该记得名字，并且完全看不到咖啡。</p>
        </div>
        <div className="thread-verdict">
          <ol className="thread-trace">
            {memoryPrompts.map((prompt, index) => {
              const sent = run.history[index];
              return (
                <li key={prompt.index} className={sent ? (sent.thread === prompt.expected ? "right" : "wrong") : ""}>
                  <span>{index + 1}</span>
                  <strong>{sent ? `→ thread ${sent.thread}` : "未发送"}</strong>
                  <small>{sent ? `model 看到 ${sent.seen} 条输入` : prompt.text}</small>
                </li>
              );
            })}
          </ol>
          {verdict && (
            <p className={verdict.passed ? "answer-feedback passed" : "answer-feedback"}>
              {verdict.passed ? `${verdict.feedback} ✓` : verdict.feedback}
            </p>
          )}
        </div>
      </div>

      <p className="simulation-note">
        动画不调用真实模型。回复文本是根据「这个 thread 里到底存了什么」推导出来的示意句子，真实模型的措辞会不一样；
        本课要确认的是 model 每一步看到哪些输入消息。真实 LangGraph 每个 super-step 都会写 checkpoint，这里按「一次调用一版」简化显示。
      </p>

      <details className="code-disclosure">
        <summary>展开真实 Python 代码</summary>
        <pre><code>{memoryPythonCode}</code></pre>
      </details>
    </div>
  );
}
