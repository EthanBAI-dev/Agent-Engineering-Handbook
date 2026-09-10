"use client";

import { useCallback, useEffect, useState } from "react";
import {
  advanceToolGraph,
  createInitialToolState,
  type ToolGraphNode,
  type ToolRoute,
} from "@/lib/lesson-two";

const toolPythonCode = `@tool
def add(a: float, b: float) -> float:
    return a + b

@tool
def word_count(text: str) -> int:
    return len(text.split())

graph = StateGraph(MessagesState)
graph.add_node("model", call_model)
graph.add_node("tools", ToolNode([add, word_count]))
graph.add_edge(START, "model")
graph.add_conditional_edges("model", tools_condition)
graph.add_edge("tools", "model")`;

function ToolConnector({ route, activeRoute, label }: { route: ToolRoute; activeRoute?: ToolRoute; label?: string }) {
  return (
    <span className={`tool-connector ${activeRoute === route ? "active" : ""}`} aria-hidden="true">
      {label && <small>{label}</small>}
    </span>
  );
}

function ToolNodeCard({ name, current }: { name: "model" | "tools"; current: ToolGraphNode }) {
  return (
    <div className={`tool-node ${current === name ? "current" : ""}`} aria-current={current === name ? "step" : undefined}>
      <span>{name === "model" ? "THINK" : "ACT"}</span>
      <strong>{name}</strong>
      <small>{name === "model" ? "决定下一步" : "执行真实函数"}</small>
    </div>
  );
}

export function LessonTwoLab() {
  const [run, setRun] = useState(createInitialToolState);
  const [autoRun, setAutoRun] = useState(false);
  const [answer, setAnswer] = useState("");
  const challengePassed = answer === "tools-model";

  const advanceOne = useCallback(() => {
    if (run.current === "end") return;
    const next = advanceToolGraph(run);
    setRun(next);
    if (next.current === "end") setAutoRun(false);
  }, [run]);

  useEffect(() => {
    if (!autoRun || run.current === "end") return;
    const timer = window.setTimeout(advanceOne, 860);
    return () => window.clearTimeout(timer);
  }, [advanceOne, autoRun, run]);

  const reset = () => {
    setRun(createInitialToolState());
    setAutoRun(false);
  };

  const checkAnswer = (value: string) => {
    setAnswer(value);
    if (value === "tools-model") localStorage.setItem("agent-lab-lesson-2", "complete");
  };

  const actionLabel = run.step === 0 ? "让 model 判断" : run.step === 1 ? "执行 tools" : run.step === 2 ? "把结果交回 model" : run.step === 3 ? "结束运行" : "本轮已完成";

  return (
    <div className="chapter-lab tool-lab" aria-label="第二章工具循环互动实验">
      <div className="lab-toolbar">
        <div>
          <p className="panel-kicker">INTERACTIVE 02</p>
          <h3>跟着一条消息走完工具循环</h3>
        </div>
        <span className={`status-pill ${run.current === "end" ? "status-end" : ""}`} aria-live="polite">
          {run.current === "end" ? "执行完成" : `步骤 ${run.step} / 4`}
        </span>
      </div>

      <div className="tool-workspace">
        <div className="tool-graph" aria-label="model 与 tools 的循环图">
          <div className="tool-main-route">
            <span className={`endpoint ${run.current === "start" ? "current" : ""}`}>START</span>
            <ToolConnector route="start-model" activeRoute={run.lastRoute} />
            <ToolNodeCard name="model" current={run.current} />
            <div className="tool-route-stack">
              <ToolConnector route="model-tools" activeRoute={run.lastRoute} label="有 tool call →" />
              <ToolConnector route="tools-model" activeRoute={run.lastRoute} label="← tool result" />
            </div>
            <ToolNodeCard name="tools" current={run.current} />
          </div>
          <div className="tool-end-route">
            <span className="branch-label">model</span>
            <ToolConnector route="model-end" activeRoute={run.lastRoute} label="无 tool call" />
            <span className={`endpoint ${run.current === "end" ? "current" : ""}`}>END</span>
          </div>
        </div>

        <section className="message-panel" aria-label="MessagesState 消息列表">
          <div className="state-title"><span>MESSAGES STATE</span><span>{run.messages.length} 条</span></div>
          <div className="message-list">
            {run.messages.map((message) => (
              <div className={`message message-${message.role}`} key={message.id}>
                <span>{message.toolName ? `${message.label} · ${message.toolName}` : message.label}</span>
                <p>{message.content}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="tool-explanation" aria-live="polite">
        <span>这一刻是谁在做事？</span>
        <p>{run.explanation}</p>
      </div>

      <div className="lab-controls">
        <button className="primary-button" type="button" onClick={advanceOne} disabled={run.current === "end" || autoRun}>
          {actionLabel}<span aria-hidden="true">→</span>
        </button>
        <button type="button" onClick={() => setAutoRun((value) => !value)} disabled={run.current === "end"}>{autoRun ? "暂停" : "自动运行"}</button>
        <button type="button" onClick={reset}>重置</button>
      </div>

      <div className="edge-challenge">
        <div>
          <p className="panel-kicker">CHECK YOUR MODEL</p>
          <h4>哪条 Edge 闭合了循环？</h4>
          <p>没有它，模型就拿不到工具结果，也无法组织最终回答。</p>
        </div>
        <div className="edge-options" role="group" aria-label="选择闭合循环的边">
          {[
            ["model-end", "model → END"],
            ["tools-model", "tools → model"],
            ["tools-end", "tools → END"],
          ].map(([value, label]) => (
            <button key={value} type="button" className={answer === value ? "selected" : ""} onClick={() => checkAnswer(value)}>{label}</button>
          ))}
          {answer && <p className={challengePassed ? "answer-feedback passed" : "answer-feedback"}>{challengePassed ? "答对了。结果必须回到 model，循环才完整。 ✓" : "再看看消息流：工具结果之后，谁负责写最终回答？"}</p>}
        </div>
      </div>

      <p className="simulation-note">为了方便观察，动画把两个工具放在同一批执行。真实模型也可能把它们拆成多轮调用。</p>

      <details className="code-disclosure">
        <summary>展开真实 Python 代码</summary>
        <pre><code>{toolPythonCode}</code></pre>
      </details>
    </div>
  );
}
