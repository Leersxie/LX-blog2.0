import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

import { chromium } from "playwright-core";

const require = createRequire(import.meta.url);
const EDGE =
	process.env.EDGE_PATH ||
	"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = (process.env.BASE_URL || "http://127.0.0.1:4321").replace(/\/$/, "");
const OUT = path.join(process.cwd(), "docs", "a11y-report.json");
const routes = [
	["/", "home", 1440, 1000],
	["/guestbook/", "article", 1440, 1000],
	["/archive/", "archive", 1440, 1000],
	["/projects/", "projects", 1440, 1000],
	["/about/", "about", 1440, 1000],
	["/friends/", "friends", 1440, 1000],
	["/posts/xiangtuzhongguo-analysis/", "encrypted", 1440, 1000],
	["/", "home-mobile", 390, 844],
	["/guestbook/", "article-mobile", 390, 844],
];

const browser = await chromium.launch({
	executablePath: EDGE,
	headless: true,
	args: ["--no-sandbox", "--disable-gpu"],
});

const report = [];
for (const [route, name, width, height] of routes) {
	const context = await browser.newContext({ viewport: { width, height } });
	const page = await context.newPage();
	await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
	await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
	const result = await page.evaluate(async () => {
		return await window.axe.run(document, {
			runOnly: {
				type: "tag",
				values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
			},
		});
	});
	const violations = result.violations.map((violation) => ({
		id: violation.id,
		impact: violation.impact,
		help: violation.help,
		nodes: violation.nodes.map((node) => ({
			target: node.target,
			html: node.html,
			failureSummary: node.failureSummary,
		})),
	}));
	report.push({ route, name, viewport: `${width}x${height}`, violations });
	const serious = violations.filter(
		(item) => item.impact === "serious" || item.impact === "critical",
	);
	console.log(
		`${serious.length === 0 ? "PASS" : "FAIL"} ${route} axe violations: ${violations.length} total, ${serious.length} serious/critical`,
	);
	for (const violation of violations) {
		console.log(`  ${violation.impact} ${violation.id}: ${violation.nodes.length} node(s)`);
	}
	await context.close();
}

await browser.close();
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
const seriousTotal = report.reduce(
	(total, page) =>
		total +
		page.violations.filter(
			(item) => item.impact === "serious" || item.impact === "critical",
		).length,
	0,
);
console.log(`\nAxe report: ${OUT}`);
if (seriousTotal > 0) process.exitCode = 1;
