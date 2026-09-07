.PHONY: help docs diagrams frames clip clean

help:
	@echo "make docs      抓取/更新 references/ 官方文档镜像"
	@echo "make diagrams  渲染 assets/diagrams/*.mmd -> .svg"
	@echo "make frames    渲染竖屏切片帧 (1080x1920)"
	@echo "make clip      frames + 合成 60s 竖屏视频 (需 ffmpeg)"

docs:
	bash scripts/fetch-docs.sh

diagrams:
	bash scripts/render-diagrams.sh

frames:
	bash scripts/render-frames.sh clip-01 6

# 每帧的停留秒数与 posts/01-agent-loop/video/clip-01.md 的分镜表一致
clip: frames
	bash scripts/build-clip.sh clip-01

clean:
	rm -rf assets/diagrams/clip-01 build/
