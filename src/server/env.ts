import fs from "node:fs";
import path from "node:path";

/**
 * Minimal .env loader for build-time secrets. We intentionally do not use
 * Vite's env pipeline: post passwords must never reach the client bundle.
 */
export function loadBuildEnv(root = process.cwd()): void {
	for (const file of [".env.local", ".env"]) {
		const full = path.join(root, file);
		if (!fs.existsSync(full)) continue;
		const source = fs.readFileSync(full, "utf8");
		for (const rawLine of source.split(/\r?\n/)) {
			const line = rawLine.trim();
			if (!line || line.startsWith("#")) continue;
			const eq = line.indexOf("=");
			if (eq < 1) continue;
			const key = line.slice(0, eq).trim();
			let value = line.slice(eq + 1).trim();
			if (
				(value.startsWith('"') && value.endsWith('"')) ||
				(value.startsWith("'") && value.endsWith("'"))
			) {
				value = value.slice(1, -1);
			}
			if (!(key in process.env)) process.env[key] = value;
		}
	}
}

export function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(
			`[content] Missing build secret "${name}". Add it to .env.local or CI secrets.`,
		);
	}
	return value;
}
