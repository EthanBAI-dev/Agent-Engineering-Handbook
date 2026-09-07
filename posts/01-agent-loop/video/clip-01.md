---
post_slug: 01-agent-loop
format: A                      # 竖屏切片
target_length: "60s"
platforms: [douyin, xiaohongshu, shorts, bilibili]
voiceover: none                # V0 阶段：无人声，靠屏幕字 + 字幕
status: ready-to-encode
---

# 切片 01：你就是那个验证循环

## 一句话卖点

**你没给它一个能自己跑的检查，你就是那个验证循环。**
这是「盯着它干活」和「可以走开」的分界线。

## 钩子（前 7 秒，逐字写死）

> 你没给它一个能自己跑的检查，
> 你就是那个验证循环。

## 分镜表

| # | 时间 | 时长 | 画面 | 屏幕字 / 要点 | 素材 |
| --- | --- | --- | --- | --- | --- |
| 1 | 0:00-0:07 | 7s | 大字钩子，蓝色高亮 | 「你没给它一个能自己跑的检查，你就是那个验证循环。」 | `frame-01.png` |
| 2 | 0:07-0:20 | 13s | 竖版三阶段循环图 | 收集上下文 → 采取行动 → 验证结果 | `frame-02.png` ← `agent-loop-vertical.svg` |
| 3 | 0:20-0:34 | 14s | 三个干预点列表 | ① 入口收窄 ② 中途 Esc ③ 出口给检查 | `frame-03.png` |
| 4 | 0:34-0:48 | 14s | 提示词 before/after 对比卡 | 红卡 vs 绿卡 | `frame-04.png` |
| 5 | 0:48-0:56 | 8s | 三条结论 | 有东西可验证 / 要证据 / 验证不了别合并 | `frame-05.png` |
| 6 | 0:56-1:00 | 4s | 引导 | 完整版在文章里 + 仓库地址 | `frame-06.png` |

> 时长数组同时写在 `scripts/build-clip.sh` 的 `DUR` 和
> `assets/diagrams/src/clip-01-preview.html` 的 `DUR` 里，改这里要同步改那两处。

## 素材清单

| 编号 | 类型 | 来源 | 状态 |
| --- | --- | --- | --- |
| S01 | 竖屏帧 ×6 | `assets/diagrams/src/clip-01.html` → `make frames` | ✅ 已生成 |
| S02 | 竖版机制图 | `assets/diagrams/agent-loop-vertical.mmd` | ✅ 已生成 |
| S03 | 字幕 | `subs.zh.srt` | ✅ 已写 |
| S04 | 终端 B 卷（可选） | `plan-mode.tape` | ⬜ 需在本地跑 VHS |

## 出片

```bash
make frames          # 1080x1920 ×6 帧
make clip            # 合成 60s 静音视频
# 烧字幕
ffmpeg -i build/clip-01-silent.mp4 \
       -vf "subtitles=posts/01-agent-loop/video/subs.zh.srt" \
       build/clip-01.mp4
```

不装 ffmpeg 也能先看效果：浏览器打开
`assets/diagrams/src/clip-01-preview.html`，按分镜时长自动播放。

> ⚠️ 已知限制：本仓库的容器环境只有 Playwright 附带的精简版 ffmpeg
> （无 libx264、无 pipe 协议），`make clip` 在容器里跑不出片。
> 帧、图、字幕都已就绪，**最后一步合成需要在装有完整 ffmpeg 的机器上执行**。

## 发布文案

### 抖音 / 小红书
```
标题：你可能一直在给 AI 当「人肉测试员」
正文：
用 Claude Code / Codex 写代码，最大的效率差别不在提示词写得多花哨，
而在你有没有给它一个「它自己能跑的检查」。
没有检查，它只能靠「看起来做完了」停下来——那个发现错误的人就是你。
三个干预点 + 一个改提示词的例子，60 秒讲完。
完整版看主页仓库。
#AI编程 #ClaudeCode #Codex #程序员
```

### YouTube Shorts / X
```
You don't have a prompting problem. You have a verification problem.
If the agent can't run a check itself, you ARE the verification loop.
```

## 复盘（发布后填）

- 完播率：
- 互动：
- 下次改进：
