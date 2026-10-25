import {
	useEffect,
	useId,
	useRef,
	useState,
	type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { ArrowUpRight, Loader2, Search, X } from "lucide-react";

import { withBase } from "../../lib/url";
import type { PagefindResultData } from "../../types";

interface PagefindModule {
	init: () => Promise<void>;
	search: (query: string) => Promise<{
		results: Array<{ data: () => Promise<PagefindResultData> }>;
	}>;
}

interface SearchDialogProps {
	open: boolean;
	onClose: () => void;
}

function loadPagefind(): Promise<PagefindModule> {
	const pagefindUrl = withBase("/pagefind/pagefind.js");
	return import(/* @vite-ignore */ pagefindUrl).then(async (module) => {
		const pagefind = module as unknown as PagefindModule;
		await pagefind.init();
		return pagefind;
	});
}

export function SearchDialog({ open, onClose }: SearchDialogProps) {
	const titleId = useId();
	const inputId = useId();
	const listId = useId();
	const panelRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const returnFocusRef = useRef<HTMLElement | null>(null);
	const pagefindRef = useRef<PagefindModule | null>(null);
	const requestRef = useRef(0);
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<PagefindResultData[]>([]);
	const [active, setActive] = useState(-1);
	const [state, setState] = useState<"idle" | "loading" | "ready" | "error">(
		"idle",
	);
	const [message, setMessage] = useState("");

	useEffect(() => {
		if (!open) return;
		const previous = document.activeElement;
		returnFocusRef.current =
			previous instanceof HTMLElement && previous !== document.body
				? previous
				: document.querySelector<HTMLElement>(".search-trigger");
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
		return () => {
			window.clearTimeout(timer);
			document.body.style.overflow = previousOverflow;
		};
	}, [open]);

	useEffect(() => {
		if (!open) {
			setQuery("");
			setResults([]);
			setActive(-1);
			setState("idle");
			setMessage("");
		}
	}, [open]);

	useEffect(() => {
		if (!open) return;
		const trimmed = query.trim();
		if (!trimmed) {
			setResults([]);
			setState("idle");
			setMessage("");
			return;
		}
		const requestId = ++requestRef.current;
		setState("loading");
		const timer = window.setTimeout(async () => {
			try {
				if (!pagefindRef.current) {
					pagefindRef.current = await loadPagefind();
				}
				const response = await pagefindRef.current.search(trimmed);
				const data = await Promise.all(
					response.results.slice(0, 8).map((result) => result.data()),
				);
				if (requestRef.current !== requestId) return;
				setResults(data);
				setActive(data.length > 0 ? 0 : -1);
				setState("ready");
				setMessage(data.length === 0 ? "没有匹配的档案。" : "");
			} catch {
				if (requestRef.current !== requestId) return;
				setResults([]);
				setState("error");
				setMessage("搜索索引尚未生成。请先运行 pnpm build 并用 pnpm preview 预览。");
			}
		}, 160);
		return () => window.clearTimeout(timer);
	}, [query, open]);

	const close = () => {
		const target = returnFocusRef.current;
		onClose();
		window.setTimeout(() => target?.focus(), 0);
	};

	const focusables = () => {
		const panel = panelRef.current;
		if (!panel) return [];
		return Array.from(
			panel.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
			),
		).filter((element) => element.offsetParent !== null);
	};

	const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
		if (event.key === "Escape") {
			event.preventDefault();
			close();
			return;
		}
		if (event.key === "Tab") {
			const elements = focusables();
			if (elements.length === 0) return;
			const first = elements[0];
			const last = elements[elements.length - 1];
			if (!first || !last) return;
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
			return;
		}
		if (results.length === 0) return;
		if (event.key === "ArrowDown") {
			event.preventDefault();
			setActive((index) => (index + 1) % results.length);
		}
		if (event.key === "ArrowUp") {
			event.preventDefault();
			setActive((index) => (index <= 0 ? results.length - 1 : index - 1));
		}
		if (event.key === "Enter" && active >= 0) {
			const target = results[active];
			if (target) {
				event.preventDefault();
				window.location.assign(withBase(target.url));
			}
		}
	};

	if (!open) return null;

	return (
		<div className="search-layer" role="presentation">
			<button
				type="button"
				className="search-backdrop"
				aria-label="关闭搜索"
				onClick={close}
			/>
			<div
				className="search-dialog"
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				ref={panelRef}
				onKeyDown={onKeyDown}
			>
				<div className="search-dialog__head">
					<div>
						<p className="mono-label">FIND / ARCHIVE</p>
						<h2 id={titleId}>搜索档案</h2>
					</div>
					<button
						type="button"
						className="icon-button"
						onClick={close}
						aria-label="关闭搜索"
					>
						<X aria-hidden="true" size={18} />
					</button>
				</div>

				<label className="search-field" htmlFor={inputId}>
					<Search aria-hidden="true" size={18} />
					<input
						ref={inputRef}
						id={inputId}
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="输入标题、正文或标签"
						autoComplete="off"
						spellCheck={false}
						role="combobox"
						aria-autocomplete="list"
						aria-expanded={results.length > 0}
						aria-controls={listId}
						aria-activedescendant={
							active >= 0 ? `search-result-${active}` : undefined
						}
					/>
					{state === "loading" && (
						<Loader2 className="spin" aria-label="正在搜索" size={17} />
					)}
				</label>

				<div className="search-hint mono-label" aria-hidden="true">
					<span>↑ ↓ 选择</span>
					<span>ENTER 打开</span>
					<span>ESC 关闭</span>
				</div>

				<div
					className="search-results"
					id={listId}
					role="listbox"
					aria-label="搜索结果"
				>
					{state === "idle" && (
						<p className="search-empty">
							输入关键词开始检索。索引由 Pagefind 在构建阶段生成。
						</p>
					)}
					{state === "error" && <p className="search-empty is-error">{message}</p>}
					{state === "ready" && message && (
						<p className="search-empty">{message}</p>
					)}
					{results.map((result, index) => (
						<a
							key={withBase(result.url)}
							id={`search-result-${index}`}
							className={`search-result${index === active ? " is-active" : ""}`}
							href={withBase(result.url)}
							role="option"
							aria-selected={index === active}
							onMouseEnter={() => setActive(index)}
							onFocus={() => setActive(index)}
						>
							<span className="search-result__index mono-label">
								{String(index + 1).padStart(2, "0")}
							</span>
							<span className="search-result__body">
								<strong>{result.meta.title ?? result.url}</strong>
								{(result.meta.category || result.meta.date) && (
									<span className="search-result__meta mono-label">
										{[result.meta.category, result.meta.date]
											.filter(Boolean)
											.join(" / ")}
									</span>
								)}
								<span
									className="search-result__excerpt"
									dangerouslySetInnerHTML={{ __html: result.excerpt }}
								/>
								<span className="search-result__url mono-label">
									{withBase(result.url)}
								</span>
							</span>
							<ArrowUpRight aria-hidden="true" size={16} />
						</a>
					))}
				</div>

				<p className="sr-only" aria-live="polite">
					{state === "ready" ? `${results.length} 条结果` : message}
				</p>
			</div>
		</div>
	);
}
