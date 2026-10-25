import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

import "@fontsource-variable/space-grotesk/wght.css";
import "@fontsource-variable/jetbrains-mono/wght.css";

import { App } from "./App";
import "./styles/index.css";

const data = window.__NOCTILUX_DATA__;
const root = document.getElementById("root");

if (!data) {
	throw new Error("Missing __NOCTILUX_DATA__ payload.");
}
if (!root) {
	throw new Error("Missing #root element.");
}

hydrateRoot(
	root,
	<StrictMode>
		<App data={data} />
	</StrictMode>,
);
