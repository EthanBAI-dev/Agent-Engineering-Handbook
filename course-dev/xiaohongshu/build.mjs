/**
 * 卡片脚本 → 小红书图文。
 *
 *   node build.mjs            渲染 PNG（1242×1656，3:4）+ 生成 Stitch 提示词
 *   node build.mjs --only 01  只做某一课
 *   node build.mjs --shoot <file.html>   把 Stitch 导出的 HTML 按 .xhs-card 截图
 *
 * 图片规格固定 1242×1656：小红书竖版 3:4，在信息流里占位最大。
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { renderLesson, CSS } from "./render.mjs";

/** playwright 常常是全局装的，逐个候选位置试一遍，兼容 ESM / CJS 两种导出 */
async function loadChromium() {
  const tries = [
    "playwright", "playwright-core",
    "/opt/node22/lib/node_modules/playwright/index.mjs",
    "/usr/lib/node_modules/playwright/index.mjs",
    "/usr/local/lib/node_modules/playwright/index.mjs",
  ];
  for (const t of tries) {
    try {
      const m = await import(t);
      const c = m.chromium ?? m.default?.chromium;
      if (c) return c;
    } catch { /* 下一个 */ }
  }
  throw new Error("找不到 playwright：npm i -g playwright，或在本目录 npm i playwright");
}

const HERE = dirname(fileURLToPath(import.meta.url));
const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const [CARD_W, CARD_H] = [621, 828];   // 3:4
const SCALE = 2;                       // 621×828 CSS px × 2 = 1242×1656
const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const shootFile = args.includes("--shoot") ? args[args.indexOf("--shoot") + 1] : null;

const launch = async () =>
  (await loadChromium()).launch({ executablePath: existsSync(CHROME) ? CHROME : undefined });

/* ── 模式一：把 Stitch 导出的 HTML 截成合规图片 ───────────────── */
async function shoot(file) {
  const out = resolve(HERE, "out", basename(file).replace(/\.html?$/, ""));
  mkdirSync(out, { recursive: true });
  const b = await launch();
  const p = await b.newPage({ viewport: { width: 900, height: 1000 }, deviceScaleFactor: SCALE });
  await p.goto("file://" + resolve(file), { waitUntil: "networkidle" });
  let cards = p.locator(".xhs-card");
  if (!(await cards.count())) cards = p.locator("section, .card");   // Stitch 没打类名时的兜底
  const n = await cards.count();
  if (!n) throw new Error("没找到卡片：给每张卡加 class=\"xhs-card\"，或改这里的选择器");
  for (let i = 0; i < n; i++) {
    const box = await cards.nth(i).boundingBox();
    if (!box) continue;
    const r = (box.width / box.height).toFixed(3);
    if (Math.abs(box.width / box.height - 0.75) > 0.01) {
      console.log(`  ⚠ 第 ${i + 1} 张比例 ${r}，不是 3:4（${Math.round(box.width)}×${Math.round(box.height)}）——按 3:4 裁切`);
    }
    await p.screenshot({
      path: `${out}/${String(i + 1).padStart(2, "0")}.png`,
      fullPage: true,
      clip: { x: Math.round(box.x), y: Math.round(box.y), width: CARD_W, height: CARD_H },
    });
  }
  console.log(`${out}  ${n} 张`);
  await b.close();
}

/* ── 模式二：从卡片脚本直接出图 + 出提示词 ────────────────────── */
function stitchPrompt(l, meta, contract) {
  const cards = [
    `【第 1 张 · 封面】\n  主标题（三行，逐字使用）：${l.cover.big.replace(/\n/g, " ／ ")}\n  其中「${l.cover.hl}」要用柠檬绿高亮块包住\n  副标题：${l.cover.sub}\n  左上角一枚黑底柠檬绿字的方形徽章：LESSON ${l.n} · ${l.unit}`,
    ...l.pages.map((p, i) => {
      const bits = [`【第 ${i + 2} 张】`, `  小标题：${p.h}`, `  正文（逐字使用，** 之间的字要用柠檬绿下划高亮）：\n    ${p.b.replace(/\n/g, "\n    ")}`];
      if (p.code) bits.push(`  代码块（深色底 #13221b，等宽字，不要行号）：\n    ${p.code.replace(/\n/g, "\n    ")}`);
      if (p.tag) bits.push(`  底部一条${p.warn ? "珊瑚色" : "浅绿色"}强调条：${p.tag}`);
      if (p.warn) bits.push(`  小标题前加一枚珊瑚色小标签「易踩坑」`);
      return bits.join("\n");
    }),
    `【第 ${l.pages.length + 2} 张 · 尾页】\n  标题：三句话带走\n  三条编号列表（柠檬绿方形数字块）：\n    ${l.end.join("\n    ")}\n  底部一块墨色卡片：全 31 课 · 每课都有可以自己拨的互动实验／主页合集持续更新`,
  ].join("\n\n");

  return `${contract}

【任务】
做一组小红书图文卡片，共 ${l.pages.length + 2} 张，纵向排列在同一页里。
每张卡片**严格 621 × 828 CSS px**（3:4），给每张卡加 class="xhs-card"，
卡与卡之间留 24px 间距。我会用脚本按这个类名逐张截图导出成 1242×1656。

【最重要的一条】
下面每张卡的文字都是最终稿。你的工作是排版，不是写作：
不许改写、精简、总结、换措辞，不许省略任何一句，不许加英文占位文案。
排不下就调字号和行距，不许删字。

【小红书的版式要求】
  - 手机上看得清：封面主标题 ≥ 64px，内页小标题 ≥ 38px，正文 ≥ 24px，行高 1.75
  - 一张卡只讲一件事，正文控制在 3–5 行，宁可留白也不要塞满
  - 每张卡四周内边距 52px，外面再套一圈 10px 的米白色内框
  - 卡片底纹：22px 网格的极淡圆点，只出现在内页，封面和尾页是纯色
  - 不要页码以外的装饰元素，不要 emoji，不要圆形头像

【卡片逐张脚本】
${cards}

【输出】
一页 HTML，包含全部 ${l.pages.length + 2} 张卡片，每张 class="xhs-card"。`;
}

async function main() {
  const data = JSON.parse(readFileSync(resolve(HERE, "cards.json"), "utf8"));
  // 网站契约里的「版心 710px / 正文 16px」是给文章页的，卡片是 621×828，
  // 直接抄过去会互相打架——所以只取配色、圆角、投影和禁用清单，排版规则另写。
  const site = readFileSync(resolve(HERE, "..", "stitch", "00-style-contract.md"), "utf8")
    .match(/```text\n([\s\S]*?)```/)[1];
  const keep = (name) => (site.split(/\n(?=\S)/).find((b) => b.trimStart().startsWith(name)) || "").trimEnd();
  const contract = ["【风格契约 · 必须严格遵守，附图为准】",
    "",
    "这是一个已上线的中文技术教学账号的图文卡片，不是重新设计品牌。",
    "附图是同一套视觉的真实成品，你的产出必须能和它放在同一个账号里而看不出差别。",
    "",
    keep("配色"), "", keep("圆角"), "", keep("投影"), "", keep("绝对不要出现"),
  ].join("\n").trim();
  const lessons = only ? data.lessons.filter((l) => l.n === only) : data.lessons;

  for (const d of ["out", "prompts"]) {
    const p = resolve(HERE, d);
    if (!only && existsSync(p)) rmSync(p, { recursive: true });
    mkdirSync(p, { recursive: true });
  }

  const b = await launch();
  for (const l of lessons) {
    const html = `<!doctype html><meta charset="utf-8"><style>${CSS}</style><div class="deck">${renderLesson(l, data.meta)}</div>`;
    const dir = resolve(HERE, "out", `L${l.n}`);
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, "preview.html"), html);

    const p = await b.newPage({ viewport: { width: 720, height: 900 }, deviceScaleFactor: SCALE });
    await p.setContent(html, { waitUntil: "networkidle" });
    const cards = p.locator(".card");
    const n = await cards.count();
    for (let i = 0; i < n; i++) {
      // 用 clip 精确裁，element.screenshot() 会因子像素把宽度撑成 1244
      const box = await cards.nth(i).boundingBox();
      await p.screenshot({
        path: `${dir}/${String(i + 1).padStart(2, "0")}.png`,
        fullPage: true,
        fullPage: true,
      clip: { x: Math.round(box.x), y: Math.round(box.y), width: CARD_W, height: CARD_H },
      });
    }
    // 溢出自检：文字排不下会被 overflow:hidden 吃掉，这里主动查出来
    const over = await p.evaluate(() =>
      [...document.querySelectorAll(".card")]
        .map((c, i) => (c.scrollHeight > c.clientHeight + 1 ? i + 1 : 0))
        .filter(Boolean));
    await p.close();

    const tags = l.tags.map((t) => "#" + t).join(" ");
    writeFileSync(resolve(HERE, "prompts", `L${l.n}.md`), `# 第 ${l.n} 课 · 小红书图文

## 标题（上限 20 字，第一个是主推）

${l.titles.map((t, i) => `${i + 1}. ${t}　　（${[...t].length} 字）`).join("\n")}

## Stitch 提示词（整段复制，附 \`../out/L${l.n}/01.png\` 当参考图）

\`\`\`text
${stitchPrompt(l, data.meta, contract)}
\`\`\`

## 正文文案

\`\`\`text
${l.caption}

${tags}
\`\`\`

## 配图（如果想额外配一张插画）

\`\`\`text
${l.art}

风格：扁平矢量插画，粗细均匀的线条，柠檬绿 #bafa4b 与深绿 #355e48 点缀，
米白 #f2efe6 底色，硬边不要渐变，不要光晕，不要 3D，不要写实材质。
画面里不要出现任何文字。
比例 3:4。
\`\`\`

## 本地已渲染

\`out/L${l.n}/\` 里有 ${n} 张 1242×1656 的成品，可以直接发；
\`preview.html\` 是同一份版式，可以拖进 Stitch 当参考。
`);
    console.log(`L${l.n}  ${n} 张${over.length ? `  ⚠ 第 ${over.join("、")} 张文字溢出，需要删字或调字号` : ""}`);
  }
  await b.close();
}

if (shootFile) await shoot(shootFile); else await main();
