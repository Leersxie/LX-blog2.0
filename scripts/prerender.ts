import fs from "node:fs";
import path from "node:path";

import { renderPage } from "../src/entry-server";
import {
	getPageData,
	getRoutes,
} from "../src/server/content";
import { renderDocument } from "../src/server/document";
import {
	buildAtom,
	buildRobots,
	buildRss,
	buildSitemap,
	buildSitemapIndex,
} from "../src/server/feeds";
import { getSeo } from "../src/server/seo";

const DIST = path.join(process.cwd(), "dist");
const TEMPLATE = path.join(DIST, "index.html");

if (!fs.existsSync(TEMPLATE)) {
	throw new Error(
		"[prerender] dist/index.html not found. Run `vite build` first.",
	);
}

const template = fs.readFileSync(TEMPLATE, "utf8");
const routes = getRoutes();
let written = 0;

for (const route of routes) {
	const data = getPageData(route.path);
	if (!data) {
		throw new Error(`[prerender] no page data for ${route.path}`);
	}
	const seo = getSeo(data);
	const body = renderPage(data);
	const html = renderDocument({ template, body, data, seo });
	const output = path.join(DIST, route.output);
	fs.mkdirSync(path.dirname(output), { recursive: true });
	fs.writeFileSync(output, html);
	written += 1;
	console.log(
		`[prerender] ${route.path.padEnd(48)} -> dist/${route.output.replaceAll("\\", "/")} (${Buffer.byteLength(html)} bytes)`,
	);
}

const sitemap = buildSitemap();
fs.writeFileSync(path.join(DIST, "rss.xml"), buildRss());
fs.writeFileSync(path.join(DIST, "atom.xml"), buildAtom());
fs.writeFileSync(path.join(DIST, "sitemap.xml"), sitemap);
// Preserve the old Astro sitemap entry points for already-submitted crawlers.
fs.writeFileSync(path.join(DIST, "sitemap-0.xml"), sitemap);
fs.writeFileSync(path.join(DIST, "sitemap-index.xml"), buildSitemapIndex());
fs.writeFileSync(path.join(DIST, "robots.txt"), buildRobots());
fs.writeFileSync(path.join(DIST, ".nojekyll"), "");

const postMeta = getRoutes()
	.filter((route) => route.kind === "post" && !route.isCopy)
	.map((route) => getPageData(route.path)?.post)
	.filter((post) => post !== undefined)
	.map((post) => ({
		id: post.id,
		title: post.title,
		description: post.description,
		published: `${post.published}T00:00:00.000Z`,
		category: post.category,
		tags: post.tags,
		url: post.url,
		password: post.encrypted,
	}));
const calendar = postMeta.map((post) => ({
	id: post.id,
	title: post.title,
	date: post.published.slice(0, 10),
}));
const apiDir = path.join(DIST, "api");
fs.mkdirSync(apiDir, { recursive: true });
fs.writeFileSync(
	path.join(apiDir, "allPostMeta.json"),
	JSON.stringify(postMeta, null, 2),
);
fs.writeFileSync(
	path.join(apiDir, "calendar-data.json"),
	JSON.stringify(calendar, null, 2),
);
written += 8;

console.log(`[prerender] wrote ${written} files and 1 .nojekyll marker`);
