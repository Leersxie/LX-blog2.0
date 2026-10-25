import fs from "node:fs";
import http from "node:http";
import path from "node:path";

import { createServer } from "vite";

const root = process.cwd();
const port = Number(process.env.PORT || 4321);
const templatePath = path.join(root, "index.html");

const vite = await createServer({
	root,
	appType: "custom",
	server: {
		middlewareMode: true,
		port,
		strictPort: true,
	},
});

const server = http.createServer((request, response) => {
	vite.middlewares(request, response, async (error) => {
		if (error) {
			vite.ssrFixStacktrace(error);
			response.statusCode = 500;
			response.setHeader("Content-Type", "text/plain; charset=utf-8");
			response.end(error.stack || String(error));
			return;
		}
		await handleRequest(request, response);
	});
});

async function handleRequest(request, response) {
	const url = new URL(request.url || "/", `http://localhost:${port}`);
	const pathname = decodeURIComponent(url.pathname);

	if (request.method !== "GET" && request.method !== "HEAD") {
		response.statusCode = 405;
		response.end("Method Not Allowed");
		return;
	}

	try {
		const feeds = await vite.ssrLoadModule("/src/server/feeds.ts");
		const content = await vite.ssrLoadModule("/src/server/content.ts");
		if (pathname === "/rss.xml") {
			send(response, 200, "application/rss+xml; charset=utf-8", feeds.buildRss());
			return;
		}
		if (pathname === "/atom.xml") {
			send(response, 200, "application/atom+xml; charset=utf-8", feeds.buildAtom());
			return;
		}
		if (pathname === "/sitemap.xml" || pathname === "/sitemap-0.xml") {
			send(response, 200, "application/xml; charset=utf-8", feeds.buildSitemap());
			return;
		}
		if (pathname === "/sitemap-index.xml") {
			send(
				response,
				200,
				"application/xml; charset=utf-8",
				feeds.buildSitemapIndex(),
			);
			return;
		}
		if (pathname === "/robots.txt") {
			send(response, 200, "text/plain; charset=utf-8", feeds.buildRobots());
			return;
		}
		if (pathname === "/api/allPostMeta.json" || pathname === "/api/calendar-data.json") {
			const posts = content
				.getRoutes()
				.filter((route) => route.kind === "post" && !route.isCopy)
				.map((route) => content.getPageData(route.path)?.post)
				.filter(Boolean);
			const payload =
				pathname === "/api/calendar-data.json"
					? posts.map((post) => ({
							id: post.id,
							title: post.title,
							date: post.published,
						}))
					: posts.map((post) => ({
							id: post.id,
							title: post.title,
							description: post.description,
							published: post.published,
							category: post.category,
							tags: post.tags,
							url: post.url,
							password: post.encrypted,
						}));
			send(
				response,
				200,
				"application/json; charset=utf-8",
				JSON.stringify(payload),
			);
			return;
		}

		const documentApi = await vite.ssrLoadModule("/src/server/document.ts");
		const seoApi = await vite.ssrLoadModule("/src/server/seo.ts");
		const serverEntry = await vite.ssrLoadModule("/src/entry-server.tsx");

		const resolved = content.getPageData(pathname);
		const is404 = !resolved;
		const data = resolved ?? content.getNotFoundData();
		const seo = seoApi.getSeo(data);
		const body = serverEntry.renderPage(data);

		let html = fs.readFileSync(templatePath, "utf8");
		html = await vite.transformIndexHtml(request.url || "/", html);
		html = html.replace(/<title>[\s\S]*?<\/title>/, "");
		html = html.replace(
			"</head>",
			`<link rel="stylesheet" href="/src/styles/index.css" />\n${documentApi.buildHeadTags(seo)}\n</head>`,
		);
		html = html.replace(
			'<div id="root"></div>',
			`<div id="root">${body}</div>\n<script>window.__NOCTILUX_DATA__ = ${documentApi.serializePageData(data)};</script>`,
		);
		send(response, is404 ? 404 : 200, "text/html; charset=utf-8", html);
	} catch (error) {
		vite.ssrFixStacktrace(error);
		console.error(error);
		response.statusCode = 500;
		response.setHeader("Content-Type", "text/plain; charset=utf-8");
		response.end(error instanceof Error ? error.stack : String(error));
	}
}

function send(response, status, type, body) {
	response.statusCode = status;
	response.setHeader("Content-Type", type);
	response.setHeader("Cache-Control", "no-store");
	response.end(body);
}

server.listen(port, "127.0.0.1", () => {
	console.log(`NOCTILUX dev: http://127.0.0.1:${port}/`);
});

const shutdown = async () => {
	server.close();
	await vite.close();
	process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
