import type { TocHeading } from "../types";

export function headingsFromHtml(html: string): TocHeading[] {
	if (typeof DOMParser === "undefined") return [];
	const document = new DOMParser().parseFromString(html, "text/html");
	return Array.from(document.querySelectorAll<HTMLElement>("h2[id], h3[id]")).map(
		(element) => ({
			id: element.id,
			text: element.textContent?.trim() ?? "",
			level: element.tagName === "H2" ? 2 : 3,
		}),
	);
}
