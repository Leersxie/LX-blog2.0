/// <reference types="vite/client" />

import type { PageData } from "./types";

declare global {
	interface Window {
		__NOCTILUX_DATA__?: PageData;
	}
}

export {};
