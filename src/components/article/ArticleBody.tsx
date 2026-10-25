interface ArticleBodyProps {
	html: string;
	className?: string;
}

export function ArticleBody({ html, className = "" }: ArticleBodyProps) {
	return (
		<div
			className={`prose noctilux-prose ${className}`.trim()}
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}
