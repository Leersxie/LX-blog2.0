import { ArrowUpRight, Rss } from "lucide-react";

import type { PageData } from "../types";

interface FeedPageProps {
	data: PageData;
}

export function FeedPage({ data }: FeedPageProps) {
	const isRss = data.feed === "rss";
	const href = isRss ? "/rss.xml" : "/atom.xml";
	const type = isRss ? "RSS 2.0" : "Atom";
	return (
		<div className="page feed-page">
			<header className="page-intro">
				<div>
					<p className="eyebrow">
						<span className="signal-dot" aria-hidden="true" />
						SYNDICATION / FEED
					</p>
					<h1 data-pagefind-meta="title">{isRss ? "RSS" : "Atom"} 订阅</h1>
				</div>
				<p className="page-intro__copy">
					如果不想反复打开站点，可以把更新放进自己的阅读器。这里不提供邮件订阅。
				</p>
			</header>
			<div className="feed-sheet">
				<div>
					<p className="mono-label">{type} / PUBLIC FEED</p>
					<h2>把更新带走</h2>
					<p>
						订阅源包含公开、非加密的文章。草稿、加密正文和兼容副本都不会进入 feed。
					</p>
					<div className="feed-actions">
						<a className="button button--solid" href={href}>
							<Rss aria-hidden="true" size={15} /> 打开 {type}
						</a>
						<a className="text-link" href="/archive/">
							浏览归档 <ArrowUpRight aria-hidden="true" size={14} />
						</a>
					</div>
				</div>
				<dl className="feed-facts">
					<div>
						<dt className="mono-label">URL</dt>
						<dd>{href}</dd>
					</div>
					<div>
						<dt className="mono-label">FORMAT</dt>
						<dd>{type}</dd>
					</div>
					<div>
						<dt className="mono-label">LANGUAGE</dt>
						<dd>zh-cn</dd>
					</div>
					<div>
						<dt className="mono-label">ALTERNATE</dt>
						<dd>
							<a href={isRss ? "/atom/" : "/rss/"}>
								{isRss ? "Atom" : "RSS"} 说明页
							</a>
						</dd>
					</div>
				</dl>
			</div>
		</div>
	);
}
