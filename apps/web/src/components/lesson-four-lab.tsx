"use client";

import { useMemo, useState } from "react";
import {
  createRun,
  graphOrder,
  nodeLabel,
  nodeNote,
  resumeRun,
  scenarios,
  startRun,
  type Answer,
  type ApprovalRun,
  type Scenario,
  type SideEffectPlacement,
} from "@/lib/lesson-four";

const approvalPythonCode = `def approval(state: State) -> dict:
    answer = interrupt({
        "question": f"确认删除 {state['path']} ?",
        "type": "yes/no",
    })
    if answer != "yes":
        return {"result": "已取消"}
    return {"result": f"已删除 {state['path']}"}

app = graph.compile(checkpointer=InMemorySaver())

cfg = {"configurable": {"thread_id": "t1"}}
out = app.invoke({"path": "/tmp/cache", "result": ""}, cfg)
# 图停在 approval，out["__interrupt__"][0].value 就是上面那个 payload

app.invoke(Command(resume="yes"), cfg)   # 必须用同一个 cfg`;

export function LessonFourLab() {
  const [scenario, setScenario] = useState<Scenario>(scenarios[0]);
  const [placement, setPlacement] = useState<SideEffectPlacement>("before");
  const [run, setRun] = useState<ApprovalRun>(() => createRun(scenarios[0], "before"));
  const [finished, setFinished] = useState<Record<string, string>>({});

  const passed = useMemo(() => {
    const cache = finished["cache"];
    const passwd = finished["passwd"];
    return Boolean(cache && passwd && cache.startsWith("已删除") && passwd === "已取消");
  }, [finished]);

  const pick = (next: Scenario) => {
    setScenario(next);
    setRun(createRun(next, placement));
  };

  const switchPlacement = (next: SideEffectPlacement) => {
    setPlacement(next);
    setRun(createRun(scenario, next));
  };

  const answer = (value: Answer) => {
    const next = resumeRun(run, value);
    setRun(next);
    const record = { ...finished, [scenario.id]: next.result };
    setFinished(record);
    const cache = record["cache"];
    const passwd = record["passwd"];
    if (cache?.startsWith("已删除") && passwd === "已取消") {
      localStorage.setItem("agent-lab-lesson-4", "complete");
    }
  };

  const statusText =
    run.phase === "idle" ? "尚未运行" : run.phase === "paused" ? "已暂停，等待人类" : "流程结束";

  return (
    <div className="chapter-lab approval-lab" aria-label="第四课人工审批互动实验">
      <div className="lab-toolbar">
        <div>
          <p className="panel-kicker">INTERACTIVE 04</p>
          <h3>让图停下来，等你点头</h3>
        </div>
        <span
          className={`status-pill ${run.phase === "paused" ? "status-paused" : run.phase === "done" ? "status-end" : ""}`}
          aria-live="polite"
        >
          {statusText}
        </span>
      </div>

      <div className="approval-setup">
        <div>
          <p className="panel-kicker">选一条要审批的操作</p>
          <div className="thread-picker" role="group" aria-label="选择要审批的操作">
            {scenarios.map((item) => (
              <button
                key={item.id}
                type="button"
                className={scenario.id === item.id ? "selected" : ""}
                aria-pressed={scenario.id === item.id}
                onClick={() => pick(item)}
              >
                {item.path}
              </button>
            ))}
          </div>
          <p className="thread-note">
            thread_id = &quot;{scenario.thread}&quot; · {scenario.hint}
          </p>
        </div>

        <div>
          <p className="panel-kicker">副作用写在哪一侧</p>
          <div className="thread-picker" role="group" aria-label="选择副作用的位置">
            {(
              [
                ["before", "interrupt 之前"],
                ["after", "批准之后"],
              ] as [SideEffectPlacement, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={placement === value ? "selected" : ""}
                aria-pressed={placement === value}
                onClick={() => switchPlacement(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="thread-note">这一项决定恢复之后副作用会发生几次。</p>
        </div>
      </div>

      <div className="approval-graph" aria-label="审批流程图">
        {graphOrder.map((node, index) => (
          <div className="approval-node-wrap" key={node}>
            {index > 0 && <span className="approval-arrow" aria-hidden="true" />}
            <div
              className={`approval-node ${run.current === node ? "current" : ""} ${
                run.visited.includes(node) ? "visited" : ""
              } ${node === "approval" && run.phase === "paused" ? "is-paused" : ""}`}
              aria-current={run.current === node ? "step" : undefined}
            >
              <strong>{nodeLabel[node]}</strong>
              <small>{nodeNote[node]}</small>
              {node === "approval" && run.phase === "paused" && <span className="pause-badge">⏸ 暂停</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="approval-panels">
        <section className="state-card" aria-label="当前 State">
          <div className="state-title">
            <span>STATE</span>
            <span>{run.next.length ? `next = (${run.next.join(", ")},)` : "next = ()"}</span>
          </div>
          <dl>
            <div>
              <dt>path</dt>
              <dd>{run.path}</dd>
            </div>
            <div className={run.result ? "changed" : ""}>
              <dt>result</dt>
              <dd>{run.result || '""'}</dd>
            </div>
          </dl>
        </section>

        <section className="interrupt-card" aria-label="interrupt 交出去的内容">
          <div className="state-title">
            <span>__INTERRUPT__ PAYLOAD</span>
          </div>
          {run.payload ? (
            <pre>
              <code>{`{
  "question": "${run.payload.question}",
  "type": "${run.payload.type}"
}`}</code>
            </pre>
          ) : (
            <p className="thread-empty">图还没有暂停，外面拿不到任何东西。</p>
          )}
        </section>
      </div>

      <div className="approval-counters" aria-label="各段代码执行次数">
        {[
          ["propose 节点", run.proposeRuns, "暂停点之前的节点，不重跑"],
          ["interrupt 之前的代码", run.approvalHeadRuns, "恢复时会再跑一次"],
          ["interrupt 之后的代码", run.approvalTailRuns, "只在拿到答案后执行"],
          ["副作用实际发生", run.sideEffectRuns, placement === "before" ? "写在了危险的一侧" : "写在了安全的一侧"],
        ].map(([label, count, note]) => (
          <div
            key={String(label)}
            className={
              label === "副作用实际发生" && Number(count) > 1 ? "counter danger" : "counter"
            }
          >
            <span>{label}</span>
            <strong>{String(count)} 次</strong>
            <small>{String(note)}</small>
          </div>
        ))}
      </div>

      <div className="approval-log" aria-live="polite">
        {run.log.map((entry) => (
          <p key={entry.id} className={`log-${entry.tone}`}>
            {entry.text}
          </p>
        ))}
      </div>

      <div className="lab-controls">
        {run.phase === "idle" && (
          <button className="primary-button" type="button" onClick={() => setRun(startRun(run))}>
            用 thread {scenario.thread} 调用图<span aria-hidden="true">→</span>
          </button>
        )}
        {run.phase === "paused" && (
          <>
            <button className="primary-button approve" type="button" onClick={() => answer("yes")}>
              批准（resume=&quot;yes&quot;）<span aria-hidden="true">✓</span>
            </button>
            <button type="button" className="reject-button" onClick={() => answer("no")}>
              拒绝（resume=&quot;no&quot;）
            </button>
          </>
        )}
        {run.phase === "done" && (
          <button className="primary-button" type="button" onClick={() => setRun(createRun(scenario, placement))}>
            再跑一次<span aria-hidden="true">↺</span>
          </button>
        )}
        <button type="button" onClick={() => setRun(createRun(scenario, placement))}>
          重置
        </button>
      </div>

      <div className="edge-challenge">
        <div>
          <p className="panel-kicker">CHECK YOUR APPROVAL</p>
          <h4>两条操作，两个不同的结果</h4>
          <p>用两个不同的 thread 各跑一遍：缓存目录批准，系统文件拒绝。</p>
        </div>
        <div className="thread-verdict">
          <ol className="thread-trace">
            {scenarios.map((item, index) => {
              const done = finished[item.id];
              const right =
                item.expected === "yes" ? done?.startsWith("已删除") : done === "已取消";
              return (
                <li key={item.id} className={done ? (right ? "right" : "wrong") : ""}>
                  <span>{index + 1}</span>
                  <strong>{item.thread} · {item.path}</strong>
                  <small>{done ? `result = ${done}` : "未运行"}</small>
                </li>
              );
            })}
          </ol>
          {Object.keys(finished).length > 0 && (
            <p className={passed ? "answer-feedback passed" : "answer-feedback"}>
              {passed
                ? "对了。同一张图、两个 thread，人的决定不同，结果就不同。 ✓"
                : "两条都要跑：/tmp/cache 批准得到「已删除」，/etc/passwd 拒绝得到「已取消」。"}
            </p>
          )}
        </div>
      </div>

      <p className="simulation-note">
        动画不会删除任何文件，「已删除」只是写进 State 的一段文本。
        各段代码的执行次数对齐了 <code>04_human_in_loop.py</code> 的实跑结果：暂停点之前的节点不重跑，
        <code>interrupt</code> 之前的代码执行 2 次，之后的代码执行 1 次。
      </p>

      <details className="code-disclosure">
        <summary>展开真实 Python 代码</summary>
        <pre>
          <code>{approvalPythonCode}</code>
        </pre>
      </details>
    </div>
  );
}
