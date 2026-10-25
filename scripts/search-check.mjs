import fs from "node:fs";

import { chromium } from "playwright-core";

const browser = await chromium.launch({
	executablePath:
		process.env.EDGE_PATH ||
		"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
	headless: true,
	args: ["--no-sandbox", "--disable-gpu"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto("http://127.0.0.1:4321/", { waitUntil: "networkidle" });
await page.keyboard.press("/");
await page.locator(".search-dialog").waitFor({ state: "visible" });
const queries = ["留言", "乡土", "Koishi", "化学", "费孝通", "完全不存在的词"];
const results = [];
for (const query of queries) {
	const input = page.locator(".search-dialog input");
	await input.fill(query);
	// Debounce is 160ms; the first query also has to load the Pagefind WASM.
	await page.waitForTimeout(300);
	await page
		.waitForFunction(
			() => !document.querySelector(".search-dialog .spin"),
			undefined,
			{ timeout: 10_000 },
		)
		.catch(() => {});
	await page.waitForTimeout(100);
	const count = await page.locator(".search-result").count();
	const items = await page.locator(".search-result").evaluateAll((nodes) =>
		nodes.slice(0, 5).map((node) => ({
			title:
				node.querySelector("strong")?.textContent?.trim() ?? "",
			url: node.getAttribute("href"),
		})),
	);
	results.push({ query, count, items });
}
await browser.close();
fs.writeFileSync(
	"docs/search-baseline.json",
	`${JSON.stringify(results, null, 2)}\n`,
);
console.log(JSON.stringify(results, null, 2));
if (
	results.find((item) => item.query === "费孝通")?.count !== 0 ||
	results.find((item) => item.query === "留言")?.count === 0 ||
	results.find((item) => item.query === "乡土")?.count === 0 ||
	results.find((item) => item.query === "Koishi")?.count === 0 ||
	results.find((item) => item.query === "化学")?.count === 0
) {
	process.exitCode = 1;
}
