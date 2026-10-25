import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { z } from "zod";

import { site } from "../config/site";
import { friendsData } from "../data/friends";
import { projectsData } from "../data/projects";
import type {
	ArticleData,
	ArchiveData,
	BuildInfo,
	EncryptedPayload,
	PageData,
	PageKind,
	PostSummary,
	TocHeading,
} from "../types";
import { encryptHtml } from "./encrypt";
import { loadBuildEnv, requireEnv } from "./env";
import { countWords, excerptFrom, renderMarkdown } from "./markdown";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "content", "posts");
const PAGES_DIR = path.join(ROOT, "content", "pages");

const routeSegment = z
	.string()
	.trim()
	.regex(
		/^[\p{L}\p{N}_-]+(?:\/[\p{L}\p{N}_-]+)*$/u,
		"只允许字母、数字、下划线、连字符与单层路径分隔符",
	);

const dateValue = z
	.union([z.string(), z.date()])
	.transform((value) => {
		const date = value instanceof Date ? value : new Date(value);
		if (Number.isNaN(date.getTime())) {
			throw new Error(`日期无效: ${String(value)}`);
		}
		return date.toISOString().slice(0, 10);
	});

const postFrontmatter = z
	.object({
		title: z.string().trim().min(1),
		published: dateValue,
		updated: dateValue.optional(),
		description: z.string().trim().optional(),
		category: z.string().trim().default("未分类"),
		tags: z.array(z.string().trim().min(1)).default([]),
		draft: z.boolean().default(false),
		cover: z.string().trim().optional(),
		pinned: z.boolean().default(false),
		comment: z.boolean().default(true),
		lang: z.string().trim().default(site.lang),
		encrypted: z.boolean().default(false),
		passwordEnv: z.string().trim().optional(),
		passwordHint: z.string().trim().optional(),
		permalink: routeSegment.optional(),
		alias: routeSegment.optional(),
	})
	.strict()
	.superRefine((data, ctx) => {
		if (data.encrypted && !data.passwordEnv) {
			ctx.addIssue({
				code: "custom",
				path: ["passwordEnv"],
				message: "encrypted: true 时必须提供 passwordEnv，不能把密码写进仓库",
			});
		}
	});

type PostFrontmatter = z.infer<typeof postFrontmatter>;

interface LoadedPost {
	id: string;
	sourceFile: string;
	frontmatter: PostFrontmatter;
	body: string;
	canonicalPath: string;
	copyPath?: string;
	html?: string;
	ciphertext?: EncryptedPayload;
	headings: TocHeading[];
	summary: PostSummary;
}

interface PageBody {
	html: string;
	headings: TocHeading[];
}

interface ContentModel {
	allPosts: LoadedPost[];
	published: LoadedPost[];
	about: PageBody;
	friends: PageBody;
	routes: RouteSpec[];
	archive: ArchiveData;
}

export interface RouteSpec {
	path: string;
	output: string;
	kind: PageKind;
	postId?: string;
	isCopy?: boolean;
}

const BUILT_AT = new Date().toISOString();

function walkMarkdown(dir: string): string[] {
	if (!fs.existsSync(dir)) return [];
	const result: string[] = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) result.push(...walkMarkdown(full));
		else if (entry.isFile() && entry.name.endsWith(".md")) result.push(full);
	}
	return result;
}

function readMarkdownPage(name: string): PageBody {
	const file = path.join(PAGES_DIR, `${name}.md`);
	if (!fs.existsSync(file)) {
		throw new Error(`[content] Missing page: content/pages/${name}.md`);
	}
	const { content } = matter(fs.readFileSync(file, "utf8"));
	return renderMarkdown(content);
}

function assertCoverExists(cover: string | undefined, sourceFile: string): void {
	if (!cover || /^https?:\/\//.test(cover) || cover.startsWith("data:")) return;
	if (!cover.startsWith("/")) {
		throw new Error(
			`[content] ${sourceFile}: cover 必须使用 /public 绝对路径或远程 URL`,
		);
	}
	const target = path.join(ROOT, "public", cover.replace(/^\/+/, ""));
	if (!fs.existsSync(target)) {
		throw new Error(`[content] ${sourceFile}: cover 文件不存在: ${cover}`);
	}
}

function normalizePath(value: string | undefined): string | undefined {
	if (!value) return undefined;
	return value.replace(/^\/+|\/+$/g, "");
}

function summaryOf(post: LoadedPost): PostSummary {
	return { ...post.summary };
}

function loadPosts(): LoadedPost[] {
	loadBuildEnv(ROOT);
	const files = walkMarkdown(POSTS_DIR).sort();
	const result: LoadedPost[] = [];

	for (const file of files) {
		const relative = path.relative(POSTS_DIR, file).replaceAll("\\", "/");
		const id = relative.replace(/\.md$/i, "");
		const sourceFile = `content/posts/${relative}`;
		const raw = fs.readFileSync(file, "utf8");
		const parsed = matter(raw);
		const checked = postFrontmatter.safeParse(parsed.data);
		if (!checked.success) {
			throw new Error(
				`[content] ${sourceFile} frontmatter 校验失败:\n${z.prettifyError(checked.error)}`,
			);
		}
		const fm = checked.data;
		assertCoverExists(fm.cover, sourceFile);

		const rendered = renderMarkdown(parsed.content);
		const stats = countWords(parsed.content);
		const permalink = normalizePath(fm.permalink);
		const alias = normalizePath(fm.alias);
		const canonicalPath = permalink ? `/${permalink}/` : `/posts/${id}/`;
		let copyPath: string | undefined;
		if (permalink) copyPath = `/posts/${id}/`;
		else if (alias) copyPath = `/posts/${alias}/`;
		if (copyPath === canonicalPath) copyPath = undefined;

		let html: string | undefined = rendered.html;
		let ciphertext: EncryptedPayload | undefined;
		let headings = rendered.headings;
		if (fm.encrypted) {
			const password = requireEnv(fm.passwordEnv!);
			ciphertext = encryptHtml(rendered.html, password);
			html = undefined;
			headings = [];
		}

		const description = fm.description || excerptFrom(parsed.content);
		const summary: PostSummary = {
			id,
			title: fm.title,
			description,
			published: fm.published,
			updated: fm.updated,
			category: fm.category || "未分类",
			tags: fm.tags,
			pinned: fm.pinned,
			encrypted: fm.encrypted,
			wordCount: stats.words,
			readingMinutes: stats.minutes,
			cover: fm.cover,
			url: canonicalPath,
			canonicalPath,
			isCopy: false,
			comment: fm.comment,
			lang: fm.lang,
		};

		result.push({
			id,
			sourceFile,
			frontmatter: fm,
			body: parsed.content,
			canonicalPath,
			copyPath,
			html,
			ciphertext,
			headings,
			summary,
		});
	}

	return result;
}

function byDateDesc(a: LoadedPost, b: LoadedPost): number {
	return (
		b.frontmatter.published.localeCompare(a.frontmatter.published) ||
		a.frontmatter.title.localeCompare(b.frontmatter.title, "zh-CN")
	);
}

function assertUniqueRoutes(routes: RouteSpec[]): void {
	const seen = new Map<string, RouteSpec>();
	for (const route of routes) {
		const existing = seen.get(route.path);
		if (existing) {
			throw new Error(
				`[content] 路由冲突: ${route.path} (${existing.postId ?? existing.kind} / ${route.postId ?? route.kind})`,
			);
		}
		seen.set(route.path, route);
	}
}

function buildRoutes(published: LoadedPost[]): RouteSpec[] {
	const routes: RouteSpec[] = [
		{ path: "/", output: "index.html", kind: "home" },
		{ path: "/archive/", output: "archive/index.html", kind: "archive" },
		{ path: "/projects/", output: "projects/index.html", kind: "projects" },
		{ path: "/about/", output: "about/index.html", kind: "about" },
		{ path: "/friends/", output: "friends/index.html", kind: "friends" },
		{ path: "/rss/", output: "rss/index.html", kind: "feed" },
		{ path: "/atom/", output: "atom/index.html", kind: "feed" },
	];
	for (const post of published) {
		routes.push({
			path: post.canonicalPath,
			output: `${post.canonicalPath.replace(/^\/|\/$/g, "")}/index.html`,
			kind: "post",
			postId: post.id,
		});
	}
	for (const post of published) {
		if (!post.copyPath) continue;
		routes.push({
			path: post.copyPath,
			output: `${post.copyPath.replace(/^\/|\/$/g, "")}/index.html`,
			kind: "post",
			postId: post.id,
			isCopy: true,
		});
	}
	routes.push({ path: "/404.html", output: "404.html", kind: "not-found" });
	assertUniqueRoutes(routes);
	return routes;
}

let cachedSignature = "";
let cachedModel: ContentModel | null = null;

function contentSignature(): string {
	const parts: string[] = [String(BUILT_AT)];
	for (const file of [...walkMarkdown(POSTS_DIR), ...walkMarkdown(PAGES_DIR)]) {
		const stat = fs.statSync(file);
		parts.push(`${file}:${stat.mtimeMs}:${stat.size}`);
	}
	return parts.join("|");
}

export function loadContent(): ContentModel {
	const signature = contentSignature();
	if (cachedModel && signature === cachedSignature) return cachedModel;

	const allPosts = loadPosts();
	const published = allPosts.filter((post) => !post.frontmatter.draft).sort(byDateDesc);
	const routes = buildRoutes(published);
	const about = readMarkdownPage("about");
	const friends = readMarkdownPage("friends");
	const tags = [...new Set(published.flatMap((post) => post.summary.tags))].sort(
		(a, b) => a.localeCompare(b, "zh-CN"),
	);
	const categories = [
		...new Set(published.map((post) => post.summary.category)),
	].sort((a, b) => a.localeCompare(b, "zh-CN"));

	cachedModel = {
		allPosts,
		published,
		about,
		friends,
		routes,
		archive: { tags, categories },
	};
	cachedSignature = signature;
	return cachedModel;
}

function buildInfo(model: ContentModel): BuildInfo {
	return {
		version: site.buildLabel,
		builtAt: BUILT_AT,
		pageCount: model.routes.length,
		publishedCount: model.published.length,
	};
}

function createArticle(
	post: LoadedPost,
	isCopy: boolean,
): ArticleData {
	return {
		...summaryOf(post),
		isCopy,
		url: isCopy ? post.copyPath ?? post.canonicalPath : post.canonicalPath,
		canonicalPath: post.canonicalPath,
		comment: post.frontmatter.comment && !isCopy,
		html: post.html,
		ciphertext: post.ciphertext,
		headings: post.headings,
		passwordHint: post.frontmatter.passwordHint,
	};
}

function orderedPosts(model: ContentModel): LoadedPost[] {
	return [...model.published].sort(byDateDesc);
}

function homePosts(model: ContentModel): LoadedPost[] {
	return [...model.published].sort((a, b) => {
		if (a.frontmatter.pinned !== b.frontmatter.pinned) {
			return a.frontmatter.pinned ? -1 : 1;
		}
		return byDateDesc(a, b);
	});
}

export function getRoutes(): RouteSpec[] {
	return loadContent().routes;
}

export function getPageData(pathname: string): PageData | null {
	const model = loadContent();
	const clean = pathname.split("?")[0]?.split("#")[0] ?? "/";
	let normalized = clean;
	if (normalized !== "/" && !normalized.endsWith("/") && !normalized.endsWith(".html")) {
		normalized += "/";
	}
	const route = model.routes.find((item) => item.path === normalized);
	if (!route) return null;
	const allPosts = orderedPosts(model).map(summaryOf);
	const build = buildInfo(model);

	if (route.kind === "not-found") {
		return {
			kind: "not-found",
			route: "/404.html",
			title: "404 · 档案不存在",
			description: "这份档案不存在，或者已经被移动。",
			noindex: true,
			build,
			posts: allPosts,
		};
	}

	if (route.kind === "home") {
		return {
			kind: "home",
			route: "/",
			title: site.title,
			description: site.description,
			noindex: false,
			build,
			posts: homePosts(model).map(summaryOf),
			projects: projectsData,
		};
	}

	if (route.kind === "archive") {
		return {
			kind: "archive",
			route: "/archive/",
			title: "归档",
			description: "全部文章，按时间排列。也可以按分类与标签筛选。",
			noindex: false,
			build,
			posts: allPosts,
			archive: model.archive,
		};
	}

	if (route.kind === "about") {
		return {
			kind: "about",
			route: "/about/",
			title: "关于",
			description: site.author.bio,
			noindex: false,
			build,
			posts: allPosts,
			projects: projectsData,
			pageHtml: model.about.html,
		};
	}

	if (route.kind === "friends") {
		return {
			kind: "friends",
			route: "/friends/",
			title: "友链",
			description: "常逛的站点与常用工具，也开放交换友链。",
			noindex: false,
			build,
			posts: allPosts,
			friends: friendsData,
			pageHtml: model.friends.html,
		};
	}

	if (route.kind === "projects") {
		return {
			kind: "projects",
			route: "/projects/",
			title: "项目",
			description: "正在做和已经做完的东西：机器人插件、音频工具、个人站点。",
			noindex: false,
			build,
			posts: allPosts,
			projects: projectsData,
		};
	}

	if (route.kind === "feed") {
		const rss = route.path === "/rss/";
		return {
			kind: "feed",
			route: route.path,
			title: rss ? "RSS 订阅" : "Atom 订阅",
			description: rss
				? "用 RSS 阅读器订阅这里的新文章。"
				: "用 Atom 阅读器订阅这里的新文章。",
			noindex: false,
			build,
			posts: allPosts,
			feed: rss ? "rss" : "atom",
		};
	}

	if (route.kind === "post" && route.postId) {
		const post = model.published.find((item) => item.id === route.postId);
		if (!post) return null;
		const ordered = orderedPosts(model);
		const index = ordered.findIndex((item) => item.id === post.id);
		const prev = index > 0 ? ordered[index - 1] : undefined;
		const next = index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : undefined;
		return {
			kind: "post",
			route: route.path,
			title: post.frontmatter.title,
			description: post.summary.description,
			noindex: Boolean(route.isCopy),
			build,
			posts: allPosts,
			post: createArticle(post, Boolean(route.isCopy)),
			prevPost: prev ? summaryOf(prev) : undefined,
			nextPost: next ? summaryOf(next) : undefined,
		};
	}

	return null;
}

export function getNotFoundData(): PageData {
	const model = loadContent();
	return {
		kind: "not-found",
		route: "/404.html",
		title: "404 · 档案不存在",
		description: "这份档案不存在，或者已经被移动。",
		noindex: true,
		build: buildInfo(model),
		posts: orderedPosts(model).map(summaryOf),
	};
}

export interface FeedPost {
	title: string;
	description: string;
	published: string;
	url: string;
	html: string;
}

export function getFeedPosts(): FeedPost[] {
	return loadContent()
		.published.filter((post) => !post.frontmatter.encrypted)
		.map((post) => ({
			title: post.frontmatter.title,
			description: post.summary.description,
			published: post.frontmatter.published,
			url: post.canonicalPath,
			html: post.html ?? "",
		}));
}

export function getPostById(id: string): LoadedPost | null {
	return loadContent().published.find((post) => post.id === id) ?? null;
}

export function getPageCount(): number {
	return loadContent().routes.length;
}
