import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const root = path.join(process.cwd(), "dist");
const port = Number(process.env.PORT || 4321);
const rawBase = process.env.SITE_BASE || "/";
const base = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;

const types = {
	".html": "text/html; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".xml": "application/xml; charset=utf-8",
	".txt": "text/plain; charset=utf-8",
	".svg": "image/svg+xml",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".webp": "image/webp",
	".woff2": "font/woff2",
	".woff": "font/woff",
	".ico": "image/x-icon",
	".wasm": "application/wasm",
};

function safePath(pathname) {
	const decoded = decodeURIComponent(pathname);
	const file = path.resolve(root, `.${decoded}`);
	if (!file.startsWith(root)) return null;
	return file;
}

const server = http.createServer((request, response) => {
	let pathname = new URL(request.url || "/", "http://localhost").pathname;
	if (base !== "/") {
		if (pathname === "/") {
			response.writeHead(302, { Location: base });
			response.end();
			return;
		}
		if (pathname === base.replace(/\/$/, "")) {
			response.writeHead(308, { Location: base });
			response.end();
			return;
		}
		if (!pathname.startsWith(base)) {
			response.writeHead(404, { "Content-Type": types[".html"] });
			response.end(fs.readFileSync(path.join(root, "404.html")));
			return;
		}
		pathname = `/${pathname.slice(base.length)}`;
	}
	let file = safePath(pathname);
	if (!file) {
		response.statusCode = 400;
		response.end("Bad Request");
		return;
	}

	if (pathname.endsWith("/")) {
		file = path.join(file, "index.html");
	} else if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
		response.writeHead(308, { Location: `${pathname}/` });
		response.end();
		return;
	}

	if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
		const notFound = path.join(root, "404.html");
		response.writeHead(404, { "Content-Type": types[".html"] });
		response.end(fs.readFileSync(notFound));
		return;
	}

	const ext = path.extname(file).toLowerCase();
	const headers = {
		"Content-Type": types[ext] || "application/octet-stream",
		"X-Content-Type-Options": "nosniff",
	};
	if (file.includes(`${path.sep}assets${path.sep}`) || file.includes(`${path.sep}pagefind${path.sep}`)) {
		headers["Cache-Control"] = "public, max-age=31536000, immutable";
	} else {
		headers["Cache-Control"] = "no-cache";
	}
	response.writeHead(200, headers);
	if (request.method === "HEAD") {
		response.end();
		return;
	}
	response.end(fs.readFileSync(file));
});

server.listen(port, "127.0.0.1", () => {
	console.log(`NOCTILUX preview: http://127.0.0.1:${port}/`);
});
