#!/usr/bin/env bash
# 抓取官方文档到 references/ 本地镜像。
# 用法:  bash scripts/fetch-docs.sh [claude|platform|repos|all]
# 幂等：重复执行会覆盖更新。所有产物带 _MANIFEST.md 记录抓取时间与来源。
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REF="$ROOT/references"
UA="agent-engineering-handbook/1.0 (docs mirror)"
STAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
WHAT="${1:-all}"

fetch() { curl -sSL --fail --max-time 60 --retry 3 --retry-delay 2 -A "$UA" "$1" -o "$2"; }

# 从 Mintlify 风格的 llms.txt 索引批量抓 .md
# $1=llms.txt URL  $2=输出目录  $3=URL 过滤正则(egrep)  $4=URL 排除正则(可空)
mirror_llms_txt() {
  local index_url="$1" out="$2" keep="$3" drop="${4:-}"
  mkdir -p "$out"
  local idx="$out/_llms.txt"
  fetch "$index_url" "$idx" || { echo "!! 索引抓取失败: $index_url"; return 1; }

  local urls; urls=$(grep -oE 'https://[^) ]+\.md' "$idx" | sort -u | grep -E "$keep")
  [ -n "$drop" ] && urls=$(printf '%s\n' "$urls" | grep -vE "$drop")

  local n=0 fail=0
  while read -r u; do
    [ -z "$u" ] && continue
    local rel="${u#https://}"; rel="${rel#*/}"          # 去掉 host
    local dest="$out/$rel"
    mkdir -p "$(dirname "$dest")"
    if fetch "$u" "$dest"; then n=$((n+1)); else fail=$((fail+1)); echo "  ! $u"; fi
  done <<< "$urls"

  {
    echo "# 镜像清单"
    echo
    echo "- 索引: $index_url"
    echo "- 抓取时间(UTC): $STAMP"
    echo "- 成功: $n 页 ｜ 失败: $fail 页"
    echo
    echo "> 版权归原作者所有，此处仅为离线检索用的本地副本。以官网最新版本为准。"
  } > "$out/_MANIFEST.md"
  echo "==> $out : $n 页 (失败 $fail)"
}

# 只保留文本：删掉图片、字体、锁文件等，镜像是给人和 Agent 读的，不是给浏览器渲染的
prune_binaries() {
  local d="$1"
  find "$d" -type f \( \
      -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.gif' \
      -o -iname '*.webp' -o -iname '*.ico' -o -iname '*.mp4' -o -iname '*.woff*' \
      -o -iname '*.excalidraw.svg' \
      -o -iname 'package-lock.json' -o -iname 'pnpm-lock.yaml' -o -iname 'uv.lock' \
      -o -iname '*.bazel.lock' -o -iname 'flake.lock' -o -iname 'Cargo.lock' \
    \) -delete 2>/dev/null
  find "$d" -type d -empty -delete 2>/dev/null
}

# 稀疏克隆一个仓库的若干目录
# $1=仓库URL $2=输出目录 $3...=要保留的路径
sparse_clone() {
  local url="$1" out="$2"; shift 2
  rm -rf "$out"; mkdir -p "$(dirname "$out")"
  if ! git clone --depth 1 --filter=blob:none --sparse "$url" "$out" >/dev/null 2>&1; then
    echo "!! clone 失败: $url"; return 1
  fi
  # cone 模式只接受目录；根目录文件(README/LICENSE 等)本来就会带上
  if [ "$#" -gt 0 ] && [ "$1" != "." ]; then
    ( cd "$out" && git sparse-checkout set "$@" ) || echo "  ! sparse-checkout 失败，保留全量"
  fi
  local sha; sha=$(cd "$out" && git rev-parse --short HEAD)
  rm -rf "$out/.git"
  prune_binaries "$out"
  {
    echo "# $(basename "$out")"
    echo
    echo "- 来源: $url"
    echo "- commit: \`$sha\`"
    echo "- 抓取时间(UTC): $STAMP"
    echo "- 保留路径: $*"
    echo
    echo "> 版权与许可证以原仓库为准（见同目录 LICENSE，如有）。"
  } > "$out/_MANIFEST.md"
  echo "==> $out : $sha"
}

if [ "$WHAT" = "claude" ] || [ "$WHAT" = "all" ]; then
  # Claude Code 全量文档（约 200 页）
  mirror_llms_txt "https://code.claude.com/docs/llms.txt" \
                  "$REF/anthropic-claude-code" '^https://code\.claude\.com/'
fi

if [ "$WHAT" = "platform" ] || [ "$WHAT" = "all" ]; then
  # Claude 平台文档，排除 api/ 逐接口参考（对本专题价值低、体积大）
  mirror_llms_txt "https://docs.claude.com/llms.txt" \
                  "$REF/anthropic-platform" '/docs/en/' '/docs/en/api/'
fi

if [ "$WHAT" = "repos" ] || [ "$WHAT" = "all" ]; then
  sparse_clone https://github.com/openai/codex.git \
               "$REF/openai-codex" docs
  sparse_clone https://github.com/google-gemini/gemini-cli.git \
               "$REF/google-gemini-cli" docs
  sparse_clone https://github.com/modelcontextprotocol/modelcontextprotocol.git \
               "$REF/mcp-spec" docs schema specification
  sparse_clone https://github.com/openai/openai-agents-python.git \
               "$REF/openai-agents-sdk" docs
  sparse_clone https://github.com/openai/agents.md.git \
               "$REF/agents-md" . 
fi

echo
echo "完成。镜像位于 $REF"
