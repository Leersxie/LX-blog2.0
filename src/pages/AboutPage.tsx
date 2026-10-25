import { ArrowUpRight, MapPin } from "lucide-react";

import { ArticleBody } from "../components/article/ArticleBody";
import { site } from "../config/site";
import { withBase } from "../lib/url";
import type { PageData } from "../types";

interface AboutPageProps {
	data: PageData;
}

export function AboutPage({ data }: AboutPageProps) {
	const activeProjects = (data.projects ?? []).filter(
		(project) => project.status === "active",
	);
	return (
		<div className="page about-page">
			<header className="page-intro">
				<div>
					<p className="eyebrow">
						<span className="signal-dot" aria-hidden="true" />
						PROFILE / 03
					</p>
					<h1 data-pagefind-meta="title">关于</h1>
				</div>
				<p className="page-intro__copy">
					一份不完整的自我介绍。写于站点开始的时候，之后慢慢更新。
				</p>
			</header>

			<div className="about-layout">
				<div className="about-main">
					{data.pageHtml ? <ArticleBody html={data.pageHtml} /> : null}
					<section className="about-section" aria-labelledby="now-title">
						<p className="mono-label">NOW / 2026</p>
						<h2 id="now-title">最近在做什么</h2>
						<p>
							主要精力放在 YesImBot 的记忆与行为工具上，也在重做这个站点。偶尔做音频可视化的汉化，写一点关于化学和心理学的笔记。
						</p>
						<div className="about-projects">
							{activeProjects.map((project) => {
								const href = project.href ?? project.source ?? "/projects/";
								return (
								<a
									key={project.id}
									href={withBase(href)}
									{...(href.startsWith("http")
										? { target: "_blank", rel: "noopener noreferrer" }
										: {})}
								>
									<span className="mono-label">IN PROGRESS</span>
									<strong>{project.title}</strong>
									<ArrowUpRight aria-hidden="true" size={15} />
								</a>
								);
							})}
						</div>
					</section>
				</div>

				<aside className="about-facts" aria-label="个人信息">
					<div>
						<p className="mono-label">NAME</p>
						<p>Leersxie / LX</p>
					</div>
					<div>
						<p className="mono-label">BASE</p>
						<p>
							<MapPin aria-hidden="true" size={13} /> {site.author.location}
						</p>
					</div>
					<div>
						<p className="mono-label">INTERESTS</p>
						<p>化学 · 心理学 · RTS · 文字 PV</p>
					</div>
					<div>
						<p className="mono-label">ELSEWHERE</p>
						<ul>
							{site.socials.map((social) => (
								<li key={social.href}>
									<a
										href={social.href}
										target="_blank"
										rel="noopener noreferrer"
									>
										{social.label} <ArrowUpRight aria-hidden="true" size={12} />
									</a>
								</li>
							))}
						</ul>
					</div>
					<div>
						<p className="mono-label">NOTE</p>
						<p>{site.author.status}</p>
					</div>
				</aside>
			</div>
		</div>
	);
}
