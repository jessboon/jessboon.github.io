.PHONY: install build serve clean

install:
	pnpm install

build:
	pnpm exec eleventy

serve:
	pnpm exec eleventy --serve

clean:
	rm -rf _site
