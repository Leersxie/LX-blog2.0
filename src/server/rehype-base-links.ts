import type { Root } from "hast";
import { visit } from "unist-util-visit";

import { BASE_PATH, withBase } from "../lib/url";

/**
 * Markdown authors use root-relative links/images (/about/, /assets/x.webp).
 * On a GitHub Pages project site those need the repository base prefix at build
 * time. External URLs, hashes and data URIs are left alone.
 */
export function rehypeBaseLinks() {
	return (tree: Root) => {
		visit(tree, "element", (node) => {
			for (const key of ["href", "src"] as const) {
				const value = node.properties?.[key];
				if (
					typeof value === "string" &&
					value.startsWith("/") &&
					!value.startsWith("//") &&
					!value.startsWith(BASE_PATH)
				) {
					node.properties[key] = withBase(value);
				}
			}
			const srcSet = node.properties?.srcSet;
			if (typeof srcSet === "string") {
				node.properties.srcSet = srcSet
					.split(",")
					.map((part) => {
						const [url, descriptor] = part.trim().split(/\s+/, 2);
						if (!url || !url.startsWith("/") || url.startsWith("//")) {
							return part.trim();
						}
						return [withBase(url), descriptor].filter(Boolean).join(" ");
					})
					.join(", ");
			}
		});
	};
}
