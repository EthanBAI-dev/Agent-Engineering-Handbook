/** 卡片脚本 → HTML。build.mjs 用它渲染截图，也是给 Stitch 看的版式参考。 */
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

/** 正文里的 **粗** 转成 <b>，换行转段落 */
function body(t) {
  return esc(t)
    .split("\n\n")
    .map((p) => `<p>${p
      .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
      .replace(/`([^`]+)`/g, '<code class="inl">$1</code>')
      .replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function cover(l, meta) {
  const big = esc(l.cover.big)
    .split("\n")
    .map((line) => l.cover.hl && line.includes(l.cover.hl)
      ? line.replace(esc(l.cover.hl), `<em>${esc(l.cover.hl)}</em>`)
      : line)
    .join("<br>");
  return `<section class="card cover">
  <div class="badge">LESSON ${esc(l.n)} · ${esc(l.unit)}</div>
  <h1>${big}</h1>
  <p class="sub">${esc(l.cover.sub)}</p>
  <div class="footer"><span>${esc(meta.account)}</span><span>${l.pages.length + 2} 页</span></div>
</section>`;
}

function page(l, p, i, total) {
  const plain = !p.code && !p.tag;   // 纯文字页居中，否则底部一大块死白
  return `<section class="card ${p.warn ? "warn " : ""}${plain ? "plain" : ""}">
  <div class="kicker"><span>LESSON ${esc(l.n)}</span><span>${i + 2} / ${total}</span></div>
  <h2>${p.warn ? '<i class="mark">易踩坑</i>' : ""}${esc(p.h)}</h2>
  <div class="body">${body(p.b)}</div>
  ${p.code ? `<pre><code>${esc(p.code)}</code></pre>` : ""}
  ${p.tag ? `<div class="tag">${esc(p.tag)}</div>` : ""}
</section>`;
}

function end(l, total, meta) {
  return `<section class="card end">
  <div class="kicker"><span>LESSON ${esc(l.n)}</span><span>${total} / ${total}</span></div>
  <h2>三句话带走</h2>
  <ol>${l.end.map((t) => `<li><span>${esc(t)}</span></li>`).join("")}</ol>
  <div class="cta">全 31 课 · 每课都有可以自己拨的互动实验<br><b>主页合集持续更新</b></div>
  <div class="footer"><span>${esc(meta.account)}</span></div>
</section>`;
}

export function renderLesson(l, meta) {
  const total = l.pages.length + 2;
  return [cover(l, meta), ...l.pages.map((p, i) => page(l, p, i, total)), end(l, total, meta)].join("\n");
}

export const CSS = `
:root{
  --ink:#17231f; --muted:#68736d; --paper:#f2efe6; --card:#fffdf7;
  --line:#c9cfc7; --lime:#bafa4b; --on-lime:#4d7100; --green:#355e48;
  --coral:#ff8f72; --coral-wash:#ffece7; --tertiary:#9c432c;
  --wash:#e8efe9; --term:#13221b; --term-ink:#e6f4ed;
  --ui:"Inter","PingFang SC","Microsoft YaHei",sans-serif;
  --mono:"JetBrains Mono","SFMono-Regular",Menlo,monospace;
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#8b948d;font-family:var(--ui);-webkit-font-smoothing:antialiased}
.deck{display:flex;flex-direction:column;align-items:center;gap:24px;padding:24px}
.card{
  width:621px;height:828px;flex:0 0 828px;position:relative;overflow:hidden;
  padding:56px 52px;background:var(--card);color:var(--ink);
  display:flex;flex-direction:column;
  background-image:radial-gradient(#e4e0d5 1px,transparent 1px);background-size:22px 22px;
}
.card::after{content:"";position:absolute;inset:0;border:10px solid var(--paper);pointer-events:none}

/* 封面 */
.cover{background:var(--paper);justify-content:center;background-image:none}
.cover::after{border-color:var(--card)}
.cover .badge{
  position:absolute;top:56px;left:52px;padding:7px 14px;border-radius:2px;
  background:var(--ink);color:var(--lime);font:800 17px/1 var(--mono);letter-spacing:.06em;
}
.cover h1{font:900 68px/1.22 var(--ui);letter-spacing:-.02em}
.cover h1 em{font-style:normal;background:var(--lime);color:var(--on-lime);
  padding:0 10px;border-radius:4px;box-decoration-break:clone}
.cover .sub{margin-top:28px;font:600 25px/1.55 var(--ui);color:var(--muted)}
.cover .footer{position:absolute;left:52px;right:52px;bottom:56px}

/* 内页 */
.kicker{display:flex;justify-content:space-between;
  font:700 16px/1 var(--mono);letter-spacing:.1em;color:var(--muted)}
.card h2{margin-top:30px;font:800 40px/1.35 var(--ui);letter-spacing:-.01em}
.mark{display:inline-block;margin-right:12px;padding:5px 12px;vertical-align:6px;
  border-radius:2px;background:var(--coral);color:#4a1a0e;font:800 17px/1 var(--ui);font-style:normal}
.body{margin-top:26px}
.plain{justify-content:center}
.plain .kicker{position:absolute;top:56px;left:52px;right:52px}
.plain h2{margin-top:0}
.body p{font:400 25px/1.78 var(--ui);color:#2d3a34}
.body p+p{margin-top:20px}
.inl{padding:2px 8px;border-radius:4px;background:var(--wash);
  font:600 22px/1 var(--mono);color:var(--green)}
.body b{font-weight:800;color:var(--ink);
  background:linear-gradient(transparent 62%,var(--lime) 62%)}
pre{margin-top:32px;padding:22px 24px;border-radius:8px;background:var(--term);overflow:hidden}
code{font:600 21px/1.7 var(--mono);color:var(--term-ink);white-space:pre}
.tag{margin-top:26px;padding:14px 18px;border-radius:8px;background:var(--wash);
  border-left:5px solid var(--green);font:700 22px/1.5 var(--ui);color:var(--green)}
.warn .tag{background:var(--coral-wash);border-left-color:var(--tertiary);color:var(--tertiary)}

/* 尾页 */
.end{background:var(--paper);background-image:none}
.end::after{border-color:var(--card)}
.end h2{margin-top:36px}
.end ol{margin-top:34px;list-style:none;display:flex;flex-direction:column;gap:22px}
.end li{display:flex;gap:18px;align-items:flex-start;counter-increment:n}
.end li::before{content:counter(n);flex:0 0 auto;width:42px;height:42px;border-radius:4px;
  background:var(--lime);color:var(--on-lime);font:900 22px/42px var(--mono);text-align:center}
.end li span{font:600 26px/1.6 var(--ui);padding-top:5px}
.end ol{counter-reset:n}
.cta{margin-top:auto;padding:24px;border-radius:8px;background:var(--ink);color:#e9f2e4;
  font:500 22px/1.6 var(--ui);text-align:center}
.cta b{color:var(--lime)}
.footer{margin-top:26px;display:flex;justify-content:space-between;
  font:700 18px/1 var(--mono);letter-spacing:.08em;color:var(--muted)}
`;
