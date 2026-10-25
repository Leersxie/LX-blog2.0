import { useEffect, useRef } from "react";

export function ReadingProgress() {
	const barRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let frame = 0;
		const update = () => {
			frame = 0;
			const bar = barRef.current;
			if (!bar) return;
			const height =
				document.documentElement.scrollHeight - window.innerHeight;
			const progress = height > 0 ? Math.min(1, window.scrollY / height) : 0;
			bar.style.transform = `scaleX(${progress})`;
			bar.parentElement?.classList.toggle("is-visible", progress > 0.01);
		};
		const onScroll = () => {
			if (frame) return;
			frame = window.requestAnimationFrame(update);
		};
		update();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
			if (frame) window.cancelAnimationFrame(frame);
		};
	}, []);

	return (
		<div className="reading-progress" aria-hidden="true">
			<div className="reading-progress__bar" ref={barRef} />
		</div>
	);
}
