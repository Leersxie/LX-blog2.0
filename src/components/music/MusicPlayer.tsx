import { useEffect, useRef, useState } from "react";
import {
	ChevronDown,
	Disc3,
	Loader2,
	Music2,
	Pause,
	Play,
	SkipBack,
	SkipForward,
	Volume2,
	VolumeX,
	X,
} from "lucide-react";

import { site } from "../../config/site";

interface MetingTrack {
	name: string;
	artist: string;
	url: string;
	pic: string;
	lrc: string;
}

interface MusicPlayerProps {
	open: boolean;
	onClose: () => void;
}

function buildPlaylistUrl(): string {
	const random = Date.now().toString();
	return site.meting.api
		.replace(":server", site.meting.server)
		.replace(":type", site.meting.type)
		.replace(":id", site.meting.id)
		.replace(":auth", "")
		.replace(":r", random);
}

function formatTime(value: number): string {
	if (!Number.isFinite(value) || value <= 0) return "0:00";
	const minutes = Math.floor(value / 60);
	const seconds = Math.floor(value % 60)
		.toString()
		.padStart(2, "0");
	return `${minutes}:${seconds}`;
}

export function MusicPlayer({ open, onClose }: MusicPlayerProps) {
	const dialogRef = useRef<HTMLDivElement>(null);
	const audioRef = useRef<HTMLAudioElement>(null);
	const returnFocusRef = useRef<HTMLElement | null>(null);
	const shouldPlayRef = useRef(false);
	const [tracks, setTracks] = useState<MetingTrack[]>([]);
	const [index, setIndex] = useState(0);
	const [attempt, setAttempt] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [playing, setPlaying] = useState(false);
	const [duration, setDuration] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);
	const [muted, setMuted] = useState(false);

	const current = tracks[index];

	useEffect(() => {
		if (!open) return;
		returnFocusRef.current = document.activeElement as HTMLElement | null;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const timer = window.setTimeout(() => {
			dialogRef.current
				?.querySelector<HTMLElement>("button, [href], input")
				?.focus();
		}, 30);
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};
		document.addEventListener("keydown", onKey);
		return () => {
			window.clearTimeout(timer);
			document.body.style.overflow = previousOverflow;
			document.removeEventListener("keydown", onKey);
			returnFocusRef.current?.focus();
		};
	}, [open, onClose]);

	useEffect(() => {
		if (!open || tracks.length > 0) return;
		if (!site.meting.enabled) {
			setError("音乐播放器未启用。");
			return;
		}
		let timedOut = false;
		const controller = new AbortController();
		const timeout = window.setTimeout(() => {
			timedOut = true;
			controller.abort();
		}, 12_000);
		setLoading(true);
		setError("");
		fetch(buildPlaylistUrl(), {
			headers: { Accept: "application/json" },
			signal: controller.signal,
		})
			.then(async (response) => {
				if (!response.ok) throw new Error(`HTTP ${response.status}`);
				const payload: unknown = await response.json();
				if (!Array.isArray(payload)) throw new Error("歌单格式异常");
				const next = payload
					.filter(
						(item): item is MetingTrack =>
							typeof item === "object" &&
							item !== null &&
							typeof (item as MetingTrack).url === "string" &&
							typeof (item as MetingTrack).name === "string",
					)
					.map((item) => ({
						name: item.name,
						artist: item.artist || "未知艺术家",
						url: item.url,
						pic: item.pic || "",
						lrc: item.lrc || "",
					}));
				setTracks(next);
				if (next.length === 0) setError("歌单为空。");
			})
			.catch(() => {
				if (controller.signal.aborted && !timedOut) return;
				setError(
					timedOut
						? "Meting 公共 API 在当前网络不可达。"
						: "Meting 歌单暂时不可用。",
				);
			})
			.finally(() => {
				window.clearTimeout(timeout);
				setLoading(false);
			});
		return () => {
			window.clearTimeout(timeout);
			controller.abort();
		};
	}, [open, attempt, tracks.length]);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio || !current) return;
		audio.src = current.url;
		audio.load();
		setCurrentTime(0);
		setDuration(0);
		if (shouldPlayRef.current) {
			void audio.play().catch(() => {
				setError("浏览器阻止了播放，请再点一次播放。");
				setPlaying(false);
			});
		}
	}, [current]);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;
		audio.muted = muted;
	}, [muted]);

	const play = async () => {
		const audio = audioRef.current;
		if (!audio || !current) return;
		try {
			await audio.play();
		} catch {
			setError("这首歌暂时无法播放。");
		}
	};

	const togglePlay = () => {
		const audio = audioRef.current;
		if (!audio) return;
		if (audio.paused) {
			void play();
		} else {
			audio.pause();
		}
	};

	const changeTrack = (nextIndex: number, autoplay = shouldPlayRef.current) => {
		if (tracks.length === 0) return;
		shouldPlayRef.current = autoplay;
		setIndex((nextIndex + tracks.length) % tracks.length);
	};

	const playTrack = (nextIndex: number) => {
		shouldPlayRef.current = true;
		setIndex(nextIndex);
		if (nextIndex === index) void play();
	};

	if (!open) return null;

	return (
		<div className="music-layer" role="presentation">
			<button
				type="button"
				className="music-backdrop"
				aria-label="关闭音乐播放器"
				onClick={onClose}
			/>
			<div
				className="music-panel"
				role="dialog"
				aria-modal="true"
				aria-label="音乐播放器"
				ref={dialogRef}
			>
				<header className="music-panel__head">
					<div>
						<p className="mono-label">AUDIO / METING</p>
						<h2>歌单</h2>
					</div>
					<button
						type="button"
						className="icon-button"
						onClick={onClose}
						aria-label="关闭音乐播放器"
					>
						<X aria-hidden="true" size={18} />
					</button>
				</header>

				{loading && (
					<div className="music-state">
						<Loader2 aria-hidden="true" className="spin" size={18} />
						正在读取歌单…
					</div>
				)}
				{error && (
					<div className="music-state is-error" role="alert">
						<span>{error}</span>
						<button
							type="button"
							className="clear-filter"
							onClick={() => {
								setError("");
								setAttempt((value) => value + 1);
							}}
						>
							重试
						</button>
						<a
							href={site.meting.webUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="clear-filter"
						>
							直接打开网易云歌单
						</a>
					</div>
				)}

				{current ? (
					<>
						<div className="now-playing">
							<div className="now-playing__cover">
								{current.pic ? (
									<img
										src={current.pic}
										alt=""
										loading="lazy"
										referrerPolicy="no-referrer"
									/>
								) : (
									<Disc3 aria-hidden="true" size={28} />
								)}
							</div>
							<div className="now-playing__meta">
								<p className="now-playing__name">{current.name}</p>
								<p className="now-playing__artist">{current.artist}</p>
							</div>
						</div>

						<audio
							ref={audioRef}
							preload="none"
							onPlay={() => setPlaying(true)}
							onPause={() => setPlaying(false)}
							onEnded={() => changeTrack(index + 1, true)}
							onTimeUpdate={(event) =>
								setCurrentTime(event.currentTarget.currentTime)
							}
							onLoadedMetadata={(event) =>
								setDuration(event.currentTarget.duration)
							}
							onError={() => {
								if (current) setError("音频加载失败，尝试下一首。");
							}}
						/>

						<div className="music-progress">
							<input
								type="range"
								min={0}
								max={duration || 0}
								step={0.1}
								value={Math.min(currentTime, duration || 0)}
								onChange={(event) => {
									const audio = audioRef.current;
									if (!audio) return;
									audio.currentTime = Number(event.target.value);
									setCurrentTime(audio.currentTime);
								}}
								aria-label="播放进度"
							/>
							<div className="music-progress__time mono-label">
								<span>{formatTime(currentTime)}</span>
								<span>{formatTime(duration)}</span>
							</div>
						</div>

						<div className="music-controls">
							<button
								type="button"
								className="icon-button"
								onClick={() => changeTrack(index - 1)}
								aria-label="上一首"
							>
								<SkipBack aria-hidden="true" size={17} />
							</button>
							<button
								type="button"
								className="music-play"
								onClick={togglePlay}
								aria-label={playing ? "暂停" : "播放"}
							>
								{playing ? (
									<Pause aria-hidden="true" size={18} />
								) : (
									<Play aria-hidden="true" size={18} />
								)}
							</button>
							<button
								type="button"
								className="icon-button"
								onClick={() => changeTrack(index + 1)}
								aria-label="下一首"
							>
								<SkipForward aria-hidden="true" size={17} />
							</button>
							<button
								type="button"
								className="icon-button"
								onClick={() => setMuted((value) => !value)}
								aria-label={muted ? "取消静音" : "静音"}
								aria-pressed={muted}
							>
								{muted ? (
									<VolumeX aria-hidden="true" size={17} />
								) : (
									<Volume2 aria-hidden="true" size={17} />
								)}
							</button>
						</div>

						<div className="music-list-head">
							<span className="mono-label">
								PLAYLIST / {String(tracks.length).padStart(2, "0")}
							</span>
							<ChevronDown aria-hidden="true" size={14} />
						</div>
						<div className="music-list" role="list">
							{tracks.map((track, trackIndex) => (
								<button
									type="button"
									key={`${track.url}-${trackIndex}`}
									className={`music-track${trackIndex === index ? " is-current" : ""}`}
									onClick={() => playTrack(trackIndex)}
									aria-current={trackIndex === index ? "true" : undefined}
								>
									<span className="mono-label">
										{String(trackIndex + 1).padStart(3, "0")}
									</span>
									<span className="music-track__name">{track.name}</span>
									<span className="music-track__artist">{track.artist}</span>
								</button>
							))}
						</div>
					</>
				) : (
					<div className="music-empty">
						<Music2 aria-hidden="true" size={22} />
						<p>打开后从 Meting 读取歌单，不会自动播放。</p>
					</div>
				)}
			</div>
		</div>
	);
}
