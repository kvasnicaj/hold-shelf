import { useQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bookmark, Tag } from "lucide-react";
import { homeNavItem, libraryNavItems } from "#/components/layout/nav-items";
import { NavLink } from "#/components/layout/nav-link";
import { getArticles } from "#/server/articles";
import { getTags } from "#/server/tags";

export function AppSidebar() {
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;
	const searchParams = routerState.location.search as Record<string, string>;

	const { data: tagList = [] } = useQuery({
		queryKey: ["tags"],
		queryFn: () => getTags(),
	});

	const { data: unreadResult } = useQuery({
		queryKey: ["articles", "unread-count"],
		queryFn: () => getArticles({ data: { isRead: false, limit: 0 } }),
	});
	const unreadCount = unreadResult?.total ?? 0;
	const sortedTagList = [...tagList].sort((left, right) => {
		if (right.articleCount !== left.articleCount) {
			return right.articleCount - left.articleCount;
		}

		return left.name.localeCompare(right.name);
	});

	return (
		<aside className="flex w-52 flex-col overflow-y-auto rounded-xl border bg-card shadow-sm p-3">
			<Link
				to="/app/home"
				className="mb-4 flex items-center gap-2 px-2 no-underline"
			>
				<Bookmark className="h-7 w-7 text-(--lagoon)" />
				<span className="display-title text-xl font-bold text-foreground">
					Hold Shelf
				</span>
			</Link>

			<div className="pt-1.5">
				<nav className="space-y-0.5">
					<NavLink
						href={homeNavItem.href}
						icon={homeNavItem.icon}
						label={homeNavItem.label}
						isActive={currentPath === homeNavItem.href}
					/>
				</nav>

				<p className="mb-1 mt-4 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					Library
				</p>
				<nav className="space-y-0.5">
					{libraryNavItems.map((item) => (
						<NavLink
							key={item.href}
							href={item.href}
							icon={item.icon}
							label={item.label}
							isActive={currentPath === item.href}
							badge={
								item.href === "/app/articles" && unreadCount > 0
									? unreadCount
									: undefined
							}
						/>
					))}
				</nav>

				{sortedTagList.length > 0 && (
					<>
						<p className="mb-1 mt-4 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							Tags
						</p>
						<nav className="space-y-0.5">
							{sortedTagList.map((tag) => (
								<NavLink
									key={tag.id}
									href={`/app/archive?tag=${tag.id}`}
									linkProps={{ to: "/app/archive", search: { tag: tag.id } }}
									icon={Tag}
									iconClassName="h-3.5 w-3.5"
									label={tag.name}
									isActive={
										currentPath === "/app/archive" &&
										searchParams.tag === tag.id
									}
									count={tag.articleCount}
								/>
							))}
						</nav>
					</>
				)}
			</div>
		</aside>
	);
}
