"use client";

import { useMemo, useState, type ReactNode } from "react";

/**
 * 互动实验的公共构件。
 *
 * 26 个实验里反复出现三种形状：给每个条目分类、拨开关看结果、把条目排成顺序。
 * 把外壳和交互抽出来，每课只提供数据和一个纯函数，样式与无障碍行为就自动一致。
 */

function useComplete(storageKey: string) {
  return (passed: boolean) => {
    if (passed) {
      try { localStorage.setItem(storageKey, "complete"); } catch { /* 隐私模式下忽略 */ }
    }
  };
}

export function LabShell({
  kicker, title, status, statusTone = "idle", children, note, code,
}: {
  kicker: string; title: string; status: string;
  statusTone?: "idle" | "done"; children: ReactNode; note?: ReactNode; code?: { summary: string; text: string };
}) {
  return (
    <div className="chapter-lab kit-lab">
      <div className="lab-toolbar">
        <div>
          <p className="panel-kicker">{kicker}</p>
          <h3>{title}</h3>
        </div>
        <span className={`status-pill ${statusTone === "done" ? "status-end" : ""}`} aria-live="polite">{status}</span>
      </div>
      {children}
      {note && <p className="simulation-note">{note}</p>}
      {code && (
        <details className="code-disclosure">
          <summary>{code.summary}</summary>
          <pre><code>{code.text}</code></pre>
        </details>
      )}
    </div>
  );
}

/* ─────────────── 一、分类：给每个条目选一个归属 ─────────────── */

export type ClassifyOption = { id: string; label: string };
export type ClassifyItem = {
  id: string; label: string; detail?: string;
  correct: string;
  /** 选对时说明依据；选错时也用它，帮学习者自己看出来 */
  why: string;
};

export function ClassifyLab({
  kicker, title, options, items, passText, note, code, storageKey, prompt,
}: {
  kicker: string; title: string; options: ClassifyOption[]; items: ClassifyItem[];
  passText: string; note?: ReactNode; code?: { summary: string; text: string };
  storageKey: string; prompt?: ReactNode;
}) {
  const [picked, setPicked] = useState<Record<string, string>>({});
  const complete = useComplete(storageKey);
  const answered = items.filter((i) => picked[i.id]).length;
  const right = items.filter((i) => picked[i.id] === i.correct).length;
  const passed = right === items.length;

  const choose = (itemId: string, optionId: string) => {
    const next = { ...picked, [itemId]: optionId };
    setPicked(next);
    complete(items.every((i) => next[i.id] === i.correct));
  };

  return (
    <LabShell
      kicker={kicker} title={title}
      status={passed ? "全部判断正确" : `${right} / ${items.length} 正确（已答 ${answered}）`}
      statusTone={passed ? "done" : "idle"} note={note} code={code}
    >
      {prompt && <div className="kit-prompt">{prompt}</div>}
      <ol className="kit-classify">
        {items.map((item) => {
          const choice = picked[item.id];
          const ok = choice === item.correct;
          return (
            <li key={item.id} className={choice ? (ok ? "ok" : "bad") : ""}>
              <div className="kit-classify-head">
                <strong>{item.label}</strong>
                {item.detail && <small>{item.detail}</small>}
              </div>
              <div className="kit-options" role="group" aria-label={`${item.label} 的归属`}>
                {options.map((o) => (
                  <button
                    key={o.id} type="button"
                    className={choice === o.id ? (ok ? "picked-ok" : "picked-bad") : ""}
                    aria-pressed={choice === o.id}
                    onClick={() => choose(item.id, o.id)}
                  >{o.label}</button>
                ))}
              </div>
              {choice && (
                <p className="kit-why">
                  <span aria-hidden="true">{ok ? "✓" : "✗"}</span>
                  {ok ? item.why : `再想想：${item.why}`}
                </p>
              )}
            </li>
          );
        })}
      </ol>
      {passed && <p className="answer-feedback passed kit-verdict">{passText} ✓</p>}
    </LabShell>
  );
}

/* ─────────────── 二、拨开关：改条件，看确定性结果 ─────────────── */

export type Control =
  | { kind: "segmented"; id: string; label: string; options: { id: string; label: string }[]; initial: string }
  | { kind: "switch"; id: string; label: string; note?: string; initial: boolean }
  | { kind: "slider"; id: string; label: string; min: number; max: number; step?: number; initial: number; format?: (v: number) => string };

export type ScenarioState = Record<string, string | boolean | number>;

export type Row = { label: string; value: string; tone?: "normal" | "good" | "bad" | "muted" };
export type Outcome = {
  rows: Row[];
  lines?: { text: string; tone?: "normal" | "good" | "bad" | "pause" }[];
  verdict?: { text: string; passed: boolean };
};

export function ScenarioLab({
  kicker, title, controls, compute, note, code, storageKey, prompt, rowsLabel = "结果",
}: {
  kicker: string; title: string; controls: Control[];
  compute: (s: ScenarioState) => Outcome;
  note?: ReactNode; code?: { summary: string; text: string };
  storageKey: string; prompt?: ReactNode; rowsLabel?: string;
}) {
  const initial = useMemo(() => {
    const s: ScenarioState = {};
    for (const c of controls) s[c.id] = c.initial;
    return s;
  }, [controls]);
  const [state, setState] = useState<ScenarioState>(initial);
  const complete = useComplete(storageKey);
  const out = useMemo(() => compute(state), [compute, state]);

  const set = (id: string, value: string | boolean | number) => {
    const next = { ...state, [id]: value };
    setState(next);
    const o = compute(next);
    complete(Boolean(o.verdict?.passed));
  };

  return (
    <LabShell
      kicker={kicker} title={title}
      status={out.verdict ? (out.verdict.passed ? "达成" : "还没达成") : "试试不同组合"}
      statusTone={out.verdict?.passed ? "done" : "idle"} note={note} code={code}
    >
      {prompt && <div className="kit-prompt">{prompt}</div>}
      <div className="kit-controls">
        {controls.map((c) => (
          <div className="kit-control" key={c.id}>
            <span className="kit-control-label">{c.label}</span>
            {c.kind === "segmented" && (
              <div className="kit-segmented" role="group" aria-label={c.label}>
                {c.options.map((o) => (
                  <button key={o.id} type="button"
                    className={state[c.id] === o.id ? "selected" : ""}
                    aria-pressed={state[c.id] === o.id}
                    onClick={() => set(c.id, o.id)}
                  >{o.label}</button>
                ))}
              </div>
            )}
            {c.kind === "switch" && (
              <label className={`kit-switch ${state[c.id] ? "on" : ""}`}>
                <input type="checkbox" checked={Boolean(state[c.id])}
                  onChange={(e) => set(c.id, e.target.checked)} />
                <span>{c.note ?? (state[c.id] ? "开" : "关")}</span>
              </label>
            )}
            {c.kind === "slider" && (
              <div className="kit-slider">
                <input type="range" min={c.min} max={c.max} step={c.step ?? 1}
                  value={Number(state[c.id])} aria-label={c.label}
                  onChange={(e) => set(c.id, Number(e.target.value))} />
                <b>{c.format ? c.format(Number(state[c.id])) : String(state[c.id])}</b>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="kit-outcome">
        <div className="kit-rows">
          <p className="panel-kicker">{rowsLabel}</p>
          <dl>
            {out.rows.map((r) => (
              <div key={r.label} className={r.tone ? `tone-${r.tone}` : ""}>
                <dt>{r.label}</dt><dd>{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        {out.lines && out.lines.length > 0 && (
          <div className="kit-log" aria-live="polite">
            {out.lines.map((l, i) => <p key={i} className={`log-${l.tone ?? "normal"}`}>{l.text}</p>)}
          </div>
        )}
      </div>

      {out.verdict && (
        <p className={`answer-feedback kit-verdict ${out.verdict.passed ? "passed" : ""}`}>
          {out.verdict.text}{out.verdict.passed ? " ✓" : ""}
        </p>
      )}
    </LabShell>
  );
}

/* ─────────────── 三、排序：把条目排成正确顺序 ─────────────── */

export type OrderItem = { id: string; label: string; detail?: string };

export function OrderLab({
  kicker, title, items, correct, initialOrder, passText, note, code, storageKey, prompt, positionLabel,
}: {
  kicker: string; title: string; items: OrderItem[]; correct: string[];
  /** 打乱后的起始顺序。省略则用 items 的顺序——那通常就是答案，等于一进来就通关。 */
  initialOrder?: string[];
  passText: string; note?: ReactNode; code?: { summary: string; text: string };
  storageKey: string; prompt?: ReactNode; positionLabel?: (i: number) => string;
}) {
  const [order, setOrder] = useState<string[]>(() => initialOrder ?? items.map((i) => i.id));
  const complete = useComplete(storageKey);
  const rightCount = order.filter((id, i) => id === correct[i]).length;
  const passed = rightCount === correct.length;

  const move = (index: number, delta: number) => {
    const to = index + delta;
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    [next[index], next[to]] = [next[to], next[index]];
    setOrder(next);
    complete(next.every((id, i) => id === correct[i]));
  };

  return (
    <LabShell
      kicker={kicker} title={title}
      status={passed ? "顺序正确" : `${rightCount} / ${correct.length} 个位置正确`}
      statusTone={passed ? "done" : "idle"} note={note} code={code}
    >
      {prompt && <div className="kit-prompt">{prompt}</div>}
      <ol className="kit-order">
        {order.map((id, index) => {
          const item = items.find((i) => i.id === id)!;
          const ok = correct[index] === id;
          return (
            <li key={id} className={ok ? "ok" : ""}>
              <span className="kit-order-index">{positionLabel ? positionLabel(index) : index + 1}</span>
              <div className="kit-order-body">
                <strong>{item.label}</strong>
                {item.detail && <small>{item.detail}</small>}
              </div>
              <div className="kit-order-moves">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`把「${item.label}」上移`}>↑</button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === order.length - 1} aria-label={`把「${item.label}」下移`}>↓</button>
              </div>
            </li>
          );
        })}
      </ol>
      {passed && <p className="answer-feedback passed kit-verdict">{passText} ✓</p>}
    </LabShell>
  );
}
