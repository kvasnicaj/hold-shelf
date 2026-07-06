import type * as React from "react";

type ArticleExternalLinkProps = Omit<
	React.ComponentProps<"a">,
	"href" | "onClick" | "onAuxClick"
> & {
	articleId: string;
	href: string;
	isRead: boolean;
	onOpenArticle: (id: string, isRead: boolean) => void | Promise<void>;
	onClick?: React.MouseEventHandler<HTMLAnchorElement>;
	onAuxClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export function ArticleExternalLink({
	articleId,
	href,
	isRead,
	onOpenArticle,
	onClick,
	onAuxClick,
	...props
}: ArticleExternalLinkProps) {
	function triggerOpen() {
		void onOpenArticle(articleId, isRead);
	}

	function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
		onClick?.(event);

		if (event.defaultPrevented || event.button !== 0) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		triggerOpen();
	}

	function handleAuxClick(event: React.MouseEvent<HTMLAnchorElement>) {
		onAuxClick?.(event);

		if (event.defaultPrevented || event.button !== 1) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		triggerOpen();
	}

	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			onClick={handleClick}
			onAuxClick={handleAuxClick}
			{...props}
		/>
	);
}
