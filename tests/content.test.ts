import { describe, expect, it } from "vitest";

import { loadContent, getPageData, getRoutes, getFeedPosts } from "../src/server/content";

describe("content model", () => {
	it("publishes only the two non-draft posts", () => {
		const model = loadContent();
		expect(model.published.map((post) => post.id).sort()).toEqual([
			"guestbook",
			"xiangtuzhongguo-analysis",
		]);
	});

	it("keeps drafts in the repository but out of routes", () => {
		const model = loadContent();
		const ids = model.allPosts.map((post) => post.id);
		expect(ids).toContain("cs2");
		expect(ids).toContain("first-blog");
		const paths = getRoutes().map((route) => route.path);
		expect(paths).not.toContain("/posts/cs2/");
		expect(paths).not.toContain("/posts/first-blog/");
	});

	it("preserves the custom permalink and the legacy copy", () => {
		const paths = getRoutes().map((route) => route.path);
		expect(paths).toContain("/guestbook/");
		expect(paths).toContain("/posts/guestbook/");
		const canonical = getPageData("/guestbook/");
		const copy = getPageData("/posts/guestbook/");
		expect(canonical?.post?.url).toBe("/guestbook/");
		expect(copy?.post?.url).toBe("/posts/guestbook/");
		expect(copy?.noindex).toBe(true);
		expect(copy?.post?.comment).toBe(false);
	});

	it("never ships encrypted plaintext or headings", () => {
		const page = getPageData("/posts/xiangtuzhongguo-analysis/");
		expect(page?.post?.encrypted).toBe(true);
		expect(page?.post?.html).toBeUndefined();
		expect(page?.post?.headings).toEqual([]);
		expect(page?.post?.ciphertext?.alg).toBe("AES-256-GCM");
		expect(JSON.stringify(page)).not.toContain("差序格局");
		expect(JSON.stringify(page)).not.toContain("费孝通");
	});

	it("keeps encrypted posts out of feeds", () => {
		const feed = getFeedPosts();
		expect(feed).toHaveLength(1);
		expect(feed[0]?.title).toBe("留言板");
	});

	it("loads about, friends and projects without dead data", () => {
		expect(getPageData("/about/")?.pageHtml).toContain("Leersxie");
		expect(getPageData("/about/")?.projects).toHaveLength(7);
		expect(getPageData("/friends/")?.friends).toHaveLength(8);
		expect(getPageData("/projects/")?.projects).toHaveLength(7);
	});

	it("returns null for unknown routes and data for the 404 page", () => {
		expect(getPageData("/missing/")).toBeNull();
		expect(getPageData("/404.html")?.kind).toBe("not-found");
	});

	it("builds a page count from the route table", () => {
		expect(getPageData("/")?.build.pageCount).toBe(getRoutes().length);
	});
});
