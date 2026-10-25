import { ArrowUpRight, GitBranch, ExternalLink } from "lucide-react";

import { site } from "../config/site";
import { withBase } from "../lib/url";
import type { PageData, Project } from "../types";

interface ProjectsPageProps {
	data: PageData;
}

const STATUS: Record<Project["status"], { label: string; className: string }> = {
	active: { label: "进行中", className: "status--active" },
	shipped: { label: "已完成", className: "status--shipped" },
	archived: { label: "已归档", className: "status--archived" },
};

function ProjectCard({ project, index }: { project: Project; index: number }) {
	return (
		<article className="project-card">
			<div className="project-card__head">
				<span className="mono-label">
					{String(index + 1).padStart(2, "0")} / {project.year}
				</span>
				<span className={`status-chip ${STATUS[project.status].className}`}>
					{STATUS[project.status].label}
				</span>
			</div>
			<div className="project-card__main">
				<div>
					<p className="mono-label">{project.category}</p>
					<h2>{project.title}</h2>
					<p className="project-card__desc">{project.description}</p>
					<div className="tag-row">
						{project.stack.map((item) => (
							<span key={item}>{item}</span>
						))}
					</div>
				</div>
				{project.image ? (
					<button
						type="button"
						className="project-card__media"
						data-lightbox-src={withBase(project.image)}
						data-lightbox-alt={`${project.title} 项目截图`}
						aria-label={`放大查看 ${project.title} 截图`}
					>
						<img src={withBase(project.image)} alt="" loading="lazy" />
					</button>
				) : (
					<div className="project-card__glyph" aria-hidden="true">
						<span>{String(index + 1).padStart(2, "0")}</span>
						<small>{project.category}</small>
					</div>
				)}
			</div>
			<div className="project-card__foot">
				<div className="project-card__links">
					{project.href && (
						<a
							href={withBase(project.href)}
							target={project.href.startsWith("http") ? "_blank" : undefined}
							rel={project.href.startsWith("http") ? "noopener noreferrer" : undefined}
						>
							<ExternalLink aria-hidden="true" size={14} /> 打开
						</a>
					)}
					{project.source && (
						<a href={project.source} target="_blank" rel="noopener noreferrer">
							<GitBranch aria-hidden="true" size={14} /> 源码
						</a>
					)}
				</div>
				<span className="mono-label">
					{project.tags.join(" / ")} <ArrowUpRight aria-hidden="true" size={13} />
				</span>
			</div>
		</article>
	);
}

export function ProjectsPage({ data }: ProjectsPageProps) {
	const projects = data.projects ?? [];
	return (
		<div className="page projects-page">
			<header className="page-intro">
				<div>
					<p className="eyebrow">
						<span className="signal-dot" aria-hidden="true" />
						WORKS / 02
					</p>
					<h1 data-pagefind-meta="title">项目</h1>
				</div>
				<p className="page-intro__copy">
					一部分是给自己用的工具，一部分是做完觉得可以留下来的东西。
				</p>
			</header>

			<div className="project-index-bar">
				<span className="mono-label">INDEX / {String(projects.length).padStart(2, "0")}</span>
				<span className="mono-label">
					ACTIVE {projects.filter((project) => project.status === "active").length} / SHIPPED{" "}
					{projects.filter((project) => project.status === "shipped").length}
				</span>
			</div>

			<div className="project-cards">
				{projects.map((project, index) => (
					<ProjectCard project={project} index={index} key={project.id} />
				))}
			</div>

			<div className="projects-foot">
				<p>
					更多零散记录在 <a href={site.socials[0]?.href ?? "https://github.com/leersxie"}>GitHub</a>{" "}
					和留言板。
				</p>
				<a className="text-link" href={withBase("/guestbook/")}>
					去留言板 <ArrowUpRight aria-hidden="true" size={14} />
				</a>
			</div>
		</div>
	);
}
