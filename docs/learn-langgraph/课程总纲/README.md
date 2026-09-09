# 第 0 课 · 你的电脑上什么都没有，从这里开始

写给完全没写过代码的人。Windows 为主，Mac 在最后单说。

## 只看一句话的话

**装两个软件：Python 和 VS Code。代码写在 VS Code 里，跑在 VS Code 下面那个黑框里。**

就这两个，别的都不用装。

## 你现在卡在哪

你看到了一段代码。你不知道该把它贴到哪儿。

你打开了电脑，发现没有一个叫「Python」的窗口可以点。

**这不是你笨。是所有教程都默认你已经装好了。**

## 打个比方

写代码这件事，跟做菜一样，要两样东西。

**Python 是灶台**——真正把菜做熟的是它，但它自己没有台面，你看不见它。

**VS Code 是厨房**——切菜的台面、放调料的架子、打火的开关，都在这儿。

你在厨房里干活，灶台在背后默默烧火。**所以两个都要装，缺一个都做不成饭。**

---

# 第一步 · 装 Python（10 分钟）

## 下载

打开 <https://www.python.org/downloads/>

点那个大黄色按钮，写着 `Download Python 3.x.x`。

下载下来是一个 `.exe` 文件，双击它。

## 装的时候有一个坑，只有一个

安装窗口的**最下面**，有一个小方框：

```
☐  Add python.exe to PATH
```

**必须勾上它。** 勾上再点 `Install Now`。

不勾会怎样？黑框里打 `python` 会说「不是内部或外部命令」，然后你会卡住两个小时。

> 已经装完了才发现没勾？不用慌。重新运行一遍那个 `.exe`，
> 选 `Modify`，一路下一步，把 `Add Python to environment variables` 勾上就行。

## 版本要求

**3.11、3.12、3.13 都行。** 官网现在给你的默认版本就在这个范围里，直接下就好。

3.10 及以下不行，装不上后面要用的东西。

---

# 第二步 · 装 VS Code（5 分钟）

## 下载

打开 <https://code.visualstudio.com/>

点 `Download for Windows`，下载下来双击安装。

一路下一步。中间有几个勾选项，**建议全勾上**，尤其是这两个：

```
☑  将"通过 Code 打开"操作添加到 Windows 资源管理器文件上下文菜单
☑  添加到 PATH
```

勾上以后，你在任何文件夹上点右键，就能直接「用 VS Code 打开」。

## 装完先做一件事：装中文界面 + Python 插件

打开 VS Code。看**最左边那一竖条图标**，找到那个像四个方块的（最下面附近），点它。

那是「扩展」，英文叫 Extensions。快捷键是 `Ctrl + Shift + X`。

上面有个搜索框，搜两次，各装一个：

| 搜什么 | 装哪个 | 干什么 |
| --- | --- | --- |
| `Chinese` | Chinese (Simplified) Language Pack | 把界面变成中文 |
| `Python` | Python（作者是 Microsoft，下载量最多的那个） | 让 VS Code 认识 Python 代码 |

每个搜到之后，点蓝色的 `Install` 按钮。装完中文包它会让你重启，重启就好。

**这两个装完，你的厨房就搭好了。**

---

# 第三步 · 把课程代码拿到手（5 分钟）

## 简单办法：下载压缩包

不用装 Git，直接在浏览器打开这个链接，会自动开始下载：

<https://github.com/EthanBAI-dev/Agent-Engineering-Handbook/archive/refs/heads/claude/amazing-wozniak-rh6ryk.zip>

下载完解压。**解压到哪儿？建议放桌面，或者 `D:\code\` 这种简单路径。**

> **路径里千万别有中文和空格。**
> `D:\code\` 可以，`C:\Users\haku\我的文档\新建文件夹 (2)\` 会出各种莫名其妙的错。
> 这是新手最常踩的坑之一。

## 打开它

解压出来的文件夹，右键 → 「通过 Code 打开」。

如果没有这个右键菜单，就在 VS Code 里点左上角 `文件` → `打开文件夹`，选它。

打开后，左边会出现文件树。**顺着点进去：`docs` → `learn-langgraph` → `code`。**

你会看到两个文件：`l01_simple_graph.py` 和 `l02_state_memory.py`。

点一下 `l01_simple_graph.py`，代码就显示在右边了。**这就是你以后写代码的地方。**

---

# 第四步 · 找到那个「黑框」（3 分钟）

**这是你最需要知道的一件事。**

代码不是点一下就能跑的，你得有个地方打命令。那个地方叫「终端」。

在 VS Code 里打开它，两种方式：

- 快捷键：`Ctrl` + `` ` ``（数字 1 左边那个键，跟 `~` 同一个键）
- 或者点最上面菜单栏的 `终端` → `新建终端`

VS Code 下半部分会弹出一个框，里面有一行字，末尾是 `>` 或 `$`。

**这就是终端。以后所有命令都打在这里，打完按回车。**

## 先在这里验证 Python 装好了

在终端里打这一行，然后回车：

```
python --version
```

**看到 `Python 3.12.x` 之类的字样，就成了。**

看到「不是内部或外部命令」？回第一步，PATH 那个勾没打上。

---

# 第五步 · 搭一个专用工作区（5 分钟）

## 先切到正确的文件夹

在终端里打：

```
cd docs\learn-langgraph
```

`cd` 的意思是「进入某个文件夹」。打完回车，你会看到终端那行字变长了，末尾多了 `learn-langgraph`。

**这说明你现在「站」在这个文件夹里了。**

## 建一个虚拟环境

打这两行，一行一行来：

```
python -m venv .venv
```

等几秒，没反应就是成功了。然后：

```
.venv\Scripts\activate
```

**成功的标志：终端那行字的最前面，多了一个 `(.venv)`。**

像这样：

```
(.venv) PS D:\code\Agent-Engineering-Handbook\docs\learn-langgraph>
```

### 这一步在干什么

虚拟环境就是**给这个项目单独开一个抽屉**。

装的东西都放这个抽屉里，不跟别的项目混。以后学别的，再开一个新抽屉。

不这么做也能跑，但几个项目一混就会打架，到时候更难查。

### Windows 上可能报的一个错

如果 `activate` 那行报红字，说什么「禁止运行脚本」，在终端里打这一行：

```
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
```

回车，然后重新打一遍 `.venv\Scripts\activate`。

---

# 第六步 · 装 LangGraph（3 分钟）

**确认前面有 `(.venv)` 再打这一行：**

```
pip install -U langgraph
```

会哗啦啦滚很多字，等它停下来。看到 `Successfully installed ...` 就好了。

## 验证

```
python -c "from langgraph.graph import StateGraph; print('ok')"
```

**打印出 `ok`，环境就全部搞定了。**

---

# 第七步 · 跑你的第一个程序（2 分钟）

在终端里打：

```
python code\l01_simple_graph.py
```

先滚出一段花花绿绿的东西（那是图的描述，先不用管），最后你会看到这几行：

```
--- node_hello ---
--- node_happy ---
{'text': '我想开心一点 你好，今天很开心！'}
--- node_hello ---
--- node_sad ---
{'text': '随便说点什么 你好，今天有点累。'}
```

**看到这个，你就跑通了第一个 AI Agent 的骨架。**

## 另一种跑法：点按钮

不想打命令的话，打开 `l01_simple_graph.py` 这个文件，
**右上角有一个三角形的播放按钮**，点它，效果一样。

第一次点的时候，VS Code 可能会在最上面弹出一个条，让你选 Python 解释器。
**选带 `.venv` 字样的那一个。** 选错了会说找不到 langgraph。

---

# 这个程序到底跑了什么

三句话。

**它画了一张流程图，图上有三个格子。**

**第一个格子给文字加了「你好」，然后有个岔路口。**

**岔路口看文字里有没有「开心」两个字，有就往左走，没有就往右走。**

跑了两次，一次往左一次往右，所以你看到两组不同的输出。

**LangGraph 全部的事情就是这个：你画格子和岔路，它负责按图跑。**
以后格子里放的不是「加两个字」，而是「问一次大模型」，这就成 Agent 了。

---

# 报错速查表

存下这张表，90% 的问题在这儿。

| 屏幕上说 | 真实原因 | 怎么办 |
| --- | --- | --- |
| `python 不是内部或外部命令` | 装 Python 时没勾 PATH | 重跑安装包选 Modify，补勾 |
| `ModuleNotFoundError: langgraph` | 忘了激活虚拟环境 | 看前面有没有 `(.venv)`，没有就 `.venv\Scripts\activate` |
| `禁止运行脚本` / `execution of scripts is disabled` | Windows 默认拦截 | `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process` |
| `系统找不到指定的路径` | `cd` 到错的地方了 | 打 `dir` 看当前有什么文件，对不上就 `cd ..` 退回去 |
| 点播放按钮说找不到 langgraph | VS Code 选错解释器了 | `Ctrl+Shift+P` → 搜 `Python: 选择解释器` → 选带 `.venv` 的 |
| 一堆看不懂的红字 | 路径里有中文或空格 | 把整个文件夹挪到 `D:\code\` 这种纯英文路径 |

---

# 每次学习开始前，固定做三个动作

**记住这三步，比记任何代码都重要。**

1. 打开 VS Code，`文件` → `打开最近的文件夹`，选这个项目
2. `Ctrl` + `` ` `` 打开终端
3. 打 `.venv\Scripts\activate`，确认看到 `(.venv)`

**看到 `(.venv)` 才能开始。** 十次报错有六次是忘了这一步。

---

# 特殊情况

## 我用的是 Mac

三处不一样，其余完全相同：

| 事情 | Windows | Mac |
| --- | --- | --- |
| 建环境 | `python -m venv .venv` | `python3 -m venv .venv` |
| 激活 | `.venv\Scripts\activate` | `source .venv/bin/activate` |
| 路径斜杠 | `code\l01_simple_graph.py` | `code/l01_simple_graph.py` |

Mac 自带的 Python 版本通常太老，建议去 python.org 下新的，或者用 Homebrew 装。

## 公司电脑，装不了软件

用浏览器版的，一行软件都不用装：

- **GitHub Codespaces**——在这个仓库页面点 `Code` → `Codespaces` → 新建。
  它给你一个云端的 VS Code，环境全都有。免费额度够学。
- **Google Colab**——适合跑后面官方课程的 notebook，但不适合跑 `.py` 文件。

## 以后还要装别的吗

后面学到官方课程时，会用到一种叫 **Jupyter Notebook** 的东西（文件后缀是 `.ipynb`）。

**它不用单独装。** VS Code 装了 Python 插件之后，直接就能打开和运行。

到那一步再说，现在不用管。

---

# 什么时候这套不管用

**如果你的目标只是「体验一下 AI Agent」，那这一整套是浪费时间。** 直接去用现成的产品。

**这套流程是给「想自己写、想改、想上线」的人准备的。** 你要付出的代价是这两个小时的安装配置，换来的是以后所有代码都能在自己电脑上跑。

值不值，你自己判断。

---

# 存下这张表就行

| 我要干什么 | 打什么 |
| --- | --- |
| 打开终端 | `Ctrl` + `` ` `` |
| 进入文件夹 | `cd 文件夹名` |
| 退回上一层 | `cd ..` |
| 看当前有什么文件 | `dir`（Mac 用 `ls`） |
| 激活环境 | `.venv\Scripts\activate` |
| 装东西 | `pip install 名字` |
| 跑程序 | `python 文件名.py` |

---

# 第二阶段环境（学到官方课程时再回来看）

**现在不用做。** 等你把 `lesson-01.md` 学完、准备进官方课程时，再回到这一节。

到那时你需要第二套环境，跟前面这套并存、互不影响。

## 拿到官方课程仓库

```
git clone https://github.com/langchain-ai/langchain-academy.git
cd langchain-academy
```

没装 Git 的话，去仓库页面点 `Code` → `Download ZIP`，一样的。

## 单独开一个抽屉

Windows：

```
python -m venv lc-academy-env
lc-academy-env\Scripts\activate
pip install -r requirements.txt
```

Mac：

```
python3 -m venv lc-academy-env
source lc-academy-env/bin/activate
pip install -r requirements.txt
```

**为什么不复用前面那个 `.venv`？** 因为官方仓库锁定了一批版本，混在一起容易打架。
一个项目一个抽屉，这是规矩。

## 钥匙（Key）：从这里开始才要花钱

前面所有内容都不花钱。**从这一步起，你需要一个能调大模型的钥匙。**

本课程默认用 **DeepSeek**：国内可直连、便宜、支持工具调用，
后面讲的每一个能力它都能跑。

| 钥匙 | 干什么 | 必需吗 | 去哪申请 |
| --- | --- | --- | --- |
| `DEEPSEEK_API_KEY` | 调大模型，课程的发动机 | **必需** | platform.deepseek.com |
| `TAVILY_API_KEY` | 让程序能联网搜索 | 学到多角色协作那几讲才用 | tavily.com |
| `LANGSMITH_API_KEY` | 看清每一步到底调了什么，调试全靠它 | 建议，有免费额度 | smith.langchain.com |

### 装客户端

```
pip install -U langchain-deepseek
```

### 把钥匙告诉程序

**不要把钥匙写进任何代码文件。** 写进去就可能被你自己传到网上。

Windows（当前这个终端窗口有效）：

```
$env:DEEPSEEK_API_KEY = "你的钥匙"
```

Mac：

```
export DEEPSEEK_API_KEY="你的钥匙"
```

**关掉终端就失效，下次要重新设。** 想一劳永逸，就设成系统环境变量。

验证：

```
python -c "import os; print('有钥匙' if os.environ.get('DEEPSEEK_API_KEY') else '没读到')"
```

### 想换成别的模型

代码里只有一行跟模型有关，换 OpenAI 就是把那一行换掉：

```python
from langchain_deepseek import ChatDeepSeek        # DeepSeek
model = ChatDeepSeek(model="deepseek-chat")

from langchain_openai import ChatOpenAI            # 换成 OpenAI 就这两行
model = ChatOpenAI(model="gpt-4o")
```

**其余代码一个字都不用改。** 后面每一讲都保持这个性质。

> **钥匙等于钱。** 别贴进代码、别提交到 GitHub、别发在聊天框里。

## 把图画出来看

官方课程带一个可视化工具，能在浏览器里看图、点着跑、中途改状态。

```
cd module-1/studio
langgraph dev
```

跑起来后打开浏览器访问 `http://127.0.0.1:2024`。

**这是理解「图」最快的方式**，比读代码直观得多。强烈建议用起来。

---

# 最后再说一遍

**Python 是灶台，VS Code 是厨房，终端是你说话的地方。**

跑通了 `l01_simple_graph.py`，第 0 课就结束了。

**下一步去 [`lesson-01.md`](lesson-01.md)，从 Step 3 开始看**（Step 0 到 Step 2 你刚才已经做完了）。
那一课讲这段代码为什么这么写，并且让你动手改它。
