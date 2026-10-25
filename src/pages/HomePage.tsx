import { ArrowDownRight, ArrowUpRight, Circle } from "lucide-react";

import { site } from "../config/site";
import { formatDate, readingLabel } from "../lib/format";
import type { PageData, Project } from "../types";

interface HomePageProps {
	data: PageData;
}

const STATUS_LABEL: Record<Project["status"], string> = {
	active: "进行中",
	shipped: "已完成",
	archived: "已归档",
};

function ProjectRow({ project, index }: { project: Project; index: number }) {
	const href = project.href ?? project.source ?? "/projects/";
	return (
		<a
			className="project-row"
			href={href}
			{...(href.startsWith("http")
				? { target: "_blank", rel: "noopener noreferrer" }
				: {})}
		>
			<span className="mono-label project-row__index">
				{String(index + 1).padStart(2, "0")}
			</span>
			<span className="project-row__body">
				<span className="project-row__title">{project.title}</span>
				<span className="project-row__desc">{project.description}</span>
			</span>
			<span className="project-row__meta">
				<span>{project.category}</span>
				<span>{project.year}</span>
				<span>{STATUS_LABEL[project.status]}</span>
			</span>
			<ArrowUpRight aria-hidden="true" size={17} />
		</a>
	);
}

export function HomePage({ data }: HomePageProps) {
	const posts = data.posts ?? [];
	const latest = posts[0];
	const projects = (data.projects ?? []).slice(0, 4);
	const activeProjects = (data.projects ?? []).filter(
		(project) => project.status === "active",
	);

	return (
		<div className="page home-page">
			<section className="home-hero" aria-labelledby="home-title">
				<div className="home-hero__meta">
					<p className="mono-label">LEERSXIE / PERSONAL ARCHIVE</p>
					<p className="mono-label">EST. 2026 · CN</p>
				</div>
				<div className="home-hero__grid">
					<div className="home-hero__intro">
						<p className="eyebrow">
							<span className="signal-dot" aria-hidden="true" />
							NOCTILUX / 夜航档案
						</p>
						<h1 id="home-title">
							<span className="hero-line">夜航</span>
							<span className="hero-line hero-line--outline">档案.</span>
						</h1>
						<p className="home-hero__lede">
							我是 Leersxie，简称 LX。这里放文章、项目，和那些暂时还没想清楚的事。
						</p>
						<p className="home-hero__sub">
							喜欢化学，对心理学感兴趣。原 UTPV 制作者，现在慢慢做文字 PV。
						</p>
						<div className="home-hero__actions">
							<a className="button button--solid" href="/archive/">
								翻阅记录 <ArrowDownRight aria-hidden="true" size={16} />
							</a>
							<a className="button" href="/about/">
								关于我
							</a>
						</div>
					</div>

					<aside className="hero-ledger" aria-label="站点摘要">
						<div className="hero-ledger__top">
							<span className="mono-label">CURRENT STATUS</span>
							<span className="status-pill">
								<Circle aria-hidden="true" size={7} fill="currentColor" />
								{site.author.status}
							</span>
						</div>
						<dl className="ledger-stats">
							<div>
								<dt className="mono-label">ARTICLES</dt>
								<dd>{String(data.build.publishedCount).padStart(2, "0")}</dd>
							</div>
							<div>
								<dt className="mono-label">PROJECTS</dt>
								<dd>{String(activeProjects.length).padStart(2, "0")}</dd>
							</div>
							<div>
								<dt className="mono-label">SINCE</dt>
								<dd>{site.startDate.slice(0, 4)}</dd>
							</div>
						</dl>
						<div className="hero-ledger__spine" aria-hidden="true">
							<span>ARCHIVE INDEX / OPEN ACCESS / 2026</span>
						</div>
						{latest ? (
							<a className="hero-latest" href={latest.url}>
								<span className="mono-label">LATEST / {formatDate(latest.published)}</span>
								<strong>{latest.title}</strong>
								<span>{latest.description}</span>
								<span className="hero-latest__foot mono-label">
									{readingLabel(latest.readingMinutes)}
									<ArrowUpRight aria-hidden="true" size={14} />
								</span>
							</a>
						) : (
							<p className="hero-latest hero-latest--empty">还没有文章。</p>
						)}
					</aside>
				</div>
			</section>

			<section className="home-section" aria-labelledby="recent-title">
				<div className="section-heading">
					<div>
						<p className="mono-label">INDEX / 01</p>
						<h2 id="recent-title">最近记录</h2>
					</div>
					<a className="text-link" href="/archive/">
						全部 {data.build.publishedCount} 篇 <ArrowUpRight size={14} />
					</a>
				</div>
				<div className="post-list post-list--home">
					{posts.length === 0 ? (
						<p className="empty-state">还没有公开记录。</p>
					) : (
						posts.map((post, index) => (
							<a className="post-row" href={post.url} key={post.id}>
								<span className="post-row__index mono-label">
									{String(index + 1).padStart(2, "0")}
								</span>
								<time className="post-row__date" dateTime={post.published}>
									{formatDate(post.published)}
								</time>
								<span className="post-row__title">
									{post.title}
									{post.encrypted && (
										<span className="mini-lock" aria-label="受密码保护">
											[LOCKED]
										</span>
									)}
								</span>
								<span className="post-row__meta">
									<span>{post.category}</span>
									<span>{readingLabel(post.readingMinutes)}</span>
									<ArrowUpRight aria-hidden="true" size={15} />
								</span>
							</a>
						))
					)}
				</div>
			</section>

			<section className="home-section" aria-labelledby="projects-title">
				<div className="section-heading">
					<div>
						<p className="mono-label">INDEX / 02</p>
						<h2 id="projects-title">正在做的东西</h2>
					</div>
					<a className="text-link" href="/projects/">
						全部项目 <ArrowUpRight size={14} />
					</a>
				</div>
				<div className="project-list">
					{projects.map((project, index) => (
						<ProjectRow project={project} index={index} key={project.id} />
					))}
				</div>
			</section>

			<section className="home-note" aria-labelledby="note-title">
				<div>
					<p className="mono-label">COLOPHON / 03</p>
					<h2 id="note-title">一份安静的索引</h2>
				</div>
				<p>
					这里不是作品集，也不是信息流。它更像一张持续维护的桌面：文章按时间排列，项目按状态排列，其余东西慢慢补。
				</p>
				<a className="text-link" href="/about/">
					继续读关于页 <ArrowUpRight size={14} />
				</a>
			</section>
		</div>
	);
}
