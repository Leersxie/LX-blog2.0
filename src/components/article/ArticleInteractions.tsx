import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

interface LightboxItem {
	src: string;
	alt: string;
}

const LIGHTBOX_SELECTOR = "[data-lightbox-src]";

function collectItems(): LightboxItem[] {
	const seen = new Set<string>();
	const items: LightboxItem[] = [];
	for (const node of document.querySelectorAll<HTMLElement>(
		`${LIGHTBOX_SELECTOR}, .noctilux-prose img`,
	)) {
		const image = node instanceof HTMLImageElement ? node : null;
		const src =
			node.getAttribute("data-lightbox-src") ??
			image?.currentSrc ??
			image?.getAttribute("src") ??
			"";
		if (!src || seen.has(src)) continue;
		seen.add(src);
		items.push({
			src,
			alt:
				node.getAttribute("data-lightbox-alt") ??
				image?.getAttribute("alt") ??
				"",
		});
	}
	return items;
}

async function copyText(value: string): Promise<boolean> {
	try {
		if (navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(value);
			return true;
		}
	} catch {
		// Fall through to the legacy path for non-secure contexts.
	}
	const area = document.createElement("textarea");
	area.value = value;
	area.setAttribute("readonly", "");
	area.style.position = "fixed";
	area.style.opacity = "0";
	document.body.append(area);
	area.select();
	const copied = document.execCommand("copy");
	area.remove();
	return copied;
}

export function ArticleInteractions() {
	const [items, setItems] = useState<LightboxItem[]>([]);
	const [activeIndex, setActiveIndex] = useState(-1);
	const dialogRef = useRef<HTMLDivElement>(null);
	const closeRef = useRef<HTMLButtonElement>(null);
	const lastFocusRef = useRef<HTMLElement | null>(null);
	const copyTimers = useRef(new Map<HTMLElement, number>());

	const close = useCallback(() => {
		setActiveIndex(-1);
		const target = lastFocusRef.current;
		target?.focus();
		window.setTimeout(() => target?.focus(), 0);
	}, []);

	const open = useCallback((src: string, trigger?: HTMLElement | null) => {
		const next = collectItems();
		const index = next.findIndex((item) => item.src === src);
		if (index < 0) return;
		lastFocusRef.current =
			trigger ??
			(document.activeElement instanceof HTMLElement
				? document.activeElement
				: null);
		setItems(next);
		setActiveIndex(index);
	}, []);

	useEffect(() => {
		const timers = copyTimers.current;
		const decorate = () => {
			for (const image of document.querySelectorAll<HTMLImageElement>(
				".noctilux-prose img",
			)) {
				if (!image.alt) continue;
				const src = image.currentSrc || image.getAttribute("src") || "";
				if (!src) continue;
				image.dataset.lightboxSrc = src;
				image.dataset.lightboxAlt = image.alt;
				image.tabIndex = 0;
				image.setAttribute("role", "button");
				image.setAttribute("aria-label", `查看图片：${image.alt}`);
				image.classList.add("article-image");
			}
		};
		decorate();
		const observer = new MutationObserver(decorate);
		observer.observe(document.body, { childList: true, subtree: true });

		const onDocumentClick = (event: MouseEvent) => {
			if (dialogRef.current) return;
			const target = (event.target as Element | null)?.closest<HTMLElement>(
				LIGHTBOX_SELECTOR,
			);
			if (!target) return;
			event.preventDefault();
			open(target.dataset.lightboxSrc ?? "", target);
		};
		const onDocumentKeyDown = (event: KeyboardEvent) => {
			if (dialogRef.current) return;
			const target = event.target as HTMLElement | null;
			if (
				target &&
				(target.tagName === "IMG" || target.tagName === "BUTTON") &&
				target.dataset.lightboxSrc &&
				(event.key === "Enter" || event.key === " ")
			) {
				event.preventDefault();
				open(target.dataset.lightboxSrc, target);
			}
		};
		const onCodeCopy = async (event: MouseEvent) => {
			const button = (event.target as Element | null)?.closest<HTMLButtonElement>(
				"[data-code-copy]",
			);
			if (!button) return;
			const frame = button.closest(".code-frame");
			const code = frame?.querySelector("pre code");
			if (!code) return;
			const original = button.textContent ?? "复制";
			const ok = await copyText(code.textContent ?? "");
			button.textContent = ok ? "已复制" : "复制失败";
			button.dataset.state = ok ? "copied" : "error";
			button.setAttribute("aria-label", ok ? "代码已复制" : "复制失败");
			const previous = timers.get(button);
			if (previous) window.clearTimeout(previous);
			const timer = window.setTimeout(() => {
				button.textContent = original;
				delete button.dataset.state;
				button.setAttribute("aria-label", "复制代码");
				timers.delete(button);
			}, 1800);
			timers.set(button, timer);
		};

		document.addEventListener("click", onDocumentClick);
		document.addEventListener("keydown", onDocumentKeyDown);
		document.addEventListener("click", onCodeCopy);
		return () => {
			observer.disconnect();
			document.removeEventListener("click", onDocumentClick);
			document.removeEventListener("keydown", onDocumentKeyDown);
			document.removeEventListener("click", onCodeCopy);
			for (const timer of timers.values()) {
				window.clearTimeout(timer);
			}
			timers.clear();
		};
	}, [open]);

	useEffect(() => {
		if (activeIndex < 0) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		window.setTimeout(() => closeRef.current?.focus(), 0);

		const onKeyDown = (event: KeyboardEvent) => {
			const dialog = dialogRef.current;
			if (!dialog) return;
			if (event.key === "Escape") {
				event.preventDefault();
				close();
				return;
			}
			if (event.key === "ArrowLeft" && items.length > 1) {
				event.preventDefault();
				setActiveIndex((value) => (value - 1 + items.length) % items.length);
				return;
			}
			if (event.key === "ArrowRight" && items.length > 1) {
				event.preventDefault();
				setActiveIndex((value) => (value + 1) % items.length);
				return;
			}
			if (event.key !== "Tab") return;
			const focusable = Array.from(
				dialog.querySelectorAll<HTMLElement>(
					'button, [href], [tabindex]:not([tabindex="-1"])',
				),
			).filter((element) => !element.hasAttribute("disabled"));
			if (focusable.length === 0) return;
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			if (!first || !last) return;
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.body.style.overflow = previousOverflow;
		};
	}, [activeIndex, close, items.length]);

	const current = activeIndex >= 0 ? items[activeIndex] : undefined;

	return (
		<>
			{current && (
				<div
					className="lightbox"
					role="dialog"
					aria-modal="true"
					aria-label="图片预览"
					ref={dialogRef}
					onMouseDown={(event) => {
						if (event.target === event.currentTarget) close();
					}}
				>
					<div className="lightbox__frame">
						<div className="lightbox__bar">
							<span className="mono-label">IMAGE / PREVIEW</span>
							<button
								ref={closeRef}
								type="button"
								className="lightbox__close"
								onClick={close}
								aria-label="关闭图片预览"
							>
								<X aria-hidden="true" size={18} />
							</button>
						</div>
						<div className="lightbox__stage">
							<img src={current.src} alt={current.alt} />
						</div>
						<div className="lightbox__foot">
							<p>{current.alt || "图片预览"}</p>
							<span className="mono-label">
								{String(activeIndex + 1).padStart(2, "0")} /{" "}
								{String(items.length).padStart(2, "0")}
							</span>
						</div>
						{items.length > 1 && (
							<div className="lightbox__nav">
								<button
									type="button"
									className="icon-button"
									aria-label="上一张图片"
									onClick={() =>
										setActiveIndex(
											(value) => (value - 1 + items.length) % items.length,
										)
									}
								>
									<ArrowLeft aria-hidden="true" size={17} />
								</button>
								<button
									type="button"
									className="icon-button"
									aria-label="下一张图片"
									onClick={() =>
										setActiveIndex((value) => (value + 1) % items.length)
									}
								>
									<ArrowRight aria-hidden="true" size={17} />
								</button>
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
}
