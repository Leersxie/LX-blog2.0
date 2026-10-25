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

	it("counts Chinese characters and Latin words", () => {
		const stats = countWords("中文五个字 hello world");
		expect(stats.words).toBeGreaterThanOrEqual(7);
		expect(stats.minutes).toBe(1);
		expect(plainText("**粗体** 和 [链接](https://example.com)")).toContain("链接");
		expect(excerptFrom("一二三四五", 2)).toBe("一二…");
	});
});
