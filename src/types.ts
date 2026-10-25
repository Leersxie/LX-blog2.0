export interface NavItem {
	label: string;
	path: string;
	index: string;
}

export interface SocialLink {
	label: string;
	href: string;
	handle: string;
}

export interface GiscusConfig {
	repo: string;
	repoId: string;
	category: string;
	categoryId: string;
	mapping: "pathname" | "url" | "title" | "og:title" | "specific" | "number";
	reactionsEnabled: "0" | "1";
	emitMetadata: "0" | "1";
	inputPosition: "top" | "bottom";
	lang: string;
}

export interface GtmConfig {
	enabled: boolean;
	id: string;
}

export interface MetingConfig {
	enabled: boolean;
	api: string;
	server: string;
	type: string;
	id: string;
	webUrl: string;
}

export interface SiteConfig {
	name: string;
	title: string;
	description: string;
	url: string;
	lang: string;
	locale: string;
	startDate: string;
	author: {
		name: string;
		bio: string;
		location: string;
		status: string;
	};
	nav: NavItem[];
	socials: SocialLink[];
	giscus: GiscusConfig;
	gtm: GtmConfig;
	meting: MetingConfig;
	license: {
		name: string;
		url: string;
	};
	buildLabel: string;
}

export interface TocHeading {
	id: string;
	text: string;
	level: 2 | 3;
}

export interface PostSummary {
	id: string;
	title: string;
	description: string;
	published: string;
	updated?: string;
	category: string;
	tags: string[];
	pinned: boolean;
	encrypted: boolean;
	wordCount: number;
	readingMinutes: number;
	cover?: string;
	ogImage?: string;
	url: string;
	canonicalPath: string;
	isCopy: boolean;
	comment: boolean;
	lang: string;
}

export interface EncryptedPayload {
	v: 1;
	alg: "AES-256-GCM";
	iter: number;
	salt: string;
	iv: string;
	ct: string;
	tag: string;
}

export interface ArticleData extends PostSummary {
	html?: string;
	ciphertext?: EncryptedPayload;
	headings: TocHeading[];
	passwordHint?: string;
}

export interface Project {
	id: string;
	title: string;
	description: string;
	category: string;
	tags: string[];
	status: "active" | "shipped" | "archived";
	year: string;
	href?: string;
	source?: string;
	image?: string;
	stack: string[];
}

export interface Friend {
	id: number;
	title: string;
	imgurl: string;
	desc: string;
	siteurl: string;
	tags: string[];
}

export interface ArchiveData {
	tags: string[];
	categories: string[];
}

export interface BuildInfo {
	version: string;
	builtAt: string;
	pageCount: number;
	publishedCount: number;
}

export type PageKind =
	| "home"
	| "archive"
	| "post"
	| "about"
	| "projects"
	| "friends"
	| "feed"
	| "not-found";

export interface PageData {
	kind: PageKind;
	route: string;
	title: string;
	description: string;
	noindex: boolean;
	build: BuildInfo;
	posts: PostSummary[];
	post?: ArticleData;
	prevPost?: PostSummary;
	nextPost?: PostSummary;
	archive?: ArchiveData;
	projects?: Project[];
	friends?: Friend[];
	pageHtml?: string;
	feed?: "rss" | "atom";
}

export interface SeoData {
	title: string;
	description: string;
	canonical: string;
	ogImage: string;
	ogType: "website" | "article";
	noindex: boolean;
	publishedAt?: string;
	updatedAt?: string;
	jsonLd: Record<string, unknown>[];
}

export interface RenderedPage {
	route: string;
	output: string;
	html: string;
	data: PageData;
	seo: SeoData;
}

export interface PagefindResultData {
	url: string;
	excerpt: string;
	meta: {
		title?: string;
		category?: string;
		date?: string;
	};
}
