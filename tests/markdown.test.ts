import { describe, expect, it } from "vitest";

import { countWords, excerptFrom, plainText, renderMarkdown } from "../src/server/markdown";

describe("markdown rendering", () => {
	it("demotes body h1 so the page keeps a single h1", () => {
		const { html, headings } = renderMarkdown("# 正文标题\n\n## 小节\n\n### 细节");
		expect(html).not.toContain("<h1");
		expect(html).toContain("<h2");
		expect(headings.map((heading) => heading.level)).toEqual([2, 2, 3]);
	});

	it("adds heading ids and extracts them in order", () => {
		const { headings } = renderMarkdown("## 第一段\n\n### 子段\n\n## 第二段");
		expect(headings).toHaveLength(3);
		expect(headings[0]?.text).toBe("第一段");
		expect(headings[2]?.text).toBe("第二段");
		expect(headings.every((heading) => heading.id.length > 0)).toBe(true);
	});

	it("hardens external links", () => {
		const { html } = renderMarkdown("[外部链接](https://example.com)");
		expect(html).toContain('target="_blank"');
		expect(html).toContain("noopener");
		expect(html).toContain("noreferrer");
	});

	it("prefixes internal markdown links and assets with the deployment base", () => {
		const { html } = renderMarkdown(
			"[关于](/about/)\n\n![图](/assets/example.webp)\n\n[外部](https://example.com)",
		);
		expect(html).toContain('href="/LX-blog2.0/about/"');
		expect(html).toContain('src="/LX-blog2.0/assets/example.webp"');
		expect(html).toContain('href="https://example.com"');
		expect(html).not.toContain('href="/LX-blog2.0/https');
	});

	it("wraps code fences with language and copy controls", () => {
		const { html } = renderMarkdown("```ts\nconst answer = 42;\n```");
		expect(html).toContain('class="code-frame"');
		expect(html).toContain('data-code-copy');
		expect(html).toContain(">TS<");
		expect(html).toContain("answer");
		expect(html).toContain("42");
	});

	it("wraps wide tables in a focusable scroll region", () => {
		const { html } = renderMarkdown("| A | B |\n| - | - |\n| 1 | 2 |");
		expect(html).toContain('class="table-scroll"');
		expect(html).toContain('role="region"');
		expect(html).toContain("<table>");
	});

	it("counts Chinese characters and Latin words", () => {
		const stats = countWords("中文五个字 hello world");
		expect(stats.words).toBeGreaterThanOrEqual(7);
		expect(stats.minutes).toBe(1);
		expect(plainText("**粗体** 和 [链接](https://example.com)")).toContain("链接");
		expect(excerptFrom("一二三四五", 2)).toBe("一二…");
	});
});
