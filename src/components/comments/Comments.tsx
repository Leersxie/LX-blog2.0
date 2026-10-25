import { useEffect, useRef } from "react";

import { site } from "../../config/site";

function currentTheme(): "light" | "dark" {
	return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function sendTheme(theme: "light" | "dark"): void {
	const iframe = document.querySelector<HTMLIFrameElement>("iframe.giscus-frame");
	iframe?.contentWindow?.postMessage(
		{ giscus: { setConfig: { theme } } },
		"https://giscus.app",
	);
}

export function Comments() {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		let loaded = false;
		let observer: IntersectionObserver | null = null;

		const load = () => {
			if (loaded) return;
			loaded = true;
			container.innerHTML = "";
			const script = document.createElement("script");
			script.src = "https://giscus.app/client.js";
			script.async = true;
			script.crossOrigin = "anonymous";
			script.setAttribute("data-repo", site.giscus.repo);
			script.setAttribute("data-repo-id", site.giscus.repoId);
			script.setAttribute("data-category", site.giscus.category);
			script.setAttribute("data-category-id", site.giscus.categoryId);
			script.setAttribute("data-mapping", site.giscus.mapping);
			script.setAttribute("data-strict", "0");
			script.setAttribute(
				"data-reactions-enabled",
				site.giscus.reactionsEnabled,
			);
			script.setAttribute("data-emit-metadata", site.giscus.emitMetadata);
			script.setAttribute("data-input-position", site.giscus.inputPosition);
			script.setAttribute("data-theme", currentTheme());
			script.setAttribute("data-lang", site.giscus.lang);
			script.setAttribute("data-loading", "lazy");
			container.appendChild(script);
		};

		if ("IntersectionObserver" in window) {
			observer = new IntersectionObserver(
				(entries) => {
					if (entries.some((entry) => entry.isIntersecting)) {
						load();
						observer?.disconnect();
					}
				},
				{ rootMargin: "300px" },
			);
			observer.observe(container);
		} else {
			load();
		}

		const onTheme = (event: Event) => {
			const theme = (event as CustomEvent<string>).detail;
			if (theme === "light" || theme === "dark") sendTheme(theme);
		};
		window.addEventListener("noctilux:theme", onTheme);
		return () => {
			observer?.disconnect();
			window.removeEventListener("noctilux:theme", onTheme);
		};
	}, []);

	return (
		<section className="comments" aria-labelledby="comments-title" data-pagefind-ignore>
			<div className="section-kicker">
				<span className="mono-label">DISCUSSION</span>
				<span className="rule" />
			</div>
			<h2 id="comments-title">评论</h2>
			<p className="comments__note">
				评论由 Giscus 驱动，数据存放在 GitHub Discussions。需要 GitHub 账号。
			</p>
			<div className="comments__frame" ref={containerRef}>
				<p className="comments__placeholder">滚动到这里时加载评论区。</p>
			</div>
			<p className="comments__link">
				<a
					href={`https://github.com/${site.giscus.repo}/discussions`}
					target="_blank"
					rel="noopener noreferrer"
				>
					直接在 GitHub Discussions 中查看
				</a>
			</p>
		</section>
	);
}
