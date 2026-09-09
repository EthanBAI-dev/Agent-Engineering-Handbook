# 交接说明

**给下一个接手的人（或下一个会话）。读完这一份就能继续，不需要翻聊天记录。**

最后更新：2026-09-09 · 分支 `claude/amazing-wozniak-rh6ryk` · 最新提交 `8003135`

---

## 一、一句话状态

《LangGraph 三十一讲》**大纲、写作规范、机检工具链已全部就位；
31 讲里写完 4 讲（00、02、05 完稿，01 差回填），还剩 27 讲。**

---

## 二、起手式

```bash
git clone -b claude/amazing-wozniak-rh6ryk \
  https://github.com/EthanBAI-dev/Agent-Engineering-Handbook.git
cd Agent-Engineering-Handbook
```

**动笔前按这个顺序读四份文件，一份都不能跳：**

| 顺序 | 文件 | 为什么必读 |
| --- | --- | --- |
| 1 | `.claude/skills/langgraph-course-lesson/SKILL.md` | 写作规范总纲。**用 Claude Code 的话直接 `/langgraph-course-lesson` 调起** |
| 2 | `docs/learn-langgraph/参考资料/课程脉络与概念归属表.md` | **全课唯一结构依据**。31 讲逐讲脉络 + 概念归属 |
| 3 | `.claude/skills/.../references/零基础规则.md` | 读者画像、术语准入、开头规则 |
| 4 | `.claude/skills/.../references/rubric.md` | 评分维度与硬性发布门槛 |

再装一次环境（只为跑课程代码，写文章不需要）：

```bash
cd docs/learn-langgraph
python3 -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -U langgraph langchain-deepseek
```

---

## 三、已完成

| 文件 | 状态 |
| --- | --- |
| `参考资料/课程脉络与概念归属表.md` | ✅ 31 讲脉络、概念归属、实验与配图归属 |
| `参考资料/资源调研.md` | ✅ 欧美资源横向对比，分主线／补充／保持不落伍三类 |
| `参考资料/原始素材大纲.md` | ✅ 源课程大纲，仅供检索 |
| `LangGraph三十一讲/第00课-*.md` | ✅ 课程路线 + 环境部署（环境与路线的唯一处），机检全绿 |
| `LangGraph三十一讲/第01课-*.md` | 🟡 **正文完成，五处模型输出待回填**，机检全绿 |
| `LangGraph三十一讲/第02课-*.md` | ✅ 完稿并实跑，机检全绿 |
| `LangGraph三十一讲/第05课-*.md` | ✅ 完稿并实跑，机检全绿 |
| `课程代码/lessons/lesson02_simple_graph.py` | ✅ 实跑通过，零钥匙 |
| `课程代码/lessons/lesson05_hand_written_agent.py` | ✅ 实跑通过，零钥匙 |
| `课程代码/lessons/lesson01_talk_to_model.py` | 🟡 语法通过，**未实跑**（需钥匙） |
| `课程代码/lgkit/fake_model.py` | ✅ 按剧本回话的假模型，让不需要钥匙的讲次也能演示模型行为 |
| skill 全套（规范 + 4 份参考 + 4 个机检脚本 + 术语词典） | ✅ 已从音频课程迁移并适配 |

## 四、未完成

- **第 01 讲的五处回填**（见第六节，这是唯一的阻塞项）
- **第 03、04、06–31 讲**，共 27 讲
- 全课零张图。配图计划在脉络表第五节，**正文定稿后才画**

---

## 五、下一步做什么

**建议写第 03 讲**（`module-1/chain`，把对话装进图）。它承接第 01 讲留下的
「模型记不住」，正好接上。

### 写任何一讲的固定流程

```
读脉络表该讲那一行（承接／新概念／交给下一讲）
  → 读源 notebook 的单元格顺序
  → 读前后两讲的正文，确认承接与交接对得上
  → 先写脚本并实跑
  → 再把真实输出写进正文
  → 跑机检，ERROR 清零
  → 更新脉络表第六节的进度
```

**顺序不能反。先写正文后补数据 = 编数据，rubric 维度 5 直接判 0。**

### 第 03 讲的任务卡

| 项 | 内容 |
| --- | --- |
| 源 | `langchain-ai/langchain-academy` → `module-1/chain.ipynb` |
| 驱动问题 | 怎么把对话装进图 |
| 承接 | 第 02 讲结尾：「图里流的是普通字典，怎么装得下一整段会不断变长的对话」 |
| 本讲拥有 | 消息状态、`add_messages`、把模型当成一个节点 |
| 交给 04 | 下一步走哪儿还是写死的 |
| **归属红线** | 讲 `add_messages` 时**只说它负责把新消息接到旧消息后面**，
**绝不解释归并器是什么、怎么自定义**——那是第 10 讲的 |
| 钥匙 | 需要。**没钥匙就用 `lgkit/fake_model.py`**，但必须在正文注明这是确定输出 |

---

## 六、唯一的阻塞项：第 01 讲回填

第 01 讲有五处 `（待回填：……）`，是模型的真实回话。

**原因**：上一个会话的出网策略拒绝 `api.deepseek.com`
（代理返回 `403 to CONNECT`），钥匙给了也连不出去。

**两条解法，任选其一：**

**A. 换一个能连 DeepSeek 的环境**，然后：

```bash
export DEEPSEEK_API_KEY="..."        # Windows: $env:DEEPSEEK_API_KEY="..."
python 课程代码/lessons/lesson01_talk_to_model.py
```

脚本会用两行 `====` 把输出框起来，把框里内容逐段替换那五处。

**B. 让用户在自己电脑上跑**，把输出交回来再回填。

**回填前第 01 讲不算完稿。** 按 rubric 维度 5，正文出现没跑过的输出直接判 0。

---

## 七、已定的决策，不要重新讨论

1. **课程骨架来自官方 30 个 notebook 的原始顺序**，不是自编的。
   唯一的编辑增补是第 05 讲（手写 agent），已在脉络表标明理由。
2. **模型用 DeepSeek**，兼容 OpenAI 接口。全课只有一行跟厂商有关。
3. **环境与课程路线只写在第 00 讲**，其余各讲只留一句链接。
4. **导读 2–3 句、60–120 字**。（曾自创过「导读只有一行」，
   与 `check-readability.mjs` 冲突，已撤销，不要改回去。）
5. **以 Windows 为主**，Mac 放在「特殊情况」一节。
6. **零钥匙优先**：能用假模型演示机制的就别要钥匙。第 00、02、05 讲全程零成本。
7. **版本相关的数字一律以本机实跑为准**，不引用记忆值。

---

## 八、不要覆盖的文件

| 路径 | 原因 |
| --- | --- |
| `草稿/` 全部 | 早期原稿，保留备查。**自编大纲，不能当结构依据** |
| `.claude/skills/.../references/原始素材/` 全部 | 音频课程的未适配原稿，保留备查 |
| `NOTES.md` | 学习者本人的笔记，**只追加，不改已有条目** |
| `课程代码/lessons/*.py` | 改动后**必须重跑并同步正文里引用的输出** |

`草稿/handoff-旧稿.md` 已作废，以本文件为准。

---

## 九、验证命令与期望结果

```bash
cd docs/learn-langgraph
S=../../.claude/skills/langgraph-course-lesson/scripts

node $S/check-readability.mjs   LangGraph三十一讲/    # 期望：合计 ERROR 0
node $S/check-markdown-math.mjs LangGraph三十一讲/    # 期望：ERROR 0

python3 课程代码/lessons/lesson02_simple_graph.py       # 期望：两次调用走不同分支
python3 课程代码/lessons/lesson05_hand_written_agent.py # 期望：连调三次工具；
                                                        # 上下文 27→607→1187→1767 字；
                                                        # 第三个工具报错时前两步白跑
```

**四讲当前均为 ERROR 0 / WARN 0。任何一讲写完都要重跑这四条。**

发布前还要扫一遍来源措辞，命中必须清零：

```bash
grep -nE 'notebook|Notebook|单元格|Module|模块 [0-9]|官方课程|源课程' LangGraph三十一讲/*.md
```

---

## 十、已知风险与踩过的坑

| 风险 | 说明 |
| --- | --- |
| **网络策略** | `academy.langchain.com`、`docs.langchain.com`、`deeplearning.ai`、`api.deepseek.com` 在上一个会话均被拒。大纲是从 GitHub 仓库还原的，**要核对课程页面得换网络环境** |
| **版本数字别信记忆** | 曾把递归上限记成 25，**实测 langgraph 1.2.11 是 10007**。凡是版本相关的数字，跑一遍再写 |
| **机检不是判官** | ERROR 0 只说明格式过关，**不能证明跟着源课程走，也识别不了换个说法后的重复**。归属边界要人工对照归属表核 |
| **导读里的解释不算数** | `check-readability.mjs` 只认正文。术语在导读里解释过，正文第一次真用时仍要重新解释一遍 |
| **`langgraph.prebuilt` 已废弃** | v1 后能力搬到 `langchain.agents`。**网上 2024 年的教程大半是旧写法，不能照抄** |
| **多角色那几讲的依赖未验证** | `langgraph-supervisor`、`langgraph-swarm-py` 在 1.x 下的维护状态没实测，写到第 23 讲前必须先验 |
