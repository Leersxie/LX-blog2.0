import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

function languageOf(code: Element | undefined): string {
	const className = code?.properties?.className;
	if (!Array.isArray(className)) return "CODE";
	for (const value of className) {
		if (typeof value !== "string") continue;
		const match = value.match(/^(?:language-|lang-)(.+)$/);
		if (match?.[1]) return match[1].toUpperCase();
	}
	return "CODE";
}

/**
 * Wrap highlighted <pre> blocks in a frame with a language label and a copy
 * button. The button is inert without JavaScript and is hidden by CSS until
 * the early `js` class is added.
 */
export function rehypeCodeFrame() {
	return (tree: Root) => {
		visit(tree, "element", (node: Element, index, parent) => {
			if (node.tagName !== "pre" || !parent || index === undefined) return;
			const code = node.children.find(
				(child): child is Element =>
					child.type === "element" && child.tagName === "code",
			);
			const language = languageOf(code);
			const frame: Element = {
				type: "element",
				tagName: "div",
				properties: {
					className: ["code-frame"],
					"data-pagefind-ignore": "",
				},
				children: [
					{
						type: "element",
						tagName: "div",
						properties: { className: ["code-frame__bar"] },
						children: [
							{
								type: "element",
								tagName: "span",
								properties: { className: ["code-frame__lang"] },
								children: [{ type: "text", value: language }],
							},
							{
								type: "element",
								tagName: "button",
								properties: {
									type: "button",
									className: ["code-copy"],
									"data-code-copy": "",
									"aria-label": "复制代码",
								},
								children: [{ type: "text", value: "复制" }],
							},
						],
					},
					node,
				],
			};
			parent.children[index] = frame;
			return "skip";
		});
	};
}
