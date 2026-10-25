/// <reference types="vite/client" />

declare const __SITE_BASE__: string;

import type { PageData } from "./types";

declare global {
	interface Window {
		__NOCTILUX_DATA__?: PageData;
	}
}

export {};
