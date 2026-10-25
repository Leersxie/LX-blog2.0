import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, Moon, Search, Sun, X } from "lucide-react";

import { site } from "../../config/site";
import { cx, isActivePath } from "../../lib/format";

interface SiteHeaderProps {
	current: string;
	onSearch: () => void;
}

function ThemeToggle() {
	return (
		<button
			className="icon-button theme-toggle"
			type="button"
			aria-label="切换明暗主题"
			title="切换明暗主题"
			onClick={() => {
				const root = document.documentElement;
				const next = root.dataset.theme === "light" ? "dark" : "light";
				root.dataset.theme = next;
				try {
					localStorage.setItem("noctilux-theme", next);
				} catch {
					/* storage unavailable */
				}
				window.dispatchEvent(
					new CustomEvent("noctilux:theme", { detail: next }),
				);
			}}
		>
			<Sun aria-hidden="true" className="theme-icon theme-icon-sun" size={17} />
			<Moon aria-hidden="true" className="theme-icon theme-icon-moon" size={17} />
		</button>
	);
}

export function SiteHeader({ current, onSearch }: SiteHeaderProps) {
	const [open, setOpen] = useState(false);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);

	const openSearch = () => {
		setOpen(false);
		onSearch();
	};

	useEffect(() => {
		if (!open) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const firstLink = panelRef.current?.querySelector<HTMLElement>("a, button");
		firstLink?.focus();
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setOpen(false);
				triggerRef.current?.focus();
			}
		};
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [open]);

	return (
		<header className="site-header" id="top">
			<div className="site-header__bar">
				<a className="wordmark" href="/" aria-label="Leersxie 首页">
					<span className="wordmark__mark" aria-hidden="true">
						LX
					</span>
					<span className="wordmark__text">
						<strong>Leersxie</strong>
						<span>夜航档案 / NOCTILUX</span>
					</span>
				</a>

				<nav className="desktop-nav" aria-label="主导航">
					{site.nav.map((item) => (
						<a
							key={item.path}
							className={cx(
								"nav-link",
								isActivePath(current, item.path) && "is-active",
							)}
							href={item.path}
							aria-current={isActivePath(current, item.path) ? "page" : undefined}
						>
							<span className="nav-link__index">{item.index}</span>
							{item.label}
						</a>
					))}
				</nav>

				<div className="header-actions">
					<button
						type="button"
						className="search-trigger"
						onClick={openSearch}
						aria-label="打开搜索"
					>
						<Search aria-hidden="true" size={16} />
						<span>搜索</span>
						<kbd>/</kbd>
					</button>
					<ThemeToggle />
					<button
						ref={triggerRef}
						type="button"
						className="icon-button mobile-menu-trigger"
						aria-label={open ? "关闭菜单" : "打开菜单"}
						aria-expanded={open}
						aria-controls="mobile-menu"
						onClick={() => setOpen((value) => !value)}
					>
						{open ? (
							<X aria-hidden="true" size={18} />
						) : (
							<Menu aria-hidden="true" size={18} />
						)}
					</button>
				</div>
			</div>

			{open && (
				<div className="mobile-menu" id="mobile-menu">
					<div className="mobile-menu__panel" ref={panelRef}>
						<p className="mono-label">INDEX / 00—04</p>
						<nav aria-label="移动端导航">
							{site.nav.map((item) => (
								<a
									key={item.path}
									href={item.path}
									className={cx(
										"mobile-nav-link",
										isActivePath(current, item.path) && "is-active",
									)}
								>
									<span className="mono-label">{item.index}</span>
									<span>{item.label}</span>
									<ArrowUpRight aria-hidden="true" size={18} />
								</a>
							))}
						</nav>
						<div className="mobile-menu__footer">
							<button type="button" className="text-button" onClick={openSearch}>
								搜索档案 <Search aria-hidden="true" size={14} />
							</button>
							<div className="mobile-menu__socials">
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
					<button
						type="button"
						className="mobile-menu__backdrop"
						aria-label="关闭菜单"
						onClick={() => setOpen(false)}
					/>
				</div>
			)}
		</header>
	);
}
