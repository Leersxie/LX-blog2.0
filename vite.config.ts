import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const base = (() => {
	const value = process.env.SITE_BASE || "/";
	return value.endsWith("/") ? value : `${value}/`;
})();

export default defineConfig({
	plugins: [react()],
	base,
	define: {
		__SITE_BASE__: JSON.stringify(base),
	},
	server: {
		port: 4321,
		strictPort: true,
	},
	build: {
		target: "es2022",
		cssCodeSplit: false,
		assetsInlineLimit: 4096,
	},
});
