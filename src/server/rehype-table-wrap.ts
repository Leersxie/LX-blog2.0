import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

/**
 * Give wide GFM tables their own focusable horizontal scroll region, so mobile
 * pages never get a body-level horizontal scrollbar.
 */
export function rehypeTableWrap() {
	return (tree: Root) => {
		visit(tree, "element", (node: Element, index, parent) => {
			if (node.tagName !== "table" || !parent || index === undefined) return;
			if (
				parent.type === "element" &&
				parent.tagName === "div" &&
				Array.isArray(parent.properties?.className) &&
				parent.properties.className.includes("table-scroll")
			) {
				return;
			}
			const wrapper: Element = {
				type: "element",
				tagName: "div",
				properties: {
					className: ["table-scroll"],
					tabIndex: 0,
					role: "region",
					"aria-label": "表格，可横向滚动",
				},
				children: [node],
			};
			parent.children[index] = wrapper;
			return "skip";
		});
	};
}
