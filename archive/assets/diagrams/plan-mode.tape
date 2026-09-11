# 终端 B 卷：给 Agent 一个可自跑的检查
# 用法: vhs assets/diagrams/plan-mode.tape   （需本地安装 https://github.com/charmbracelet/vhs）
Output assets/diagrams/plan-mode.gif
Set FontSize 22
Set Width 1200
Set Height 700
Set Theme "Catppuccin Mocha"
Set TypingSpeed 45ms
Set Padding 24

Type "claude"
Enter
Sleep 2s

Type "写 validateEmail 函数。用例：a@b.com 通过，invalid 不通过，a@.com 不通过。实现完把测试跑一遍。"
Enter
Sleep 10s
