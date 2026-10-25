import { useEffect } from "react";

import { site } from "../../config/site";

declare global {
	interface Window {
		dataLayer?: unknown[];
	}
}

/**
 * GTM is loaded only after a real interaction, with an idle-ish fallback.
 * It is intentionally not part of the initial render path.
 */
export function GoogleTagManager() {
	useEffect(() => {
		const { enabled, id } = site.gtm;
		if (!enabled || !id) return;
		let loaded = false;

		const load = () => {
			if (loaded) return;
			loaded = true;
			window.dataLayer = window.dataLayer ?? [];
			window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
			const script = document.createElement("script");
			script.async = true;
			script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
			document.head.appendChild(script);
		};

		const events: Array<keyof WindowEventMap> = [
			"scroll",
			"pointerdown",
			"keydown",
			"touchstart",
		];
		const once = () => {
			load();
			for (const event of events) {
				window.removeEventListener(event, once);
			}
		};
		for (const event of events) {
			window.addEventListener(event, once, { once: true, passive: true });
		}
		const timer = window.setTimeout(load, 8000);
		return () => {
			window.clearTimeout(timer);
			for (const event of events) {
				window.removeEventListener(event, once);
			}
		};
	}, []);

	return site.gtm.enabled ? (
		<noscript>
			<iframe
				src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(site.gtm.id)}`}
				height="0"
				width="0"
				style={{ display: "none", visibility: "hidden" }}
				title="Google Tag Manager"
			/>
		</noscript>
	) : null;
}
