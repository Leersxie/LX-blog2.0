import { useMemo, useState } from "react";
import {
	ArrowLeft,
	ArrowRight,
	ArrowUpRight,
	CalendarDays,
	FileText,
	LockKeyhole,
} from "lucide-react";

import { Comments } from "../components/comments/Comments";
import { ArticleBody } from "../components/article/ArticleBody";
import { ArticleToc, MobileToc } from "../components/article/ArticleToc";
import { EncryptedBody } from "../components/article/EncryptedBody";
import { ReadingProgress } from "../components/article/ReadingProgress";
import { site } from "../config/site";
import { formatDate, formatDateZh, readingLabel } from "../lib/format";
import { headingsFromHtml } from "../lib/headings";
import type { PageData, PostSummary, TocHeading } from "../types";

interface ArticlePageProps {
	data: PageData;
}

function postTagsHref(tag: string): string {
	return `/archive/?tag=${encodeURIComponent(tag)}`;
}

function relatedPosts(data: PageData): PostSummary[] {
	const current = data.post;
	if (!current) return [];
	const pool = (data.posts ?? []).filter(
		(post) => post.id !== current.id && !post.encrypted,
	);
	const scored = pool
		.map((post) => {
			const tagScore = post.tags.filter((tag) => current.tags.includes(tag)).length;
			const categoryScore = post.category === current.category ? 1 : 0;
			return { post, score: tagScore * 2 + categoryScore };
		})
		.sort((a, b) => b.score - a.score)
		.slice(0, 2);
	return scored.map((item) => item.post);
}

export function ArticlePage({ data }: ArticlePageProps) {
	const post = data.post;
	const [unlocked, setUnlocked] = useState<{
		html: string;
		headings: TocHeading[];
	} | null>(null);

	const effectiveHeadings = useMemo(
		() => unlocked?.headings ?? post?.headings ?? [],
		[post?.headings, unlocked],
	);

	if (!post) {
		return (
			<div className="page">
				<p>文章不存在。</p>
			</div>
		);
	}

	const related = relatedPosts(data);

	return (
		<article className="page article-page">
			<ReadingProgress />
			<nav className="breadcrumbs" aria-label="面包屑">
				<a href="/">首页</a>
				<span aria-hidden="true">/</span>
				<a href="/archive/">归档</a>
				<span aria-hidden="true">/</span>
				<span aria-current="page">{post.title}</span>
			</nav>

			{post.isCopy && (
				<div className="compat-notice" role="note">
					<p>
						这是旧链接的兼容副本。规范地址是{" "}
						<a href={post.canonicalPath}>{post.canonicalPath}</a>。
					</p>
					<span className="mono-label">NOINDEX / LEGACY PATH</span>
				</div>
			)}

			<header className="article-header">
				<div className="article-header__meta">
					<time dateTime={post.published}>
						<CalendarDays aria-hidden="true" size={14} />
						{formatDate(post.published)}
					</time>
					<a href={`/archive/?category=${encodeURIComponent(post.category)}`}>
						{post.category}
					</a>
					<span>
						<FileText aria-hidden="true" size={14} />
						{readingLabel(post.readingMinutes)}
					</span>
					{post.encrypted && (
						<span className="article-lock-label">
							<LockKeyhole aria-hidden="true" size={13} /> 加密
						</span>
					)}
				</div>
				<h1 data-pagefind-meta="title">{post.title}</h1>
				{post.description && <p className="article-header__desc">{post.description}</p>}
				<div className="article-header__foot">
					<div className="tag-row">
						{post.tags.map((tag) => (
							<a href={postTagsHref(tag)} key={tag}>
								#{tag}
							</a>
						))}
					</div>
					{post.updated && (
						<span className="mono-label">UPDATED / {formatDate(post.updated)}</span>
					)}
				</div>
			</header>

			<div className="article-layout">
				<div className="article-main">
					<div data-pagefind-ignore>
						<MobileToc headings={effectiveHeadings} />
					</div>
					{post.encrypted ? (
						unlocked ? (
							<div className="unlocked-body">
								<div className="unlocked-notice" role="status">
									<span>档案已解锁。内容仅在本页内存中，刷新后需要重新输入密码。</span>
									<button
										type="button"
										className="clear-filter"
										onClick={() => setUnlocked(null)}
									>
										重新锁定
									</button>
								</div>
								<ArticleBody html={unlocked.html} />
							</div>
						) : (
							<EncryptedBody
								post={post}
								onUnlocked={(html) =>
									setUnlocked({ html, headings: headingsFromHtml(html) })
								}
							/>
						)
					) : post.html ? (
						<ArticleBody html={post.html} />
					) : (
						<p className="empty-state">正文不存在。</p>
					)}

					<footer className="article-license" data-pagefind-ignore>
						<p className="mono-label">LICENSE / {site.license.name}</p>
						<p>
							本文由 {site.author.name} 写于 {formatDateZh(post.published)}。除特别注明外，按{" "}
							<a href={site.license.url} target="_blank" rel="noopener noreferrer">
								{site.license.name}
							</a>{" "}
							授权。转载请注明出处。
						</p>
					</footer>

					<nav
						className="article-pagination"
						aria-label="文章翻页"
						data-pagefind-ignore
					>
						{data.prevPost ? (
							<a href={data.prevPost.url}>
								<span className="mono-label">
									<ArrowLeft aria-hidden="true" size={13} /> NEWER
								</span>
								<strong>{data.prevPost.title}</strong>
							</a>
						) : (
							<span />
						)}
						{data.nextPost ? (
							<a href={data.nextPost.url} className="is-next">
								<span className="mono-label">
									OLDER <ArrowRight aria-hidden="true" size={13} />
								</span>
								<strong>{data.nextPost.title}</strong>
							</a>
						) : (
							<span />
						)}
					</nav>
				</div>

				{effectiveHeadings.length > 0 && (
					<div className="article-side" data-pagefind-ignore>
						<ArticleToc headings={effectiveHeadings} />
					</div>
				)}
			</div>

			{related.length > 0 && (
				<section
					className="related"
					aria-labelledby="related-title"
					data-pagefind-ignore
				>
					<div className="section-heading">
						<div>
							<p className="mono-label">NEARBY / 相关记录</p>
							<h2 id="related-title">继续读</h2>
						</div>
					</div>
					<div className="related-grid">
						{related.map((item) => (
							<a href={item.url} key={item.id}>
								<span className="mono-label">{formatDate(item.published)}</span>
								<strong>{item.title}</strong>
								<span>{item.description}</span>
								<ArrowUpRight aria-hidden="true" size={16} />
							</a>
						))}
					</div>
				</section>
			)}

			{post.comment ? <Comments /> : null}
		</article>
	);
}
