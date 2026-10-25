import fs from "node:fs";
import path from "node:path";

import { chromium } from "playwright-core";

const EDGE = process.env.EDGE_PATH || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = (process.env.BASE_URL || "http://127.0.0.1:4321").replace(/\/$/, "");
const SHOTS = path.join(process.cwd(), "docs", "screenshots");

if (!process.env.POST_PASSWORD_XIANGTU) {
	const envFile = path.join(process.cwd(), ".env.local");
	if (fs.existsSync(envFile)) {
		for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
			const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
			if (match && !(match[1] in process.env)) process.env[match[1]] = match[2];
		}
	}
}

if (!fs.existsSync(EDGE)) {
	throw new Error(`Edge not found at ${EDGE}. Set EDGE_PATH.`);
}
fs.mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch({
	executablePath: EDGE,
	headless: true,
	args: ["--no-sandbox", "--disable-gpu"],
});

const failures = [];
const check = (condition, message) => {
	if (!condition) failures.push(message);
	console.log(`${condition ? "PASS" : "FAIL"} ${message}`);
};

async function newPage(viewport, javaScriptEnabled = true, options = {}) {
	const context = await browser.newContext({
		viewport,
		javaScriptEnabled,
		deviceScaleFactor: 1,
		permissions: ["clipboard-read", "clipboard-write"],
		...options,
	});
	const page = await context.newPage();
	page.on("pageerror", (error) => {
		failures.push(`pageerror: ${error.message}`);
	});
	return { context, page };
}

async function assertNoHorizontalOverflow(page, label) {
	const overflow = await page.evaluate(
		() => document.documentElement.scrollWidth - document.documentElement.clientWidth,
	);
	check(overflow <= 1, `${label} has no horizontal overflow (${overflow}px)`);
}

async function screenshot(page, name, fullPage = false) {
	await page.screenshot({
		path: path.join(SHOTS, name),
		fullPage,
		animations: "disabled",
	});
}

// Desktop home.
{
	const { context, page } = await newPage({ width: 1440, height: 1000 });
	const response = await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
	check(response?.status() === 200, "home returns 200");
	check((await page.locator("h1").count()) === 1, "home has one h1");
	await assertNoHorizontalOverflow(page, "desktop home");
	await screenshot(page, "home-desktop.png");
	await screenshot(page, "home-desktop-full.png", true);

	// Keyboard search.
	await page.keyboard.press("/");
	await page.locator(".search-dialog").waitFor({ state: "visible" });
	const input = page.locator(".search-dialog input");
	await input.fill("留言");
	await page.locator(".search-result").first().waitFor({ timeout: 5000 });
	const resultCount = await page.locator(".search-result").count();
	check(resultCount > 0, "Pagefind returns results for 留言");
	const resultMeta = await page.locator(".search-result__meta").first().innerText();
	check(resultMeta.includes("日常"), "search results include category/date metadata");
	await screenshot(page, "search-desktop.png");
	await page.keyboard.press("ArrowDown");
	const activeResult = await page.locator(".search-result.is-active").count();
	check(activeResult === 1, "search supports ArrowUp/ArrowDown active result");
	await page.keyboard.press("Escape");
	await page.locator(".search-dialog").waitFor({ state: "hidden" });
	await page.waitForTimeout(80);
	const focusReturned = await page.evaluate(() =>
		document.activeElement?.getAttribute("aria-label"),
	);
	check(focusReturned === "打开搜索", "search returns focus to its trigger");

	// Site-level reduced-motion preference.
	await page.getByRole("button", { name: "减少动效" }).click();
	check(
		(await page.evaluate(() => document.documentElement.dataset.motion)) === "reduce",
		"motion toggle sets a site-level reduced-motion preference",
	);
	await page.getByRole("button", { name: "恢复动效" }).click();
	check(
		(await page.evaluate(() => document.documentElement.dataset.motion)) === undefined,
		"motion toggle restores full motion",
	);

	// Enter in the search result navigates to the article.
	await page.keyboard.press("/");
	await page.locator(".search-dialog input").fill("留言");
	await page.locator(".search-result").first().waitFor({ timeout: 5000 });
	await page.keyboard.press("Enter");
	await page.waitForURL("**/guestbook/", { timeout: 10000 });
	check(true, "Enter opens the selected search result");
	await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

	// Music panel opens and fetches Meting.
	await page.getByRole("button", { name: /歌单/ }).click();
	await page.locator(".music-panel").waitFor({ state: "visible" });
	await page
		.locator(".music-track, .music-state.is-error")
		.first()
		.waitFor({ timeout: 15000 });
	const musicRows = await page.locator(".music-track").count();
	const musicError = await page.locator(".music-state.is-error").count();
	if (musicRows > 0) {
		check(true, `Meting playlist loaded (${musicRows} tracks)`);
	} else if (musicError > 0) {
		console.log(
			"INFO Meting is unreachable from this browser network; error state rendered correctly.",
		);
	} else {
		check(false, "music panel produced neither tracks nor an error state");
	}
	await screenshot(page, "music-desktop.png");
	await page.keyboard.press("Escape");

	// Light theme static route.
	await page.getByRole("button", { name: "切换明暗主题" }).click();
	check(
		(await page.evaluate(() => document.documentElement.dataset.theme)) === "light",
		"theme toggle switches to light",
	);
	await page.evaluate(() => window.scrollTo(0, 0));
	await page.waitForTimeout(150);
	await screenshot(page, "home-light-desktop.png");
	const gtmScripts = await page
		.locator('script[src*="googletagmanager.com/gtm.js"]')
		.count();
	check(gtmScripts === 1, "GTM script is injected after interaction");
	await context.close();
}

// Mobile home.
{
	const { context, page } = await newPage({ width: 390, height: 844 });
	await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
	await assertNoHorizontalOverflow(page, "mobile home");
	const labels = await page.locator(".header-actions button").evaluateAll((nodes) =>
		nodes.map((node) => node.getAttribute("aria-label")),
	);
	check(labels.length >= 2, `mobile header controls render: ${labels.join(" / ")}`);
	await screenshot(page, "home-mobile.png");
	await screenshot(page, "home-mobile-full.png", true);
	await page.getByRole("button", { name: "打开菜单" }).click();
	await page.locator("#mobile-menu").waitFor({ state: "visible" });
	const menuHeight = await page
		.locator("#mobile-menu")
		.evaluate((node) => node.getBoundingClientRect().height);
	check(menuHeight > 500, `mobile menu fills the viewport (${menuHeight}px)`);
	await screenshot(page, "menu-mobile.png");
	await page.keyboard.press("Escape");
	await page.goto(`${BASE}/posts/xiangtuzhongguo-analysis/`, {
		waitUntil: "networkidle",
	});
	await screenshot(page, "locked-mobile.png");
	await context.close();
}

// System-level reduced motion, independent of the site preference.
{
	const { context, page } = await newPage(
		{ width: 1440, height: 1000 },
		true,
		{ reducedMotion: "reduce" },
	);
	await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
	const transition = await page.evaluate(() => {
		const button = document.querySelector(".button");
		return button ? getComputedStyle(button).transitionDuration : "missing";
	});
	check(
		parseFloat(transition) < 0.01,
		`prefers-reduced-motion collapses transitions (${transition})`,
	);
	await context.close();
}

// Tablet home.
{
	const { context, page } = await newPage({ width: 768, height: 1024 });
	await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
	await assertNoHorizontalOverflow(page, "tablet home");
	await screenshot(page, "home-tablet.png");
	await context.close();
}

// 320px phone and 1920px wide screen.
for (const [width, height, label] of [
	[320, 720, "small phone"],
	[1920, 1080, "wide desktop"],
]) {
	const { context, page } = await newPage({ width, height });
	await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
	check((await page.locator("h1").count()) === 1, `${label} has one h1`);
	await assertNoHorizontalOverflow(page, label);
	await context.close();
}

// Article, archive, projects, about, friends, 404.
for (const [name, route, viewport] of [
	["guestbook-desktop.png", "/guestbook/", { width: 1440, height: 1000 }],
	["archive-desktop.png", "/archive/", { width: 1440, height: 1000 }],
	["projects-desktop.png", "/projects/", { width: 1440, height: 1000 }],
	["about-desktop.png", "/about/", { width: 1440, height: 1000 }],
	["friends-desktop.png", "/friends/", { width: 1440, height: 1000 }],
	["404-desktop.png", "/missing/", { width: 1440, height: 1000 }],
]) {
	const { context, page } = await newPage(viewport);
	const response = await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
	check(response?.status() === (name.startsWith("404") ? 404 : 200), `${route} status`);
	check((await page.locator("h1").count()) === 1, `${route} has one h1`);
	await assertNoHorizontalOverflow(page, route);
	await screenshot(page, name);
	await context.close();
}

// Project media lightbox.
{
	const { context, page } = await newPage({ width: 1440, height: 1000 });
	await page.goto(`${BASE}/projects/`, { waitUntil: "networkidle" });
	const media = page.locator(".project-card__media").first();
	check((await media.count()) === 1, "project media trigger exists");
	await media.click();
	await page.locator(".lightbox").waitFor({ state: "visible" });
	check(
		(await page.locator(".lightbox__stage img").count()) === 1,
		"project image opens an accessible lightbox",
	);
	await screenshot(page, "lightbox-desktop.png");
	await page.keyboard.press("Escape");
	await page.locator(".lightbox").waitFor({ state: "hidden" });
	await page.waitForTimeout(200);
	const lightboxFocus = await page.evaluate(() =>
		document.activeElement?.getAttribute("aria-label"),
	);
	check(
		lightboxFocus?.includes("截图") ?? false,
		"lightbox returns focus to its trigger",
	);
	await context.close();
}

// Code-copy interaction against a generated frame fixture. The build-time
// wrapper itself is covered by tests/markdown.test.ts.
{
	const { context, page } = await newPage({ width: 1440, height: 1000 });
	await page.goto(`${BASE}/about/`, { waitUntil: "networkidle" });
	await page.evaluate(() => {
		const host = document.querySelector("#main");
		if (!host) return;
		host.insertAdjacentHTML(
			"beforeend",
			'<div class="code-frame"><div class="code-frame__bar"><span class="code-frame__lang">TEST</span><button type="button" class="code-copy" data-code-copy>复制</button></div><pre><code>const fixture = "copied";</code></pre></div>',
		);
	});
	const copy = page.locator("[data-code-copy]").last();
	await copy.click();
	await page.waitForTimeout(80);
	check(
		(await copy.innerText()).includes("已复制"),
		"code copy gives visible feedback",
	);
	const copied = await page.evaluate(() => navigator.clipboard.readText());
	check(copied.includes('const fixture = "copied"'), "code copy writes to clipboard");
	await context.close();
}

// Encrypted article: plaintext absent from HTML, unlock works with server secret.
{
	const password = process.env.POST_PASSWORD_XIANGTU;
	const { context, page } = await newPage({ width: 1440, height: 1000 });
	const response = await page.goto(
		`${BASE}/posts/xiangtuzhongguo-analysis/`,
		{ waitUntil: "networkidle" },
	);
	check(response?.status() === 200, "encrypted article returns 200");
	const source = await response?.text();
	check(source ? !source.includes("差序格局") : false, "encrypted plaintext absent from HTML");
	await screenshot(page, "locked-desktop.png");
	if (password) {
		await page.locator('input[type="password"]').fill(password);
		await page.getByRole("button", { name: "解锁档案" }).click();
		await page.locator(".unlocked-body .noctilux-prose").waitFor({ timeout: 10000 });
		const unlockedText = await page.locator(".unlocked-body").innerText();
		check(unlockedText.includes("差序格局"), "encrypted article unlocks with build secret");
		await screenshot(page, "unlocked-desktop.png");
	} else {
		check(false, "POST_PASSWORD_XIANGTU not set; cannot test unlock");
	}
	await context.close();
}

// No-JS rendering.
{
	const { context, page } = await newPage({ width: 1440, height: 1000 }, false);
	await page.goto(`${BASE}/guestbook/`);
	check(
		(await page.getByRole("heading", { name: "留言板" }).count()) === 1,
		"static HTML is readable without JavaScript",
	);
	check(
		(await page.getByText("评论需要登录 GitHub 账号").count()) > 0,
		"article body is present without JavaScript",
	);
	await context.close();
}

// Giscus iframe availability is external and non-blocking; log only.
{
	const { context, page } = await newPage({ width: 1440, height: 1000 });
	await page.goto(`${BASE}/guestbook/`, { waitUntil: "networkidle" });
	await page.locator(".comments").scrollIntoViewIfNeeded();
	await page.waitForTimeout(2500);
	const giscus = await page.locator("iframe.giscus-frame").count();
	const giscusTerm = await page
		.locator('script[src*="giscus.app/client.js"]')
		.getAttribute("data-term");
	check(giscusTerm === "guestbook/", "Giscus keeps the legacy discussion term");
	console.log(`INFO giscus iframe count: ${giscus} (external dependency)`);
	await context.close();
}

await browser.close();

if (failures.length > 0) {
	console.error("\nE2E FAILURES:");
	for (const failure of failures) console.error(`- ${failure}`);
	process.exitCode = 1;
} else {
	console.log("\nE2E PASS");
}
