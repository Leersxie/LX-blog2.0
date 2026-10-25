import type { SiteConfig } from "../types";

/**
 * The public site contract. Everything here is safe to ship to the browser.
 * Build secrets belong in .env.local / CI secrets and are read only by src/server.
 */
export const site: SiteConfig = {
	name: "Leersxie",
	title: "Leersxie · 夜航档案",
	description:
		"LX 的个人技术档案：化学、心理学、代码与一些还没想清楚的想法。",
	url: "https://leersxie.github.io",
	lang: "zh-CN",
	locale: "zh_CN",
	startDate: "2026-03-28",
	author: {
		name: "Leersxie",
		bio: "神秘高中生，总会离奇失踪。喜欢化学，对心理学感兴趣，偶尔写代码和做点东西。",
		location: "CN",
		status: "不常在线，看到消息会回。",
	},
	nav: [
		{ label: "首页", path: "/", index: "00" },
		{ label: "归档", path: "/archive/", index: "01" },
		{ label: "项目", path: "/projects/", index: "02" },
		{ label: "关于", path: "/about/", index: "03" },
		{ label: "友链", path: "/friends/", index: "04" },
	],
	socials: [
		{
			label: "GitHub",
			href: "https://github.com/leersxie",
			handle: "@leersxie",
		},
		{
			label: "Bilibili",
			href: "https://space.bilibili.com/691200956",
			handle: "691200956",
		},
		{
			label: "YouTube",
			href: "https://www.youtube.com/@%E8%90%B1%E7%87%95%E4%B9%A6%E5%88%991145",
			handle: "@萱燕书刻1145",
		},
		{
			label: "Discord",
			href: "https://discord.gg/S64Xa7rvcH",
			handle: "S64Xa7rvcH",
		},
		{
			label: "CCW",
			href: "https://www.ccw.site/student/6162bd6e7f390575815ec12c",
			handle: "LX",
		},
	],
	giscus: {
		repo: "Leersxie/Leersxie.github.io",
		repoId: "R_kgDORy5vYQ",
		category: "Announcements",
		categoryId: "DIC_kwDORy5vYc4DHE69",
		mapping: "pathname",
		reactionsEnabled: "1",
		emitMetadata: "0",
		inputPosition: "top",
		lang: "zh-CN",
	},
	gtm: {
		enabled: true,
		id: "GTM-KRX3XGVH",
	},
	meting: {
		enabled: true,
		api: "https://api.injahow.cn/meting/?server=:server&type=:type&id=:id&auth=:auth&r=:r",
		server: "netease",
		type: "playlist",
		id: "18178118678",
		webUrl: "https://music.163.com/#/playlist?id=18178118678",
	},
	license: {
		name: "CC BY-NC-SA 4.0",
		url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
	},
	buildLabel: "0.1.0",
};

export const NAV = site.nav;
export const SOCIALS = site.socials;
