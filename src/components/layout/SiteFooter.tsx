import { ArrowUp, Music2, Rss } from "lucide-react";

import { site } from "../../config/site";
import { formatBuildDate } from "../../lib/format";
import { withBase } from "../../lib/url";
import type { BuildInfo } from "../../types";
import { MotionToggle } from "./MotionToggle";

interface SiteFooterProps {
	build: BuildInfo;
	onMusic: () => void;
}

export function SiteFooter({ build, onMusic }: SiteFooterProps) {
	return (
		<footer className="site-footer" data-pagefind-ignore>
			<div className="site-footer__top">
				<div className="footer-anchor">
					<p className="mono-label">END OF INDEX / 继续翻阅</p>
					<p className="footer-anchor__line">
						这里没有信息流，只有一条按时间排好的索引。
					</p>
					<a className="arrow-link" href={withBase("/archive/")}>
						打开归档 <ArrowUp aria-hidden="true" size={15} />
					</a>
				</div>
				<div className="footer-columns">
					<div>
						<p className="mono-label">PAGES</p>
						{site.nav.slice(1).map((item) => (
							<a key={item.path} href={withBase(item.path)}>
								{item.label}
							</a>
						))}
					</div>
					<div>
						<p className="mono-label">FEEDS</p>
						<a href={withBase("/rss.xml")}>
							RSS <Rss aria-hidden="true" size={13} />
						</a>
						<a href={withBase("/atom.xml")}>Atom</a>
						<a href={withBase("/sitemap.xml")}>Sitemap</a>
					</div>
					<div>
						<p className="mono-label">ELSEWHERE</p>
						{site.socials.map((social) => (
							<a
								key={social.href}
								href={social.href}
								target="_blank"
								rel="noopener noreferrer"
							>
								{social.label}
							</a>
						))}
					</div>
				</div>
			</div>

			<div className="site-footer__meta">
				<p>
					© 2026 Leersxie · 内容按 {site.license.name} 授权 ·{" "}
					<a href={site.license.url} target="_blank" rel="noopener noreferrer">
						license
					</a>
				</p>
				<p>
					BUILD {build.version} / {formatBuildDate(build.builtAt)} /{" "}
					{build.publishedCount} PUBLISHED
				</p>
			</div>

			<div className="site-footer__service">
				<button type="button" className="footer-music" onClick={onMusic}>
					<Music2 aria-hidden="true" size={14} />
					歌单 / Meting
				</button>
				<MotionToggle />
				<p>
					评论由 Giscus 提供；统计由 Google Tag Manager 延迟加载；音乐来自 Meting
					公共 API。
				</p>
				<a href="#top" className="footer-top">
					回到顶部 <ArrowUp aria-hidden="true" size={13} />
				</a>
			</div>
		</footer>
	);
}
