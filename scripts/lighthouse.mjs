import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const EDGE =
	process.env.EDGE_PATH ||
	"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = (process.env.BASE_URL || "http://127.0.0.1:4321").replace(/\/$/, "");
const require = createRequire(import.meta.url);
const LIGHTHOUSE_CLI = path.join(
	path.dirname(require.resolve("lighthouse/package.json")),
	"cli",
	"index.js",
);
const OUT_DIR = path.join(process.cwd(), "docs", "lighthouse");
const PROFILE_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "noctilux-lh-"));
fs.mkdirSync(OUT_DIR, { recursive: true });

const routes = [
	["home", "/"],
	["article", "/guestbook/"],
	["archive", "/archive/"],
];

const summary = [];
for (const [name, route] of routes) {
	const out = path.join(OUT_DIR, `${name}.json`);
	const result = spawnSync(
		process.execPath,
		[
			LIGHTHOUSE_CLI,
			`${BASE}${route}`,
			"--quiet",
			"--output=json",
			`--output-path=${out}`,
			"--only-categories=performance,accessibility,best-practices,seo",
			"--port=9222",
			"--chrome-flags=--headless=new --no-sandbox --disable-gpu --no-first-run --no-default-browser-check --user-data-dir=" + PROFILE_DIR,
		],
		{
			stdio: "inherit",
			env: { ...process.env, CHROME_PATH: EDGE },
			timeout: 120000,
		},
	);
	if (result.status !== 0) {
		throw new Error(`Lighthouse failed for ${route} with status ${result.status}`);
	}
	const report = JSON.parse(fs.readFileSync(out, "utf8"));
	const scores = Object.fromEntries(
		Object.entries(report.categories).map(([key, category]) => [
			key,
			Math.round((category.score ?? 0) * 100),
		]),
	);
	const metrics = {
		FCP: report.audits["first-contentful-paint"]?.displayValue,
		LCP: report.audits["largest-contentful-paint"]?.displayValue,
		TBT: report.audits["total-blocking-time"]?.displayValue,
		CLS: report.audits["cumulative-layout-shift"]?.displayValue,
		SI: report.audits["speed-index"]?.displayValue,
	};
	summary.push({ name, route, scores, metrics });
	console.log(`Lighthouse ${route}: ${JSON.stringify(scores)} ${JSON.stringify(metrics)}`);
}

fs.writeFileSync(
	path.join(process.cwd(), "docs", "lighthouse-summary.json"),
	`${JSON.stringify(summary, null, 2)}\n`,
);

const lines = [
	"# Lighthouse summary",
	"",
	`Generated: ${new Date().toISOString()}`,
	"",
	"| Page | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |",
	"|---|---:|---:|---:|---:|---|---|---|",
	...summary.map(
		(item) =>
			`| ${item.route} | ${item.scores.performance} | ${item.scores.accessibility} | ${item.scores["best-practices"]} | ${item.scores.seo} | ${item.metrics.LCP ?? "—"} | ${item.metrics.TBT ?? "—"} | ${item.metrics.CLS ?? "—"} |`,
	),
	"",
	"Raw JSON reports are in `docs/lighthouse/`.",
	"",
].join("\n");
fs.writeFileSync(path.join(process.cwd(), "docs", "lighthouse-report.md"), lines);
console.log("\nWrote docs/lighthouse-report.md and docs/lighthouse-summary.json");
