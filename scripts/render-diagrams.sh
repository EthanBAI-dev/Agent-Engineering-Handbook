#!/usr/bin/env bash
# 批量把 assets/diagrams/*.mmd 渲染成透明底 SVG。
# 依赖: npm i -g @mermaid-js/mermaid-cli
# 用法: bash scripts/render-diagrams.sh [文件名...]   不带参数则全量
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$ROOT/assets/diagrams"
CFG="$DIR/_puppeteer.json"

# 无 chromium 配置时（本地装了系统 chrome 的情况）自动跳过 -p
PFLAG=()
[ -f "$CFG" ] && PFLAG=(-p "$CFG")

files=("$@")
[ ${#files[@]} -eq 0 ] && mapfile -t files < <(find "$DIR" -maxdepth 1 -name '*.mmd')

for f in "${files[@]}"; do
  out="${f%.mmd}.svg"
  mmdc "${PFLAG[@]}" -i "$f" -o "$out" -t neutral -b transparent -w 1400 >/dev/null
  echo "  -> $out"
done
echo "完成：${#files[@]} 张"
