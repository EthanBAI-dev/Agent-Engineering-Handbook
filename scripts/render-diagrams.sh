#!/usr/bin/env bash
# 批量把 assets/ 下的 *.mmd 渲染成透明底 SVG（含 assets/lessons/ 的课程配图）。
# 依赖: npm i -g @mermaid-js/mermaid-cli
# 用法: bash scripts/render-diagrams.sh [文件名...]   不带参数则全量
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SEARCH=("$ROOT/assets/lessons" "$ROOT/assets/diagrams")
CFG="$ROOT/assets/diagrams/_puppeteer.json"

# 无 chromium 配置时（本地装了系统 chrome 的情况）自动跳过 -p
PFLAG=()
[ -f "$CFG" ] && PFLAG=(-p "$CFG")

files=("$@")
if [ ${#files[@]} -eq 0 ]; then
  for d in "${SEARCH[@]}"; do
    [ -d "$d" ] && while IFS= read -r f; do files+=("$f"); done < <(find "$d" -maxdepth 1 -name '*.mmd')
  done
fi
if [ ${#files[@]} -eq 0 ]; then echo "没有找到 .mmd 文件"; exit 0; fi

for f in "${files[@]}"; do
  out="${f%.mmd}.svg"
  mmdc "${PFLAG[@]}" -i "$f" -o "$out" -t neutral -b transparent -w 1400 >/dev/null
  echo "  -> $out"
done
echo "完成：${#files[@]} 张"
