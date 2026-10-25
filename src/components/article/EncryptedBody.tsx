import { useId, useState, type FormEvent } from "react";
import { KeyRound, Loader2, LockKeyhole } from "lucide-react";

import { decryptPayload } from "../../lib/encryption";
import type { ArticleData } from "../../types";

interface EncryptedBodyProps {
	post: ArticleData;
	onUnlocked: (html: string) => void;
}

export function EncryptedBody({ post, onUnlocked }: EncryptedBodyProps) {
	const inputId = useId();
	const errorId = useId();
	const [password, setPassword] = useState("");
	const [state, setState] = useState<"idle" | "loading" | "error">("idle");
	const [message, setMessage] = useState("");

	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!post.ciphertext) {
			setState("error");
			setMessage("这篇档案没有可用的密文。");
			return;
		}
		setState("loading");
		setMessage("");
		try {
			const html = await decryptPayload(post.ciphertext, password);
			onUnlocked(html);
			setPassword("");
		} catch (error) {
			const reason = error instanceof Error ? error.message : "";
			setState("error");
			setMessage(
				reason.includes("unsupported") || reason.includes("Web Crypto")
					? reason
					: "密码不正确，或浏览器无法解密。",
			);
		}
	};

	return (
		<div className="locked-article">
			<div className="locked-article__mark" aria-hidden="true">
				<LockKeyhole size={28} />
			</div>
			<p className="mono-label">RESTRICTED / ENCRYPTED</p>
			<h2>这份记录需要密码</h2>
			<p className="locked-article__copy">
				正文在构建阶段加密，静态 HTML 与搜索索引里都不会出现明文。输入密码后在本机解密。
			</p>
			{post.passwordHint && (
				<p className="locked-article__hint">提示：{post.passwordHint}</p>
			)}
			<form onSubmit={submit} className="unlock-form">
				<label htmlFor={inputId}>
					<span className="mono-label">PASSWORD</span>
					<span className="unlock-field">
						<KeyRound aria-hidden="true" size={16} />
						<input
							id={inputId}
							type="password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							autoComplete="current-password"
							placeholder="输入访问密码"
							aria-invalid={state === "error"}
							aria-describedby={message ? errorId : undefined}
							disabled={state === "loading"}
						/>
					</span>
				</label>
				<button
					type="submit"
					className="button button--solid"
					disabled={state === "loading" || !password}
				>
					{state === "loading" ? (
						<Loader2 aria-hidden="true" className="spin" size={16} />
					) : null}
					{state === "loading" ? "解密中" : "解锁档案"}
				</button>
			</form>
			<p
				id={errorId}
				className={`unlock-error${state === "error" ? " is-visible" : ""}`}
				role="alert"
				aria-live="polite"
			>
				{message}
			</p>
		</div>
	);
}
