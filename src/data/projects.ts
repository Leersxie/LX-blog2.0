import type { Project } from "../types";

export const projectsData: Project[] = [
	{
		id: "yesimbot-memory-panel",
		title: "YesImBot 记忆面板",
		description:
			"给 YesImBot 做的记忆可视化面板：核心人格、三级记忆（工作 / 语义 / 日记）、记忆体检、注入联调与行为学习。以 Koishi 控制台内嵌页呈现，用来排查「它为什么这样回答」。",
		category: "工具 / 机器人",
		tags: ["Koishi", "QQ 机器人", "LLM"],
		stack: ["TypeScript", "Koishi", "SQLite"],
		status: "active",
		year: "2026",
		source:
			"https://github.com/Leersxie/koishi-plugin-yesimbot-memory-panel",
	},
	{
		id: "yesimbot-behavior-learner",
		title: "YesImBot 行为学习器",
		description:
			"定时从日常对话里提炼「值得长期学习」的行为偏好，私聊推送候选、逐条确认后才写入行为文档。带自动备份、相似度去重与外部改动检测，绝不自动改写人格文件。",
		category: "工具 / 机器人",
		tags: ["Koishi", "QQ 机器人", "Agent"],
		stack: ["TypeScript", "Koishi", "LLM"],
		status: "shipped",
		year: "2026",
		source:
			"https://github.com/Leersxie/koishi-plugin-yesimbot-behavior-learner",
	},
	{
		id: "yesimbot-livingdiary",
		title: "YesImBot 生活日记扩展",
		description:
			"YesImBot 扩展：让机器人自动记录并发布 QQ 空间日记，支持读写空间动态与自动互动。",
		category: "工具 / 机器人",
		tags: ["Koishi", "QQ 空间"],
		stack: ["TypeScript", "Koishi"],
		status: "shipped",
		year: "2026",
		source:
			"https://github.com/Leersxie/koishi-plugin-yesimbot-livingdiary",
	},
	{
		id: "yesimbot-discord-reaction",
		title: "YesImBot Discord 表情回应",
		description: "YesImBot 扩展：为 Discord 消息自动添加表情回应。自用插件。",
		category: "工具 / 机器人",
		tags: ["Koishi", "Discord"],
		stack: ["Koishi", "Discord"],
		status: "shipped",
		year: "2026",
		source:
			"https://github.com/Leersxie/koishi-plugin-yesimbot-extension-discord-reaction",
	},
	{
		id: "waveform-maker-v3-cn",
		title: "音频波形生成器 v3 中文化",
		description:
			"无扩展即可把音频转成可视化波形的在线工具，可输出波形数据（txt）或 Scratch 的 .sb3 记录。此仓库为其汉化与修改版。",
		category: "Web / 音频",
		tags: ["汉化", "音频可视化", "Web"],
		stack: ["JavaScript", "Web Audio API"],
		status: "shipped",
		year: "2026",
		href: "https://leersxie.github.io/Audio-Spectrum-Maker-v3-CN/",
		source: "https://github.com/Leersxie/Audio-Spectrum-Maker-v3-CN",
		image: "/waveform-gen-v3.webp",
	},
	{
		id: "waveform-gen-v2-cn",
		title: "波形生成器 v2 中文化",
		description:
			"高性能波形生成器 v2 的汉化与修改版，面向中文用户，可录制并导出波形数据。",
		category: "Web / 音频",
		tags: ["汉化", "音频可视化", "Web"],
		stack: ["HTML", "JavaScript", "Web Audio API"],
		status: "shipped",
		year: "2025",
		href: "https://leersxie.github.io/AudioSpectrum-CN/",
		source: "https://github.com/Leersxie/AudioSpectrum-CN",
		image: "/waveform-gen-v2.webp",
	},
	{
		id: "noctilux",
		title: "本站：夜航档案",
		description:
			"个人档案与长文阅读站。React + TypeScript + Vite 全静态生成，保留旧 URL、搜索、加密文章、评论与音乐，视觉系统重做。",
		category: "Web / 个人站",
		tags: ["博客", "设计系统", "SSG"],
		stack: ["React", "TypeScript", "Vite", "Pagefind"],
		status: "active",
		year: "2026",
		href: "/",
	},
];
