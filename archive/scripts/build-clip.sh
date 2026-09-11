#!/usr/bin/env bash
# 把竖屏帧按分镜时长合成 60s 视频。
# 首选完整版 ffmpeg（concat demuxer + libx264 → mp4）；
# 只有精简版 ffmpeg 时自动降级为 image2pipe + libvpx → webm。
# 用法: bash scripts/build-clip.sh clip-01
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NAME="${1:-clip-01}"
FRAMES="$ROOT/assets/diagrams/$NAME"
OUT="$ROOT/build"; mkdir -p "$OUT"
FFMPEG="${FFMPEG_BIN:-$(command -v ffmpeg || echo /opt/pw-browsers/ffmpeg-1011/ffmpeg-linux)}"

# 每帧停留秒数，与 posts/01-agent-loop/video/clip-01.md 的分镜表一致（合计 60s）
DUR=(7 13 14 14 8 4)

mapfile -t FILES < <(find "$FRAMES" -name 'frame-*.png' | sort)
[ ${#FILES[@]} -eq 0 ] && { echo "没有帧，先跑 make frames"; exit 1; }

VF="fps=30,scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0xF8FAFC,format=yuv420p"

if "$FFMPEG" -hide_banner -encoders 2>/dev/null | grep -q libx264; then
  LIST="$OUT/$NAME.concat"; : > "$LIST"
  for i in "${!FILES[@]}"; do
    printf "file '%s'\nduration %s\n" "${FILES[$i]}" "${DUR[$i]}" >> "$LIST"
  done
  printf "file '%s'\n" "${FILES[-1]}" >> "$LIST"   # concat demuxer 要求重复末帧
  "$FFMPEG" -y -f concat -safe 0 -i "$LIST" -vf "$VF" -movflags faststart "$OUT/$NAME-silent.mp4"
  echo "==> $OUT/$NAME-silent.mp4"
else
  echo "!! 当前 ffmpeg 为精简版（无 libx264/concat），降级输出 webm 供预览"
  { for i in "${!FILES[@]}"; do
      for _ in $(seq 1 "${DUR[$i]}"); do cat "${FILES[$i]}"; done
    done; } | "$FFMPEG" -y -f image2pipe -framerate 1 -i - \
        -vf "$VF" -c:v libvpx -b:v 2M "$OUT/$NAME-silent.webm"
  echo "==> $OUT/$NAME-silent.webm （正式出片请在装有完整 ffmpeg 的机器上重跑）"
fi

echo
echo "烧字幕： \$FFMPEG -i $OUT/$NAME-silent.mp4 \\"
echo "           -vf \"subtitles=posts/01-agent-loop/video/subs.zh.srt\" $OUT/$NAME.mp4"
