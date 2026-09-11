"use client";

import { useMemo, useState } from "react";
import {
  allPassed,
  cardById,
  emptyBlueprint,
  evaluate,
  remainingCards,
  returnEdges,
  slots,
  type Blueprint,
  type CardId,
  type ReturnEdge,
  type SlotId,
} from "@/lib/lesson-five";

const blueprintCode = `graph = StateGraph(AgentState)
graph.add_node("model", call_model)
graph.add_node("safe_tools", ToolNode(SAFE_TOOLS))
graph.add_node("approval", ask_human)
graph.add_node("risky_tools", ToolNode(RISKY_TOOLS))
graph.add_node("report", report)

graph.add_edge(START, "model")
graph.add_conditional_edges("model", route_by_risk,
                            ["safe_tools", "approval", "report"])
graph.add_edge("safe_tools", "model")      # 闭合普通工具循环
graph.add_conditional_edges("approval", after_approval,
                            ["risky_tools", "report"])
graph.add_edge("risky_tools", "model")
graph.add_edge("report", END)

app = graph.compile(checkpointer=InMemorySaver())
cfg = {"configurable": {"thread_id": "t1"}}   # 暂停与恢复用同一个`;

export function LessonFiveLab() {
  const [bp, setBp] = useState<Blueprint>(emptyBlueprint);
  const [held, setHeld] = useState<CardId | null>(null);

  const checks = useMemo(() => evaluate(bp), [bp]);
  const passed = allPassed(checks);
  const tray = remainingCards(bp);
  const placedCount = Object.keys(bp.placed).length;

  const put = (slot: SlotId) => {
    if (bp.placed[slot]) {
      // 点已填的格子＝把卡片退回待选区
      const next = { ...bp.placed };
      delete next[slot];
      setBp({ ...bp, placed: next });
      return;
    }
    if (!held) return;
    const next: Blueprint = { ...bp, placed: { ...bp.placed, [slot]: held } };
    setBp(next);
    setHeld(null);
    if (allPassed(evaluate(next))) localStorage.setItem("agent-lab-lesson-5", "complete");
  };

  const setFlag = (patch: Partial<Blueprint>) => {
    const next = { ...bp, ...patch };
    setBp(next);
    if (allPassed(evaluate(next))) localStorage.setItem("agent-lab-lesson-5", "complete");
  };

  return (
    <div className="chapter-lab blueprint-lab" aria-label="第五课蓝图拼装互动实验">
      <div className="lab-toolbar">
        <div>
          <p className="panel-kicker">INTERACTIVE 05</p>
          <h3>把打乱的卡片排回去</h3>
        </div>
        <span className={`status-pill ${passed ? "status-end" : ""}`} aria-live="polite">
          {passed ? "五条约束全部成立" : `${checks.filter((c) => c.passed).length} / ${checks.length} 条成立`}
        </span>
      </div>

      <div className="bp-tray" aria-label="待放置的节点卡片">
        <p className="panel-kicker">节点卡片</p>
        <div className="bp-cards">
          {tray.length === 0 ? (
            <span className="bp-tray-empty">卡片都放完了。检查右边的约束是否全部成立。</span>
          ) : (
            tray.map((card) => (
              <button
                key={card.id}
                type="button"
                className={`bp-card ${held === card.id ? "held" : ""}`}
                aria-pressed={held === card.id}
                onClick={() => setHeld(held === card.id ? null : card.id)}
              >
                <strong>{card.label}</strong>
                <small>{card.note}</small>
              </button>
            ))
          )}
        </div>
        <p className="bp-tip">
          {held ? `已拿起 ${held}，点一个空位放下。` : "先点一张卡片，再点图上的空位。点已放好的位置可以取回。"}
        </p>
      </div>

      <div className="bp-graph" aria-label="蓝图空位">
        {slots.map((slot) => {
          const card = bp.placed[slot.id];
          return (
            <div className="bp-row" key={slot.id}>
              <span className="bp-from">{slot.from}</span>
              <button
                type="button"
                className={`bp-slot ${card ? "filled" : ""} ${held && !card ? "droppable" : ""}`}
                onClick={() => put(slot.id)}
                aria-label={card ? `${slot.label}：已放 ${card}，点击取回` : `${slot.label}：${slot.hint}`}
              >
                {card ? (
                  <>
                    <strong>{cardById(card).label}</strong>
                    <small>{cardById(card).note}</small>
                  </>
                ) : (
                  <>
                    <strong className="bp-empty">{slot.label}</strong>
                    <small>{slot.hint}</small>
                  </>
                )}
              </button>
            </div>
          );
        })}

        <div className="bp-row bp-row-edge">
          <span className="bp-from">safe_tools 执行完 →</span>
          <div className="bp-edge-picker" role="group" aria-label="safe_tools 之后去哪">
            {returnEdges.map((edge) => (
              <button
                key={edge.id}
                type="button"
                className={bp.safeReturn === edge.id ? "selected" : ""}
                aria-pressed={bp.safeReturn === edge.id}
                onClick={() => setFlag({ safeReturn: edge.id as ReturnEdge })}
              >
                {edge.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bp-switches" aria-label="整张图的运行配置">
        <label className={bp.checkpointer ? "on" : ""}>
          <input
            type="checkbox"
            checked={bp.checkpointer}
            onChange={(e) => setFlag({ checkpointer: e.target.checked })}
          />
          <span>
            <strong>compile(checkpointer=…)</strong>
            <small>编译时传入检查点保存器</small>
          </span>
        </label>
        <label className={bp.sameThread ? "on" : ""}>
          <input
            type="checkbox"
            checked={bp.sameThread}
            onChange={(e) => setFlag({ sameThread: e.target.checked })}
          />
          <span>
            <strong>恢复时用同一个 thread_id</strong>
            <small>暂停和恢复共用一份 configurable</small>
          </span>
        </label>
      </div>

      <div className="bp-checks" aria-label="五条约束">
        <p className="panel-kicker">五条约束</p>
        <ol>
          {checks.map((check) => (
            <li key={check.id} className={check.passed ? "ok" : ""}>
              <span aria-hidden="true">{check.passed ? "✓" : "○"}</span>
              <div>
                <strong>{check.label}</strong>
                {!check.passed && placedCount > 0 && <small>{check.hint}</small>}
              </div>
            </li>
          ))}
        </ol>
        {passed && (
          <p className="answer-feedback passed">
            五条全部成立。注意它和示例图未必长得一模一样——通过标准是约束，不是形状。 ✓
          </p>
        )}
      </div>

      <div className="lab-controls">
        <button type="button" onClick={() => { setBp(emptyBlueprint()); setHeld(null); }}>
          重置
        </button>
      </div>

      <p className="simulation-note">
        这一课不引入新的 LangGraph API。五张卡片和两个开关，全部来自第 01–04 课已经验证过的部件。
      </p>

      <details className="code-disclosure">
        <summary>展开这张蓝图对应的代码</summary>
        <pre><code>{blueprintCode}</code></pre>
      </details>
    </div>
  );
}
