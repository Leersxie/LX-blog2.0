import { ArrowLeft, ArrowUpRight, Search } from "lucide-react";

import type { PageData } from "../types";

interface NotFoundPageProps {
	data: PageData;
}

export function NotFoundPage({ data }: NotFoundPageProps) {
	return (
		<div className="page not-found-page">
			<div className="not-found__grid" aria-hidden="true">
				<span>ARCHIVE / LOOKUP</span>
				<span>STATUS / 404</span>
				<span>REQUEST / REJECTED</span>
			</div>
			<p className="mono-label">SIGNAL LOST / NO SUCH RECORD</p>
			<h1>
				<span>404</span>
				这份档案
				<br />
				不存在。
			</h1>
			<p className="not-found__copy">
				可能是链接过期，也可能是记录被移动了。你可以回到首页，或者直接搜一下。
			</p>
			<div className="not-found__actions">
				<button
					type="button"
					className="button button--solid"
					onClick={() => {
						window.dispatchEvent(new CustomEvent("noctilux:open-search"));
					}}
				>
					<Search aria-hidden="true" size={15} /> 搜索档案
				</button>
				<a className="button" href="/">
					<ArrowLeft aria-hidden="true" size={15} /> 返回首页
				</a>
				<a className="text-link" href="/archive/">
					浏览归档 <ArrowUpRight aria-hidden="true" size={14} />
				</a>
			</div>
			<div className="not-found__meta">
				<span className="mono-label">
					INDEX SIZE / {String(data.build.publishedCount).padStart(2, "0")} RECORDS
				</span>
				<span className="mono-label">BUILD / {data.build.version}</span>
			</div>
		</div>
	);
}
