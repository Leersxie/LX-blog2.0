import { ArrowUpRight, Link2 } from "lucide-react";

import { ArticleBody } from "../components/article/ArticleBody";
import type { Friend, PageData } from "../types";

interface FriendsPageProps {
	data: PageData;
}

function FriendCard({ friend }: { friend: Friend }) {
	return (
		<a
			className="friend-card"
			href={friend.siteurl}
			target="_blank"
			rel="noopener noreferrer"
		>
			<div className="friend-card__avatar">
				<span aria-hidden="true">{friend.title.slice(0, 1).toUpperCase()}</span>
				<img
					src={friend.imgurl}
					alt=""
					loading="lazy"
					referrerPolicy="no-referrer"
					onError={(event) => {
						event.currentTarget.style.display = "none";
					}}
				/>
			</div>
			<div className="friend-card__body">
				<div className="friend-card__title">
					<strong>{friend.title}</strong>
					<ArrowUpRight aria-hidden="true" size={15} />
				</div>
				<p>{friend.desc}</p>
				<div className="friend-card__tags">
					{friend.tags.map((tag) => (
						<span key={tag}>{tag}</span>
					))}
				</div>
			</div>
		</a>
	);
}

export function FriendsPage({ data }: FriendsPageProps) {
	const friends = data.friends ?? [];
	return (
		<div className="page friends-page">
			<header className="page-intro">
				<div>
					<p className="eyebrow">
						<span className="signal-dot" aria-hidden="true" />
						LINKS / 04
					</p>
					<h1 data-pagefind-meta="title">友链</h1>
				</div>
				<p className="page-intro__copy">
					常逛的站点和顺手的工具，也算一份公开书签。想交换友链，去留言板说一声。
				</p>
			</header>

			<div className="friends-layout">
				<div className="friends-grid">
					{friends.map((friend) => (
						<FriendCard friend={friend} key={friend.id} />
					))}
				</div>
				<aside className="friends-side">
					<div className="friends-intro">
						<p className="mono-label">EXCHANGE</p>
						<h2>交换友链</h2>
						<p>
							留下站名、链接、一句话简介和头像地址即可。没有主题限制，但希望站点是认真维护的。
						</p>
						<a className="button button--solid" href="/guestbook/">
							<Link2 aria-hidden="true" size={15} /> 去留言板
						</a>
					</div>
					{data.pageHtml ? (
						<div className="friends-note">
							<ArticleBody html={data.pageHtml} />
						</div>
					) : null}
				</aside>
			</div>

			<p className="friends-foot mono-label">
				{String(friends.length).padStart(2, "0")} LINKS / ORDER IS STABLE
			</p>
		</div>
	);
}
