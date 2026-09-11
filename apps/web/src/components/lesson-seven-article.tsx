"use client";

import { ScenarioLab, type ScenarioState } from "@/components/lab-kit";
import { Prose } from "@/components/auto-term";
import { AsciiFigure, Callout, Checklist, Misconceptions, Takeaways } from "@/components/article-kit";

const PLACES = [
  { id: "const", label: "前端组件里的常量" },
  { id: "public", label: "NEXT_PUBLIC_ 变量" },
  { id: "env", label: "服务端 .env" },
  { id: "vercel", label: "平台环境变量" },
];

function compute(s: ScenarioState) {
  const place = String(s.place);
  const exposed = place === "const" || place === "public";
  const committed = place === "env" && !s.gitignored;
  return {
    rows: [
      { label: "访问者能不能读到密钥", value: exposed ? "能，打开开发者工具就看得到" : "不能", tone: exposed ? "bad" as const : "good" as const },
      { label: "会不会被提交进 Git", value: committed ? "会，.gitignore 没挡住" : place === "env" ? "不会" : "不涉及", tone: committed ? "bad" as const : "muted" as const },
      { label: "线上能不能用", value: place === "vercel" ? "能" : place === "env" ? "只在你这台机器上" : "能，但等于公开发布", tone: place === "vercel" ? "good" as const : "muted" as const },
    ],
    lines: exposed
      ? [{ text: `打包产物里能搜到这串密钥。压缩混淆改变的是可读性，不是可见性。`, tone: "bad" as const }]
      : committed
        ? [{ text: "密钥没进浏览器，但会随下一次提交进入 Git 历史——即使以后删掉，它仍留在历史里。", tone: "bad" as const }]
        : [{ text: "密钥只存在于服务端。浏览器只知道你的接口地址。", tone: "good" as const }],
    verdict: {
      text: !exposed && !committed
        ? "对了。密钥只在服务端，并且不会进版本库。"
        : "把密钥放到服务端，并确认它被 .gitignore 忽略。",
      passed: !exposed && !committed,
    },
  };
}

export function LessonSevenArticle() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 07 · 连接模型 API</p>
        <h1>密钥放错地方，<br />等于公开发布。</h1>
        <p className="chapter-dek">密钥不是配置项，它是账单和权限。放错一层，损失是真金白银。</p>
        <div className="chapter-meta"><span>预计 8 分钟</span><span>安全课</span><span>承接第 06 课</span></div>
      </header>

      <Prose label="只看一句话的话">
        <h2>模型调用必须发生在服务端。</h2>
        <p>浏览器只发问题、收答案，永远不碰密钥。浏览器里的代码是公开的——打开开发者工具就能看到全部 JavaScript，包括你以为「压缩过看不懂」的字符串。</p>
        <p className="term-hint">带虚线的词都可以悬停、聚焦或点击查看解释。</p>
      </Prose>

      <Prose label="正确的分层">
        <h2>密钥只存在于中间那一层。</h2>
        <AsciiFigure caption="浏览器只知道你的接口地址。这一层在第 08 课会变成 /api/agent。">{`浏览器           你的服务端                模型服务商
  │                  │                        │
  │── 问题 ────────▶ │                        │
  │                  │── 问题 + API Key ────▶ │
  │                  │◀──────── 回答 ──────── │
  │◀──── 回答 ────── │                        │`}</AsciiFigure>
        <Callout tone="warn" title="NEXT_PUBLIC_ 是「故意公开」的意思">
          以它开头的环境变量会被打包进浏览器代码。把密钥放在这里，和写成前端常量没有区别。
        </Callout>
      </Prose>

      <Prose className="lab-intro" label="自己放一次">
        <h2>四个位置，两个能用。</h2>
        <p>选一个位置，看右边「访问者能不能读到」怎么变。`.env` 那一档还要看 <code>.gitignore</code> 有没有真的挡住。</p>
      </Prose>

      <ScenarioLab
        kicker="INTERACTIVE 07"
        title="密钥该放在哪一层"
        storageKey="agent-lab-lesson-7"
        controls={[
          { kind: "segmented", id: "place", label: "密钥放在", options: PLACES, initial: "const" },
          { kind: "switch", id: "gitignored", label: ".env 被 .gitignore 忽略", note: "git check-ignore 有输出", initial: false },
        ]}
        compute={compute}
        rowsLabel="后果"
        note="判断 .gitignore 有没有生效，不要靠肉眼看文件，直接问 Git：git check-ignore -v lab/langgraph/.env——有输出才算数。"
        code={{
          summary: "展开统一的模型入口",
          text: `def get_model(**kwargs):
    if not os.getenv("ANTHROPIC_API_KEY"):
        raise SystemExit(
            "没有 ANTHROPIC_API_KEY。\\n"
            "  1) cp .env.example .env\\n"
            "  2) 填进去 key\\n"
            "  3) 重跑"
        )
    from langchain_anthropic import ChatAnthropic
    return ChatAnthropic(model="claude-sonnet-5", temperature=0, **kwargs)`,
        }}
      />

      <Prose className="after-lab" label="缺少密钥时">
        <h2>报错要像句人话。</h2>
        <p>在没有配置密钥的机器上运行，本仓库的实跑输出是四行提示，而不是一段几十行的调用栈。</p>
        <p>这不是代码风格问题。初学者放弃的时刻，往往就是看到一段读不懂的报错的时刻。检查配置、给出下一步——两行代码，省掉一次放弃。</p>
        <p>模型参数里现在只需要管一个：<code>temperature=0</code>。教学需要可复现，同一个输入尽量得到同一个结果，你才能判断「这次不一样」是不是自己改坏了。</p>
      </Prose>

      <Prose label="本课挑战">
        <h2>三个检查项，缺一不可。</h2>
        <Checklist
          title="第一次填完密钥之后按顺序确认"
          items={[
            <span key="1"><code>git check-ignore -v &lt;你的 .env 路径&gt;</code> 有输出</span>,
            <span key="2">前端代码里搜不到 <code>sk-</code>、<code>API_KEY</code> 这类字符串</span>,
            <span key="3">部署平台的环境变量里，这个键名<strong>没有</strong> <code>NEXT_PUBLIC_</code> 前缀</span>,
          ]}
        />
        <p>三条都过，才算完成这一课。只跑通一次调用不算。</p>
      </Prose>

      <Prose label="三个常见误区">
        <h2>「本地跑跑而已」是最贵的一句话。</h2>
        <Misconceptions
          items={[
            { claim: "本地跑跑而已，不用管密钥", verdict: "距离只有一次 push", body: <p>密钥一旦进过某次提交，即使后来删掉，它仍留在历史里。正确做法是从一开始就不让它进去。</p> },
            { claim: "压缩混淆之后前端就看不见了", verdict: "看得见", body: <p>压缩改变的是可读性，不是可见性。浏览器必须拿到能执行的代码，字符串就一定在里面，搜索一下就能找到。</p> },
            { claim: "先用我自己的密钥上线，以后再改", verdict: "账单先到", body: <p>在没有第 10 课的调用限额之前，一个公开可访问的接口配上你的密钥，等于把额度开放给互联网。</p> },
          ]}
        />
      </Prose>

      <Prose className="after-lab" label="本课带走">
        <h2>三句话。</h2>
        <Takeaways title="第七课带走" items={["调用只在服务端发生", ".gitignore 要用 git check-ignore 验证", "缺配置时给人话，不要甩堆栈"]} />
      </Prose>

      <section className="chapter-bridge">
        <span>NEXT</span><i />
        <span>密钥安顿好了，中间那一层还是空的。下一课把 /api/agent 建起来。</span>
      </section>
    </article>
  );
}
