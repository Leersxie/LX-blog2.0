import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	base: "/",
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
