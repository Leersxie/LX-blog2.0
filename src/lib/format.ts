export function formatDate(iso: string): string {
	const [year, month, day] = iso.split("-");
	if (!year || !month || !day) return iso;
	return `${year}.${month}.${day}`;
}

export function formatDateZh(iso: string): string {
	const [year, month, day] = iso.split("-");
	if (!year || !month || !day) return iso;
	return `${year} 年 ${Number(month)} 月 ${Number(day)} 日`;
}

export function formatMonth(iso: string): string {
	const [, month] = iso.split("-");
	return month ?? "01";
}

export function formatBuildDate(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return iso;
	return new Intl.DateTimeFormat("zh-CN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
		timeZone: "Asia/Shanghai",
	}).format(date);
}

export function readingLabel(minutes: number): string {
	return `${minutes} 分钟`;
}

export function cx(...values: Array<string | false | null | undefined>): string {
	return values.filter(Boolean).join(" ");
}

export function isActivePath(current: string, target: string): boolean {
	if (target === "/") return current === "/";
	if (target === "/archive/") {
		return (
			current === "/archive/" ||
			current.startsWith("/posts/") ||
			current === "/guestbook/"
		);
	}
	return current === target || current.startsWith(`${target}`);
}

export function categoryClassName(category: string): string {
	return `cat-${category.replace(/[^\p{L}\p{N}]/gu, "") || "other"}`;
}
