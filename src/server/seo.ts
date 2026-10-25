import { site } from "../config/site";
import { absoluteUrl } from "../lib/url";
import type { PageData, SeoData } from "../types";

function defaultOgImage(): string {
	return absoluteUrl("/og-default.png");
}

export function getSeo(data: PageData): SeoData {
	const isHome = data.kind === "home";
	const isPost = data.kind === "post";
	const title = isHome
		? site.title
		: `${data.title} · ${site.name}`;
	const canonicalPath =
		data.kind === "post" && data.post
			? data.post.canonicalPath
			: data.route === "/404.html"
				? "/404.html"
				: data.route;
	const canonical = absoluteUrl(canonicalPath);
	const postImage = data.post?.cover ?? data.post?.ogImage;
	const ogImage = isPost && postImage
		? /^https?:\/\//.test(postImage)
			? postImage
			: absoluteUrl(postImage)
		: defaultOgImage();

	const jsonLd: Record<string, unknown>[] = [];
	if (isHome) {
		jsonLd.push({
			"@context": "https://schema.org",
			"@type": "WebSite",
			name: site.title,
			url: absoluteUrl("/"),
			description: site.description,
			inLanguage: site.lang,
			author: {
				"@type": "Person",
				name: site.author.name,
				url: absoluteUrl("/about/"),
				sameAs: site.socials.map((social) => social.href),
			},
		});
		jsonLd.push({
			"@context": "https://schema.org",
			"@type": "Person",
			name: site.author.name,
			description: site.author.bio,
			url: absoluteUrl("/about/"),
			sameAs: site.socials.map((social) => social.href),
		});
	}
	if (isPost && data.post) {
		const post = data.post;
		jsonLd.push({
			"@context": "https://schema.org",
			"@type": "BlogPosting",
			headline: post.title,
			description: post.description,
			image: ogImage,
			datePublished: post.published,
			dateModified: post.updated ?? post.published,
			inLanguage: site.lang,
			keywords: post.tags,
			author: {
				"@type": "Person",
				name: site.author.name,
				url: absoluteUrl("/about/"),
			},
			publisher: {
				"@type": "Person",
				name: site.author.name,
			},
			mainEntityOfPage: {
				"@type": "WebPage",
				"@id": canonical,
			},
			isAccessibleForFree: !post.encrypted,
			url: canonical,
		});
		if (!post.isCopy) {
			jsonLd.push({
				"@context": "https://schema.org",
				"@type": "BreadcrumbList",
				itemListElement: [
					{
						"@type": "ListItem",
						position: 1,
						name: "首页",
						item: absoluteUrl("/"),
					},
					{
						"@type": "ListItem",
						position: 2,
						name: "归档",
						item: absoluteUrl("/archive/"),
					},
					{
						"@type": "ListItem",
						position: 3,
						name: post.title,
						item: canonical,
					},
				],
			});
		}
	}

	return {
		title,
		description: data.description || site.description,
		canonical,
		ogImage,
		ogType: isPost ? "article" : "website",
		noindex: data.noindex,
		publishedAt: data.post?.published,
		updatedAt: data.post?.updated,
		jsonLd,
	};
}
