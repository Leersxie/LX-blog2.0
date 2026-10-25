import type { Element, Root, RootContent } from "hast";
import rehypeExternalLinks from "rehype-external-links";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";

import type { TocHeading } from "../types";
import { rehypeBaseLinks } from "./rehype-base-links";
import { rehypeCodeFrame } from "./rehype-code-frame";
import { rehypeTableWrap } from "./rehype-table-wrap";

function demoteH1() {
	return (tree: Root) => {
		visit(tree, "element", (node) => {
			if (node.tagName === "h1") node.tagName = "h2";
		});
	};
}

function textOf(node: RootContent | Element): string {
	if ("value" in node && typeof node.value === "string") return node.value;
	if ("children" in node && Array.isArray(node.children)) {
		return node.children.map((child) => textOf(child as RootContent)).join("");
	}
	return "";
}

function decodeEntities(value: string): string {
	return value
		.replaceAll("&amp;", "&")
		.replaceAll("&lt;", "<")
		.replaceAll("&gt;", ">")
		.replaceAll("&quot;", '"')
		.replaceAll("&#x27;", "'")
		.replaceAll("&#39;", "'");
}

export interface RenderedMarkdown {
	html: string;
	headings: TocHeading[];
}

export function renderMarkdown(source: string): RenderedMarkdown {
	const headings: TocHeading[] = [];
	const processor = unified()
		.use(remarkParse)
		.use(remarkGfm)
		.use(remarkRehype)
		.use(demoteH1)
		.use(rehypeSlug)
		.use(rehypeExternalLinks, {
			target: "_blank",
			rel: ["nofollow", "noopener", "noreferrer"],
		})
		.use(rehypeBaseLinks)
		.use(rehypeHighlight, { detect: false, ignoreMissing: true })
		.use(rehypeCodeFrame)
		.use(rehypeTableWrap)
		.use(() => (tree: Root) => {
			visit(tree, "element", (node) => {
				if (node.tagName !== "h2" && node.tagName !== "h3") return;
				const id =
					typeof node.properties?.id === "string"
						? node.properties.id
						: "";
				if (!id) return;
				headings.push({
					id,
					text: decodeEntities(textOf(node)).trim(),
					level: node.tagName === "h2" ? 2 : 3,
				});
			});
		})
		.use(rehypeStringify);

	const html = String(processor.processSync(source));
	return { html, headings };
}

export function plainText(markdown: string): string {
	return markdown
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/~~~[\s\S]*?~~~/g, " ")
		.replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
		.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
		.replace(/<[^>]+>/g, " ")
		.replace(/[#>*_`~|]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

export function countWords(markdown: string): {
	words: number;
	minutes: number;
} {
	const text = plainText(markdown);
	const cjk = (text.match(/[\u3400-\u9fff\uf900-\ufaff]/g) ?? []).length;
	const latin = text
		.replace(/[\u3400-\u9fff\uf900-\ufaff]/g, " ")
		.split(/\s+/)
		.filter(Boolean).length;
	const words = cjk + latin;
	return { words, minutes: Math.max(1, Math.ceil(words / 350)) };
}

export function excerptFrom(markdown: string, length = 140): string {
	const text = plainText(markdown);
	return text.length > length ? `${text.slice(0, length)}…` : text;
}
