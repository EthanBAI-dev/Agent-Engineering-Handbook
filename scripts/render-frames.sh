#!/usr/bin/env bash
# 把 assets/diagrams/src/<name>.html 的每一帧截成竖屏 PNG。
# 用法: bash scripts/render-frames.sh clip-01 6
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NAME="${1:?用法: render-frames.sh <html名> <帧数>}"
N="${2:-6}"
CHROME="${CHROME_BIN:-/opt/pw-browsers/chromium-1194/chrome-linux/chrome}"
SRC="$ROOT/assets/diagrams/src/$NAME.html"
OUT="$ROOT/assets/diagrams/$NAME"
mkdir -p "$OUT"
for i in $(seq 1 "$N"); do
  "$CHROME" --headless --no-sandbox --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=1 --window-size=1080,1920 \
    --screenshot="$OUT/frame-$(printf %02d "$i").png" \
    "file://$SRC?frame=$i" >/dev/null 2>&1
  echo "  -> $OUT/frame-$(printf %02d "$i").png"
done
echo "完成：$N 帧 @ 1080x1920"
