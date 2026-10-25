import { site } from "../config/site";
import { absoluteUrl, withBase } from "../lib/url";
import { getFeedPosts, getPageData, getRoutes } from "./content";

function escapeXml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;");
}

function cdata(value: string): string {
	return value.replaceAll("]]>", "]]]]><![CDATA[>");
}

function pubDate(value: string): string {
	return new Date(`${value}T00:00:00Z`).toUTCString();
}

export function buildRss(): string {
	const posts = getFeedPosts();
	const items = posts
		.map(
			(post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(absoluteUrl(post.url))}</link>
      <guid isPermaLink="true">${escapeXml(absoluteUrl(post.url))}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${pubDate(post.published)}</pubDate>
      <content:encoded><![CDATA[${cdata(post.html)}]]></content:encoded>
    </item>`,
		)
		.join("\n");
	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(site.title)}</title>
    <link>${escapeXml(site.url)}</link>
    <description>${escapeXml(site.description)}</description>
    <language>${site.locale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}

export function buildAtom(): string {
	const posts = getFeedPosts();
	const entries = posts
		.map(
			(post) => `  <entry>
    <title>${escapeXml(post.title)}</title>
    <link href="${escapeXml(absoluteUrl(post.url))}" rel="alternate" type="text/html"/>
    <id>${escapeXml(absoluteUrl(post.url))}</id>
    <published>${post.published}T00:00:00Z</published>
    <updated>${post.published}T00:00:00Z</updated>
    <summary>${escapeXml(post.description)}</summary>
    <content type="html"><![CDATA[${cdata(post.html)}]]></content>
    <author><name>${escapeXml(site.author.name)}</name></author>
  </entry>`,
		)
		.join("\n");
	return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(site.title)}</title>
  <subtitle>${escapeXml(site.description)}</subtitle>
  <link href="${escapeXml(site.url)}" rel="alternate" type="text/html"/>
  <link href="${escapeXml(absoluteUrl("/atom.xml"))}" rel="self" type="application/atom+xml"/>
  <id>${escapeXml(site.url)}</id>
  <updated>${new Date().toISOString()}</updated>
  <language>${site.locale}</language>
${entries}
</feed>
`;
}

export interface SitemapEntry {
	path: string;
	lastmod?: string;
}

export function getSitemapEntries(): SitemapEntry[] {
	const entries: SitemapEntry[] = [];
	for (const route of getRoutes()) {
		if (route.path === "/404.html" || route.isCopy) continue;
		const data = getPageData(route.path);
		if (!data || data.noindex) continue;
		entries.push({
			path: route.path,
			lastmod: data.post?.updated ?? data.post?.published,
		});
	}
	return entries;
}

export function buildSitemap(): string {
	const entries = getSitemapEntries()
		.map(
			(entry) => `  <url>
    <loc>${escapeXml(absoluteUrl(entry.path))}</loc>${
			entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ""
		}
  </url>`,
		)
		.join("\n");
	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

export function buildSitemapIndex(): string {
	return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${escapeXml(absoluteUrl("/sitemap-0.xml"))}</loc>
  </sitemap>
</sitemapindex>
`;
}

export function buildRobots(): string {
	return `User-agent: *
Allow: /
Disallow: ${withBase("/api/")}
Disallow: ${withBase("/pagefind/")}

Sitemap: ${absoluteUrl("/sitemap.xml")}
`;
}
