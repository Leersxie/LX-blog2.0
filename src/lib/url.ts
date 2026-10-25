declare const __SITE_BASE__: string;

/**
 * GitHub Pages project sites live under /<repo>/. The base is injected by Vite
 * on the client and by SITE_BASE during the prerender pass.
 */
const rawBase =
	typeof __SITE_BASE__ !== "undefined"
		? __SITE_BASE__
		: process.env.SITE_BASE || "/";

export const BASE_PATH = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;

/** Change this only if the site moves to a custom domain or root user site. */
export const SITE_ORIGIN = "https://leersxie.github.io";

export function withBase(pathname: string): string {
	if (!pathname) return BASE_PATH;
	if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(pathname)) return pathname;
	if (pathname === BASE_PATH || pathname.startsWith(BASE_PATH)) return pathname;
	const baseWithoutSlash = BASE_PATH.replace(/\/$/, "");
	return `${baseWithoutSlash}/${pathname.replace(/^\/+/, "")}`;
}

export function absoluteUrl(pathname: string): string {
	return new URL(withBase(pathname), SITE_ORIGIN).href;
}
