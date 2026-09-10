"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  advanceGraph,
  countWorkPasses,
  initialState,
  type GraphNode,
  type LessonState,
  type RouteName,
  type StepRecord,
} from "@/lib/lesson-one";

const nodeLabels: Record<GraphNode, string> = {
  start: "START",
  plan: "plan",
  work: "work",
  review: "review",
  end: "END",
};

const pythonCode = `class State(TypedDict):
    topic: str
    count: int
    log: Annotated[list[str], operator.add]

def plan(state: State) -> dict:
    return {"log": [f"planning: {state['topic']}"],
            "count": state["count"] + 1}

def work(state: State) -> dict:
    return {"log": [f"work pass #{state['count']}"],
            "count": state["count"] + 1}

def should_continue(state: State) -> str:
    return "work" if state["count"] < 4 else "review"`;

const cloneInitialState = (): LessonState => ({ ...initialState, log: [] });

function GraphNodeCard({
  name,
  current,
  visited,
}: {
  name: "plan" | "work" | "review";
  current: GraphNode;
  visited: boolean;
}) {
  const descriptions = { plan: "制定计划", work: "执行工作", review: "检查结果" };
  const numbers = { plan: "01", work: "02", review: "03" };
  return (
    <div
      className={`graph-node ${current === name ? "current" : ""} ${visited ? "visited" : ""}`}
      aria-current={current === name ? "step" : undefined}
    >
      <span>{numbers[name]}</span>
      <strong>{name}</strong>
      <small>{descriptions[name]}</small>
    </div>
  );
}

function Connector({ route, activeRoute }: { route: RouteName; activeRoute?: RouteName }) {
  return <span className={`connector ${activeRoute === route ? "active" : ""}`} aria-hidden="true" />;
}

export function LessonOneLab() {
  const [current, setCurrent] = useState<GraphNode>("start");
  const [state, setState] = useState<LessonState>(cloneInitialState);
  const [history, setHistory] = useState<StepRecord[]>([]);
  const [threshold, setThreshold] = useState(4);
  const [autoRun, setAutoRun] = useState(false);

  const lastStep = history.at(-1);
  const visited = useMemo(() => new Set(history.map((step) => step.executed)), [history]);
  const workPasses = countWorkPasses(history);
  const challengePassed =
    threshold === 6 && current === "end" && state.count === 6 && workPasses === 5;

  const advanceOne = useCallback(() => {
    if (current === "end") return;
    const result = advanceGraph(current, state, threshold);
    const nextHistory = [...history, result.record];
    setCurrent(result.current);
    setState(result.state);
    setHistory(nextHistory);

    if (result.current === "end") {
      setAutoRun(false);
      if (threshold === 6 && result.state.count === 6 && countWorkPasses(nextHistory) === 5) {
        localStorage.setItem("agent-lab-lesson-1", "complete");
      }
    }
  }, [current, history, state, threshold]);

  useEffect(() => {
    if (!autoRun || current === "end") return;
    const timer = window.setTimeout(advanceOne, 720);
    return () => window.clearTimeout(timer);
  }, [advanceOne, autoRun, current]);

  const reset = useCallback((nextThreshold = threshold) => {
    setCurrent("start");
    setState(cloneInitialState());
    setHistory([]);
    setThreshold(nextThreshold);
    setAutoRun(false);
  }, [threshold]);

  const status = current === "start" ? "等待执行" : current === "end" ? "执行完成" : autoRun ? "自动运行中" : `刚执行 ${nodeLabels[current]}`;
  const buttonLabel = current === "start" ? "执行 plan" : current === "review" ? "到达 END" : current === "end" ? "本轮已完成" : "执行下一步";

  return (
    <div className="chapter-lab" aria-label="第一章互动实验">
      <div className="lab-toolbar">
        <div>
          <p className="panel-kicker">INTERACTIVE 01</p>
          <h3>让图走一步，State 就变一次</h3>
        </div>
        <span className={`status-pill status-${current}`} aria-live="polite">{status}</span>
      </div>

      <div className="graph-stage">
        <span className={`endpoint ${current === "start" ? "current" : ""}`}>START</span>
        <Connector route="start-plan" activeRoute={lastStep?.route} />
        <GraphNodeCard name="plan" current={current} visited={visited.has("plan")} />
        <Connector route="plan-work" activeRoute={lastStep?.route} />
        <div className="work-wrap">
          <GraphNodeCard name="work" current={current} visited={visited.has("work")} />
          <span className={`loop-route ${lastStep?.route === "work-loop" ? "active" : ""}`}>
            ↻ count &lt; {threshold}
          </span>
        </div>
        <Connector route="work-review" activeRoute={lastStep?.route} />
        <GraphNodeCard name="review" current={current} visited={visited.has("review")} />
        <Connector route="review-end" activeRoute={lastStep?.route} />
        <span className={`endpoint ${current === "end" ? "current" : ""}`}>END</span>
      </div>

      <div className="inspector-grid">
        <section className="state-card" aria-label="当前 State">
          <div className="state-title"><span>STATE</span><span>步骤 {history.length}</span></div>
          <dl>
            <div><dt>topic</dt><dd>&quot;{state.topic}&quot;</dd></div>
            <div className={lastStep?.before.count !== state.count ? "changed" : ""}>
              <dt>count</dt><dd>{lastStep?.before.count !== state.count && <del>{lastStep?.before.count}</del>}{state.count}</dd>
            </div>
            <div className={lastStep?.before.log.length !== state.log.length ? "changed" : ""}>
              <dt>log</dt><dd>[{state.log.map((item) => `"${item}"`).join(", ")}]</dd>
            </div>
          </dl>
        </section>
        <section className="explain-card" aria-live="polite">
          <span>刚才发生了什么？</span>
          <p>{lastStep?.explanation ?? "点击按钮，从 START 进入第一个节点。"}</p>
          {lastStep && lastStep.executed !== "end" && (
            <div className="update-tags">
              {lastStep.before.count !== lastStep.after.count && <span>count · 覆盖</span>}
              {lastStep.before.log.length !== lastStep.after.log.length && <span>log · reducer 累加</span>}
            </div>
          )}
        </section>
      </div>

      <div className="lab-controls">
        <button className="primary-button" type="button" onClick={advanceOne} disabled={current === "end" || autoRun}>
          {buttonLabel}<span aria-hidden="true">→</span>
        </button>
        <button type="button" onClick={() => setAutoRun((value) => !value)} disabled={current === "end"}>{autoRun ? "暂停" : "自动运行"}</button>
        <button type="button" onClick={() => reset()}>重置</button>
      </div>

      <div className="embedded-challenge">
        <div>
          <p className="panel-kicker">CHALLENGE</p>
          <h4>让 work 多跑两次</h4>
          <p>把阈值改成 6，再运行到 END。</p>
        </div>
        <div className="challenge-editor">
          <label htmlFor="threshold">state[&quot;count&quot;] &lt;</label>
          <input id="threshold" type="number" min="2" max="8" value={threshold} onChange={(event) => reset(Math.max(2, Math.min(8, Number(event.target.value) || 2)))} />
          <span className={challengePassed ? "pass-note passed" : "pass-note"} aria-live="polite">
            {challengePassed ? `通过：work ${workPasses} 次，count = 6 ✓` : `当前：work ${workPasses} 次，count = ${state.count}`}
          </span>
        </div>
      </div>

      <details className="code-disclosure">
        <summary>展开真实 Python 代码</summary>
        <pre><code>{pythonCode}</code></pre>
      </details>
    </div>
  );
}

