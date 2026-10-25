import { describe, expect, it } from "vitest";

import { buildAtom, buildRobots, buildRss, buildSitemap, getSitemapEntries } from "../src/server/feeds";

describe("feeds and sitemap", () => {
	it("sitemap excludes copies, 404 and noindex pages", () => {
		const paths = getSitemapEntries().map((entry) => entry.path);
		expect(paths).toContain("/guestbook/");
		expect(paths).toContain("/posts/xiangtuzhongguo-analysis/");
		expect(paths).toContain("/rss/");
		expect(paths).toContain("/atom/");
		expect(paths).not.toContain("/posts/guestbook/");
		expect(paths).not.toContain("/404.html");
		expect(paths).toHaveLength(9);
	});

	it("sitemap uses absolute URLs and lastmod for posts", () => {
		const xml = buildSitemap();
		expect(xml).toContain("<loc>https://leersxie.github.io/guestbook/</loc>");
		expect(xml).toContain("<lastmod>2026-10-05</lastmod>");
		expect(xml).not.toContain("/posts/guestbook/");
	});

	it("RSS includes public non-encrypted posts only", () => {
		const rss = buildRss();
		expect(rss).toContain("<item>");
		expect(rss).toContain("留言板");
		expect(rss).not.toContain("乡土中国");
		expect(rss).not.toContain("差序格局");
	});

	it("Atom is XML and contains a self link", () => {
		const atom = buildAtom();
		expect(atom).toContain('<feed xmlns="http://www.w3.org/2005/Atom">');
		expect(atom).toContain("https://leersxie.github.io/atom.xml");
		expect(atom).toContain("留言板");
		expect(atom).not.toContain("差序格局");
	});

	it("robots points at the sitemap and keeps build assets out", () => {
		const robots = buildRobots();
		expect(robots).toContain("Sitemap: https://leersxie.github.io/sitemap.xml");
		expect(robots).toContain("Disallow: /pagefind/");
	});
});
