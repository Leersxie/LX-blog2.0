import { renderToString } from "react-dom/server";

import { App } from "./App";
import type { PageData } from "./types";

export function renderPage(data: PageData): string {
	return renderToString(<App data={data} />);
}
