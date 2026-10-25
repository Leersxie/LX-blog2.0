import { site } from "../config/site";
import type { PageData, SeoData } from "../types";

export function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

export function serializePageData(value: unknown): string {
	return JSON.stringify(value)
		.replaceAll("<", "\\u003c")
		.replaceAll("\u2028", "\\u2028")
		.replaceAll("\u2029", "\\u2029");
}

export function buildHeadTags(seo: SeoData): string {
	const lines = [
		`<title>${escapeHtml(seo.title)}</title>`,
		`<meta name="description" content="${escapeHtml(seo.description)}" />`,
		`<link rel="canonical" href="${escapeHtml(seo.canonical)}" />`,
		seo.noindex
			? `<meta name="robots" content="noindex, nofollow" />`
			: `<meta name="robots" content="index, follow, max-image-preview:large" />`,
		`<meta property="og:site_name" content="${escapeHtml(site.title)}" />`,
		`<meta property="og:type" content="${seo.ogType}" />`,
		`<meta property="og:title" content="${escapeHtml(seo.title)}" />`,
		`<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
		`<meta property="og:url" content="${escapeHtml(seo.canonical)}" />`,
		`<meta property="og:image" content="${escapeHtml(seo.ogImage)}" />`,
		`<meta property="og:image:width" content="1200" />`,
		`<meta property="og:image:height" content="630" />`,
		`<meta property="og:locale" content="${site.locale}" />`,
		`<meta name="twitter:card" content="summary_large_image" />`,
		`<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`,
		`<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`,
		`<meta name="twitter:image" content="${escapeHtml(seo.ogImage)}" />`,
		`<meta name="theme-color" content="#0b0c11" />`,
		`<link rel="icon" href="/favicon.svg" type="image/svg+xml" />`,
		`<link rel="alternate" type="application/rss+xml" title="${escapeHtml(site.title)} · RSS" href="/rss.xml" />`,
		`<link rel="alternate" type="application/atom+xml" title="${escapeHtml(site.title)} · Atom" href="/atom.xml" />`,
	];
	if (seo.publishedAt) {
		lines.push(
			`<meta property="article:published_time" content="${seo.publishedAt}" />`,
		);
	}
	if (seo.updatedAt) {
		lines.push(
			`<meta property="article:modified_time" content="${seo.updatedAt}" />`,
		);
	}
	for (const item of seo.jsonLd) {
		lines.push(
			`<script type="application/ld+json">${serializePageData(item)}</script>`,
		);
	}
	return lines.join("\n");
}

interface DocumentInput {
	template: string;
	body: string;
	data: PageData;
	seo: SeoData;
}

/**
 * Takes Vite's built index.html (which contains the hashed client assets) and
 * replaces the title, root and data payload. No client runtime is required to
 * read the article, even though React hydrates the page afterwards.
 */
export function renderDocument({
	template,
	body,
	data,
	seo,
}: DocumentInput): string {
	let html = template;
	html = html.replace(/<title>[\s\S]*?<\/title>/, "");
	html = html.replace(
		"</head>",
		`${buildHeadTags(seo)}\n</head>`,
	);
	html = html.replace(
		'<div id="root"></div>',
		`<div id="root">${body}</div>\n<script>window.__NOCTILUX_DATA__ = ${serializePageData(data)};</script>`,
	);
	return html;
}
