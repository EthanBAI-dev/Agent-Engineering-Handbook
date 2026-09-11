.PHONY: help docs diagrams web clean

help:
	@echo "make docs      抓取/更新 references/ 官方文档镜像"
	@echo "make diagrams  渲染 assets/**/*.mmd -> .svg"
	@echo "make web       本地启动教学网站 (apps/web)"

docs:
	bash scripts/fetch-docs.sh

diagrams:
	bash scripts/render-diagrams.sh

web:
	cd apps/web && pnpm install && pnpm dev

clean:
	rm -rf build/
