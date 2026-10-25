import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

const STORAGE_KEY = "noctilux-motion";

export function MotionToggle() {
	const [reduced, setReduced] = useState(false);

	useEffect(() => {
		try {
			setReduced(localStorage.getItem(STORAGE_KEY) === "reduce");
		} catch {
			// Storage can be unavailable in private modes; system preference still applies.
		}
	}, []);

	const toggle = () => {
		const next = !reduced;
		setReduced(next);
		if (next) {
			document.documentElement.dataset.motion = "reduce";
		} else {
			delete document.documentElement.dataset.motion;
		}
		try {
			localStorage.setItem(STORAGE_KEY, next ? "reduce" : "full");
		} catch {
			// The visual state still changes for this page view.
		}
	};

	return (
		<button
			type="button"
			className="motion-toggle"
			onClick={toggle}
			aria-pressed={reduced}
			aria-label={reduced ? "恢复动效" : "减少动效"}
		>
			<Activity aria-hidden="true" size={14} />
			{reduced ? "动效已减少" : "减少动效"}
		</button>
	);
}
