import { Plus } from "@phosphor-icons/react";
import { Link, useRouterState } from "@tanstack/react-router";
import { getMobileTabClassName } from "#/components/layout/helpers";
import { MobileNavTabContent } from "#/components/layout/mobile-nav-tab-content";
import { primaryNavItems, unreadNavHref } from "#/components/layout/nav-items";
import { SaveLinkAction } from "#/components/layout/save-link-action";
import { useUnreadCount } from "#/components/layout/use-unread-count";

export function MobileNavigation() {
	const currentPath = useRouterState().location.pathname;
	const unreadCount = useUnreadCount();

	const tabs = primaryNavItems.map((item) => {
		const isActive = currentPath === item.href;

		return (
			<li key={item.href} className="min-w-0">
				<Link
					to={item.href}
					aria-current={isActive ? "page" : undefined}
					className={getMobileTabClassName(isActive)}
				>
					<MobileNavTabContent
						icon={item.icon}
						label={item.label}
						isActive={isActive}
						badge={
							item.href === unreadNavHref && unreadCount > 0
								? unreadCount
								: undefined
						}
					/>
				</Link>
			</li>
		);
	});

	return (
		<nav
			aria-label="Primary"
			className="fixed inset-x-0 bottom-0 z-40 border-t bg-background px-1.5 pt-1 pb-[calc(env(safe-area-inset-bottom)+0.25rem)] md:hidden"
		>
			<ul className="grid grid-cols-5">
				{tabs.slice(0, 2)}
				<li className="min-w-0">
					<SaveLinkAction>
						<button
							type="button"
							aria-label="Save a link"
							className={getMobileTabClassName(true)}
						>
							<MobileNavTabContent icon={Plus} label="Save" primary />
						</button>
					</SaveLinkAction>
				</li>
				{tabs.slice(2)}
			</ul>
		</nav>
	);
}
