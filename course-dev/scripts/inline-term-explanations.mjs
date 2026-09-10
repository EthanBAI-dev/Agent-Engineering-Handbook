import { readFileSync, writeFileSync } from "node:fs";

const lessons = [
  "00-preface-and-setup.md",
  "01-graph-and-state.md",
  "02-tool-loop.md",
  "03-memory-and-threads.md",
  "04-human-in-the-loop.md",
  "05-complete-agent-blueprint.md",
];

function stripEndingPunctuation(text) {
  return text.replace(/[。；]+$/u, "");
}

function convertLesson(markdown, filename) {
  const lines = markdown.split(/\r?\n/u);
  const output = [];

  for (let index = 0; index < lines.length;) {
    const header = lines[index].match(/^> \*\*术语说明(?:｜(.+?))?\*\*\s*$/u);

    if (!header) {
      output.push(lines[index]);
      index += 1;
      continue;
    }

    const term = header[1];
    const quoteLines = [];
    index += 1;

    while (index < lines.length && lines[index].startsWith(">")) {
      quoteLines.push(lines[index].replace(/^>\s?/u, ""));
      index += 1;
    }

    if (term) {
      const explanation = quoteLines.filter(Boolean).join(" ");
      if (!explanation) throw new Error(`${filename}: ${term} 缺少解释`);
      output.push(`它${explanation}`);
      continue;
    }

    const entries = quoteLines
      .filter(Boolean)
      .map((line) => line.match(/^- \*\*(.+?)\*\*：\s*(.+)$/u))
      .filter(Boolean)
      .map((match) => `${match[1]}${stripEndingPunctuation(match[2])}`);

    if (!entries.length) throw new Error(`${filename}: 无法解析术语列表`);
    output.push(`其中，${entries.join("；")}。`);
  }

  const smoothed = output
    .join("\n")
    .replace(/^它的作用是：/gmu, "它")
    .replace(/^其中，(.+)$/gmu, (_, body) => `其中，${body.split("；").map((part) => part.replace("：", "")).join("；")}`);

  return `${smoothed.replace(/\n*$/u, "")}\n`;
}

for (const lesson of lessons) {
  const path = new URL(`../../content/lessons/${lesson}`, import.meta.url);
  const original = readFileSync(path, "utf8");
  const converted = convertLesson(original, lesson);
  writeFileSync(path, converted, "utf8");
  console.log(`${lesson}: 已改为行内术语解释`);
}
