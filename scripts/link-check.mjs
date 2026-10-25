import fs from "node:fs";
import path from "node:path";

const DIST = path.join(process.cwd(), "dist");
const rawBase = process.env.SITE_BASE || "/";
const base = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;
const htmlFiles = [];
function walk(dir) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) walk(full);
		else if (entry.name.endsWith(".html")) htmlFiles.push(full);
	}
}
walk(DIST);

const missing = new Map();
const checked = new Set();

function isExternal(value) {
	return (
		value.startsWith("http://") ||
		value.startsWith("https://") ||
		value.startsWith("//") ||
		value.startsWith("mailto:") ||
		value.startsWith("tel:") ||
		value.startsWith("data:") ||
		value.startsWith("#")
	);
}

function resolveInternal(value) {
	const withoutHash = value.split("#")[0] ?? "";
	const withoutQuery = withoutHash.split("?")[0] ?? "";
	if (!withoutQuery) return null;
	if (!withoutQuery.startsWith("/")) return null;
	if (base !== "/" && !withoutQuery.startsWith(base)) {
		return { target: "", url: withoutQuery };
	}
	const relative = base === "/" ? withoutQuery : `/${withoutQuery.slice(base.length)}`;
	const decoded = decodeURIComponent(relative);
	let target = path.join(DIST, decoded);
	if (relative.endsWith("/")) target = path.join(target, "index.html");
	if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
		target = path.join(target, "index.html");
	}
	return { target, url: withoutQuery };
}

for (const file of htmlFiles) {
	const html = fs.readFileSync(file, "utf8");
	const rel = path.relative(DIST, file).replaceAll("\\", "/");
	const values = [
		...[...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]),
		...[...html.matchAll(/srcset="([^"]+)"/g)].flatMap((match) =>
			(match[1] ?? "").split(",").map((part) => part.trim().split(/\s+/)[0]),
		),
	];
	for (const value of values) {
		if (!value || isExternal(value)) continue;
		const resolved = resolveInternal(value);
		if (!resolved) continue;
		checked.add(resolved.url);
		if (!fs.existsSync(resolved.target)) {
			const list = missing.get(resolved.url) ?? [];
			list.push(rel);
			missing.set(resolved.url, list);
		}
	}
	if ((html.match(/<h1[\s>]/g) ?? []).length !== 1) {
		console.warn(
			`[links] ${rel}: expected exactly one <h1>, found ${(html.match(/<h1[\s>]/g) ?? []).length}`,
		);
	}
}

const encryptedLeakFiles = htmlFiles.filter((file) => {
	const html = fs.readFileSync(file, "utf8");
	return ["差序格局", "费孝通", "礼治秩序"].some((needle) => html.includes(needle));
});
if (encryptedLeakFiles.length > 0) {
	console.error(
		`[links] encrypted plaintext leaked in: ${encryptedLeakFiles.map((file) => path.relative(DIST, file)).join(", ")}`,
	);
	process.exitCode = 1;
}

for (const [url, sources] of missing) {
	console.error(`[links] MISSING ${url} referenced by ${[...new Set(sources)].join(", ")}`);
}
console.log(
	`[links] checked ${checked.size} internal targets across ${htmlFiles.length} HTML files; missing ${missing.size}`,
);
if (missing.size > 0) process.exitCode = 1;
