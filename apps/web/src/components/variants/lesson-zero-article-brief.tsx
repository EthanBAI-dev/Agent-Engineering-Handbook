// 备份：补充正文之前的精简版，仅用于 /lessons/<slug>/brief 对照阅读。
// 不要在这里继续开发；正式版本在 src/components/lesson-*-article.tsx。
import { LessonZeroLab } from "@/components/lesson-zero-lab";
import { Term } from "@/components/term";

export function LessonZeroArticleBrief() {
  return (
    <article className="chapter lesson-article">
      <header className="chapter-header">
        <p className="chapter-number">LESSON 00 · 前言与环境</p>
        <h1>先知道 LangGraph 是什么，<br />再把第一张图跑起来。</h1>
        <p className="chapter-dek">你可以先在网页里理解，不装环境；也可以跟着步骤打开终端，运行同一份 Python 实验。</p>
        <div className="chapter-meta"><span>预计 12 分钟</span><span>无需 API</span><span>两条学习路径</span></div>
      </header>

      <section className="prose-block">
        <p className="section-label">先回答最基本的问题</p>
        <h2>LangGraph 到底是什么？</h2>
        <p>普通聊天往往是“问一句，答一句”。真正做事的 <Term definition="围绕目标选择步骤、调用工具，并根据结果继续行动。">Agent（智能体）</Term> 可能要先理解目标，再调用工具、检查结果；遇到危险动作时，还应该停下来等人批准。</p>
        <p><Term definition="组织多步骤 Agent 的执行顺序，保存运行现场，并支持分支、循环、暂停和恢复。">LangGraph（智能体流程编排框架）</Term> 就是组织这类多步骤流程的底层框架。它不是大模型，也不赠送模型额度；它更像一位流程导演。</p>
        <p className="term-hint">带虚线的词可以悬停、聚焦或点击，查看简短解释。</p>
      </section>

      <section className="concept-explainer four-up" aria-label="LangGraph 四个基础角色">
        <article><span>01 · GOAL</span><h2>目标</h2><p>用户到底想完成什么，而不只是想听一句回答。</p></article>
        <article><span>02 · NODE</span><h2>做一步</h2><p>每个节点只承担一种明确动作，结果更容易检查。</p></article>
        <article><span>03 · STATE</span><h2>带着现场</h2><p>消息和数据跟着流程走，后一步能看见前一步。</p></article>
        <article><span>04 · EDGE</span><h2>选下一站</h2><p>固定前进、条件分支、循环或结束，都由路线决定。</p></article>
      </section>

      <section className="prose-block lab-intro">
        <p className="section-label">先别安装任何东西</p>
        <h2>让流程在你眼前走一遍。</h2>
        <p>下面不是装饰图。每点一次，只有一个角色接过任务。走完后，再选“只用网页”或“本地运行”。</p>
      </section>

      <LessonZeroLab />

      <section className="prose-block after-lab">
        <p className="section-label">本地路径的四个关键词</p>
        <h2>终端只是用文字操作电脑的窗口。</h2>
        <p>Windows 学习者可以打开 <Term definition="Windows 自带的命令行工具，用来进入目录、检查软件和运行课程脚本。">PowerShell（Windows 命令行工具）</Term>。先用 <Term definition="安装和管理 Python 环境与项目依赖。">uv（Python 环境与依赖管理器）</Term> 准备环境，再运行课程脚本。</p>
        <p>第 00、01 课不调用模型，因此不需要 <Term definition="证明程序有权调用某项在线服务，并把用量记到相应账户。真实密钥只能保存在服务端或本地环境变量中。">API Key（接口密钥）</Term>。等课程接入真实模型时再配置，永远不要把真实密钥粘贴到网页前端或公开仓库。</p>
        <div className="chapter-summary"><strong>第 00 课带走</strong><span>LangGraph 负责流程</span><span>网页可以先学</span><span>本地实验随后跟上</span></div>
      </section>
    </article>
  );
}
