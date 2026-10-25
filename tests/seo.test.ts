import { describe, expect, it } from "vitest";

import { getPageData } from "../src/server/content";
import { getSeo } from "../src/server/seo";

describe("SEO document data", () => {
	it("gives every indexable page a unique canonical URL", () => {
		const paths = ["/", "/archive/", "/projects/", "/about/", "/friends/", "/guestbook/"];
		const seo = paths.map((path) => getSeo(getPageData(path)!));
		expect(new Set(seo.map((item) => item.canonical)).size).toBe(paths.length);
		expect(seo.every((item) => item.canonical.startsWith("https://leersxie.github.io/LX-blog2.0/"))).toBe(true);
		expect(seo.every((item) => item.noindex === false)).toBe(true);
	});

	it("marks the legacy copy as noindex and canonicalises it", () => {
		const page = getPageData("/posts/guestbook/")!;
		const seo = getSeo(page);
		expect(seo.noindex).toBe(true);
		expect(seo.canonical).toBe("https://leersxie.github.io/LX-blog2.0/guestbook/");
	});

	it("emits valid BlogPosting and BreadcrumbList data for articles", () => {
		const seo = getSeo(getPageData("/guestbook/")!);
		expect(seo.ogType).toBe("article");
		expect(seo.jsonLd.some((item) => item["@type"] === "BlogPosting")).toBe(true);
		expect(seo.jsonLd.some((item) => item["@type"] === "BreadcrumbList")).toBe(true);
	});

	it("adds WebSite and Person structured data on home", () => {
		const seo = getSeo(getPageData("/")!);
		const types = seo.jsonLd.map((item) => item["@type"]);
		expect(types).toContain("WebSite");
		expect(types).toContain("Person");
	});

	it("uses a per-post social image when available", () => {
		const seo = getSeo(getPageData("/guestbook/")!);
		expect(seo.ogImage).toBe(
			"https://leersxie.github.io/LX-blog2.0/og/guestbook.png",
		);
	});

	it("sets a default social image at 1200x630", () => {
		const seo = getSeo(getPageData("/")!);
		expect(seo.ogImage).toBe("https://leersxie.github.io/LX-blog2.0/og-default.png");
	});
});
