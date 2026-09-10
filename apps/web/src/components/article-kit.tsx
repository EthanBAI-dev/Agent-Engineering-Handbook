import type { ReactNode } from "react";
import { annotate } from "@/components/auto-term";

/** 正文里的代码块。代码本身不做术语标注，说明文字才做。 */
export function CodeBlock({ caption, children }: { caption?: string; children: string }) {
  return (
    <figure className="code-figure">
      {caption && <figcaption>{caption}</figcaption>}
      <pre><code>{children}</code></pre>
    </figure>
  );
}

/** 纯文本示意图（流程、消息顺序）。等宽显示，允许横向滚动。 */
export function AsciiFigure({ caption, children }: { caption?: string; children: string }) {
  return (
    <figure className="ascii-figure">
      <pre><code>{children}</code></pre>
      {caption && <figcaption>{annotate(caption)}</figcaption>}
    </figure>
  );
}

/** 带编号的检查清单：结果不对时按顺序排查。 */
export function Checklist({ title, items }: { title: string; items: ReactNode[] }) {
  return (
    <div className="checklist">
      <p className="checklist-title">{annotate(title)}</p>
      <ol>
        {items.map((item, index) => (
          <li key={index}>{annotate(item)}</li>
        ))}
      </ol>
    </div>
  );
}

/** 常见误区：先复述读者心里那句话，再说明为什么不成立。 */
export function Misconceptions({
  items,
}: {
  items: { claim: string; verdict: string; body: ReactNode }[];
}) {
  return (
    <div className="misconceptions">
      {items.map((item) => (
        <article key={item.claim}>
          <p className="misconception-claim">「{annotate(item.claim)}」</p>
          <strong className="misconception-verdict">{item.verdict}</strong>
          <div>{annotate(item.body)}</div>
        </article>
      ))}
    </div>
  );
}

/** 「自己运行真实代码」区块：课程事实以本地脚本为准。 */
export function RunLocally({
  file,
  command,
  children,
}: {
  file: string;
  command: string;
  children?: ReactNode;
}) {
  return (
    <div className="run-locally">
      <p className="panel-kicker">RUN IT YOURSELF</p>
      <p className="run-file">
        完整代码：<code>{file}</code>
      </p>
      <pre className="run-command"><code>{command}</code></pre>
      {children && <div className="run-note">{annotate(children)}</div>}
    </div>
  );
}

/** 本课带走的三句话。 */
export function Takeaways({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="chapter-summary">
      <strong>{title}</strong>
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}

/** 侧栏式提醒：边界、风险和「暂时不讲」。 */
export function Callout({ tone = "note", title, children }: { tone?: "note" | "warn"; title: string; children: ReactNode }) {
  return (
    <aside className={`callout callout-${tone}`}>
      <strong>{annotate(title)}</strong>
      <div>{annotate(children)}</div>
    </aside>
  );
}
