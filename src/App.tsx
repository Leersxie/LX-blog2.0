import { useCallback, useEffect, useState } from "react";

import { GoogleTagManager } from "./components/analytics/GoogleTagManager";
import { SiteFooter } from "./components/layout/SiteFooter";
import { SiteHeader } from "./components/layout/SiteHeader";
import { MusicPlayer } from "./components/music/MusicPlayer";
import { SearchDialog } from "./components/search/SearchDialog";
import { AboutPage } from "./pages/AboutPage";
import { ArchivePage } from "./pages/ArchivePage";
import { ArticlePage } from "./pages/ArticlePage";
import { FeedPage } from "./pages/FeedPage";
import { FriendsPage } from "./pages/FriendsPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import type { PageData } from "./types";

function Page({ data }: { data: PageData }) {
	switch (data.kind) {
		case "home":
			return <HomePage data={data} />;
		case "archive":
			return <ArchivePage data={data} />;
		case "post":
			return <ArticlePage data={data} />;
		case "about":
			return <AboutPage data={data} />;
		case "projects":
			return <ProjectsPage data={data} />;
		case "friends":
			return <FriendsPage data={data} />;
		case "feed":
			return <FeedPage data={data} />;
		case "not-found":
			return <NotFoundPage data={data} />;
		default:
			return <NotFoundPage data={data} />;
	}
}

function isTypingTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	if (target.isContentEditable) return true;
	return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

export function App({ data }: { data: PageData }) {
	const [searchOpen, setSearchOpen] = useState(false);
	const [musicOpen, setMusicOpen] = useState(false);

	const openSearch = useCallback(() => {
		setMusicOpen(false);
		setSearchOpen(true);
	}, []);
	const closeSearch = useCallback(() => setSearchOpen(false), []);
	const openMusic = useCallback(() => {
		setSearchOpen(false);
		setMusicOpen(true);
	}, []);
	const closeMusic = useCallback(() => setMusicOpen(false), []);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (isTypingTarget(event.target)) return;
			const isSearchShortcut =
				event.key === "/" || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k");
			if (!isSearchShortcut) return;
			event.preventDefault();
			openSearch();
		};
		const onOpenSearch = () => openSearch();
		document.addEventListener("keydown", onKeyDown);
		window.addEventListener("noctilux:open-search", onOpenSearch);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("noctilux:open-search", onOpenSearch);
		};
	}, [openSearch]);

	const isIndexableContent =
		(data.kind === "post" && !data.noindex) ||
		data.kind === "about" ||
		data.kind === "friends" ||
		data.kind === "projects";

	return (
		<div className="site" data-page={data.kind}>
			<a className="skip-link" href="#main">
				跳到主要内容
			</a>
			<SiteHeader current={data.route} onSearch={openSearch} />
			<main
				id="main"
				className="site-main"
				tabIndex={-1}
				data-pagefind-body={isIndexableContent ? "true" : undefined}
			>
				<Page data={data} />
			</main>
			<SiteFooter build={data.build} onMusic={openMusic} />
			<SearchDialog open={searchOpen} onClose={closeSearch} />
			<MusicPlayer open={musicOpen} onClose={closeMusic} />
			<GoogleTagManager />
		</div>
	);
}
