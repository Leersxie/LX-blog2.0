import { useEffect, useState } from "react";

import type { TocHeading } from "../../types";

interface TocProps {
	headings: TocHeading[];
}

function useActiveHeading(headings: TocHeading[]): string {
	const [active, setActive] = useState("");
	useEffect(() => {
		if (headings.length === 0) return;
		let frame = 0;
		const update = () => {
			frame = 0;
			const offset = 140;
			let current = headings[0]?.id ?? "";
			for (const heading of headings) {
				const element = document.getElementById(heading.id);
				if (!element) continue;
				if (element.getBoundingClientRect().top <= offset) {
					current = heading.id;
				} else {
					break;
				}
			}
			setActive(current);
		};
		const onScroll = () => {
			if (frame) return;
			frame = window.requestAnimationFrame(update);
		};
		update();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
			if (frame) window.cancelAnimationFrame(frame);
		};
	}, [headings]);
	return active;
}

function TocList({ headings, active }: { headings: TocHeading[]; active: string }) {
	return (
		<ol className="toc-list">
			{headings.map((heading, index) => (
				<li
					key={`${heading.id}-${index}`}
					className={heading.level === 3 ? "toc-item is-sub" : "toc-item"}
				>
					<a
						href={`#${heading.id}`}
						className={active === heading.id ? "is-active" : undefined}
						aria-current={active === heading.id ? "location" : undefined}
					>
						<span className="toc-index mono-label">
							{String(index + 1).padStart(2, "0")}
						</span>
						<span>{heading.text}</span>
					</a>
				</li>
			))}
		</ol>
	);
}

export function ArticleToc({ headings }: TocProps) {
	const active = useActiveHeading(headings);
	if (headings.length === 0) return null;
	return (
		<aside className="article-toc" aria-label="文章目录">
			<p className="mono-label">ON THIS PAGE</p>
			<TocList headings={headings} active={active} />
		</aside>
	);
}

export function MobileToc({ headings }: TocProps) {
	const active = useActiveHeading(headings);
	if (headings.length === 0) return null;
	return (
		<details className="mobile-toc">
			<summary>
				<span className="mono-label">ON THIS PAGE</span>
				<span>目录 / {headings.length}</span>
			</summary>
			<TocList headings={headings} active={active} />
		</details>
	);
}
