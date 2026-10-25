import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, ListFilter, X } from "lucide-react";

import { formatDate, readingLabel } from "../lib/format";
import { withBase } from "../lib/url";
import type { PageData, PostSummary } from "../types";

type Filter = { type: "tag" | "category"; value: string } | null;

interface ArchivePageProps {
	data: PageData;
}

function readFilter(): Filter {
	if (typeof window === "undefined") return null;
	const params = new URLSearchParams(window.location.search);
	const tag = params.get("tag");
	if (tag) return { type: "tag", value: tag };
	const category = params.get("category");
	if (category) return { type: "category", value: category };
	return null;
}

function filterToUrl(filter: Filter): string {
	const params = new URLSearchParams();
	if (filter) params.set(filter.type, filter.value);
	const query = params.toString();
	return query ? `/archive/?${query}` : "/archive/";
}

function groupByYear(posts: PostSummary[]): Array<[string, PostSummary[]]> {
	const map = new Map<string, PostSummary[]>();
	for (const post of posts) {
		const year = post.published.slice(0, 4);
		const list = map.get(year) ?? [];
		list.push(post);
		map.set(year, list);
	}
	return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

export function ArchivePage({ data }: ArchivePageProps) {
	const allPosts = useMemo(() => data.posts ?? [], [data.posts]);
	const archive = data.archive ?? { tags: [], categories: [] };
	const [filter, setFilter] = useState<Filter>(null);

	useEffect(() => {
		setFilter(readFilter());
		const onPopState = () => setFilter(readFilter());
		window.addEventListener("popstate", onPopState);
		return () => window.removeEventListener("popstate", onPopState);
	}, []);

	const apply = (next: Filter) => {
		setFilter(next);
		window.history.replaceState({}, "", withBase(filterToUrl(next)));
	};

	const filtered = useMemo(() => {
		if (!filter) return allPosts;
		return allPosts.filter((post) =>
			filter.type === "tag"
				? post.tags.includes(filter.value)
				: post.category === filter.value,
		);
	}, [allPosts, filter]);

	const groups = useMemo(() => groupByYear(filtered), [filtered]);

	return (
		<div className="page archive-page">
			<header className="page-intro">
				<div>
					<p className="eyebrow">
						<span className="signal-dot" aria-hidden="true" />
						INDEX / ALL ENTRIES
					</p>
					<h1 data-pagefind-meta="title">归档</h1>
				</div>
				<p className="page-intro__copy">
					所有公开记录，按年份倒序排列。可以按分类或标签收窄范围。
				</p>
			</header>

			<div className="archive-toolbar">
				<div className="filter-group" aria-label="按分类筛选">
					<span className="mono-label">
						<ListFilter aria-hidden="true" size={13} /> CATEGORY
					</span>
					<button
						type="button"
						className={`filter-chip${filter === null ? " is-active" : ""}`}
						aria-pressed={filter === null}
						onClick={() => apply(null)}
					>
						全部
					</button>
					{archive.categories.map((category) => {
						const active =
							filter?.type === "category" && filter.value === category;
						return (
							<button
								key={category}
								type="button"
								className={`filter-chip${active ? " is-active" : ""}`}
								aria-pressed={active}
								onClick={() => apply({ type: "category", value: category })}
							>
								{category}
							</button>
						);
					})}
				</div>
				<div className="filter-group" aria-label="按标签筛选">
					<span className="mono-label">TAG</span>
					{archive.tags.map((tag) => {
						const active = filter?.type === "tag" && filter.value === tag;
						return (
							<button
								key={tag}
								type="button"
								className={`filter-chip${active ? " is-active" : ""}`}
								aria-pressed={active}
								onClick={() => apply({ type: "tag", value: tag })}
							>
								#{tag}
							</button>
						);
					})}
				</div>
				<div className="archive-toolbar__summary">
					<span className="mono-label" aria-live="polite">
						{String(filtered.length).padStart(2, "0")} /{" "}
						{String(allPosts.length).padStart(2, "0")} RECORDS
					</span>
					{filter && (
						<button type="button" className="clear-filter" onClick={() => apply(null)}>
							<X aria-hidden="true" size={13} /> 清除筛选
						</button>
					)}
				</div>
			</div>

			{groups.length === 0 ? (
				<div className="archive-empty">
					<p className="mono-label">NO MATCHING RECORDS</p>
					<h2>这个范围里还没有记录。</h2>
					<button type="button" className="button" onClick={() => apply(null)}>
						查看全部
					</button>
				</div>
			) : (
				<div className="archive-groups">
					{groups.map(([year, posts]) => (
						<section className="archive-year" key={year} aria-labelledby={`year-${year}`}>
							<div className="archive-year__head">
								<h2 id={`year-${year}`}>{year}</h2>
								<span className="mono-label">
									{String(posts.length).padStart(2, "0")} ENTRIES
								</span>
							</div>
							<div className="archive-list">
								{posts.map((post, index) => (
									<a className="archive-entry" href={withBase(post.url)} key={post.id}>
										<span className="archive-entry__index mono-label">
											{String(index + 1).padStart(2, "0")}
										</span>
										<time dateTime={post.published}>{formatDate(post.published)}</time>
										<span className="archive-entry__title">
											{post.title}
											{post.encrypted && (
												<span className="mini-lock" aria-label="受密码保护">
													[LOCKED]
												</span>
											)}
											{post.pinned && (
												<span className="mini-label" aria-label="置顶">
													PINNED
												</span>
											)}
										</span>
										<span className="archive-entry__tags">
											{post.tags.map((tag) => `#${tag}`).join(" ")}
										</span>
										<span className="archive-entry__meta mono-label">
											{post.category} / {readingLabel(post.readingMinutes)}
										</span>
										<ArrowUpRight aria-hidden="true" size={15} />
									</a>
								))}
							</div>
						</section>
					))}
				</div>
			)}

			<div className="archive-footer">
				<p className="mono-label">SUBSCRIBE / RSS / ATOM</p>
				<p>
					想持续收到更新，可以使用 <a href={withBase("/rss.xml")}>RSS</a> 或{" "}
					<a href={withBase("/atom.xml")}>Atom</a>。
				</p>
			</div>
		</div>
	);
}
