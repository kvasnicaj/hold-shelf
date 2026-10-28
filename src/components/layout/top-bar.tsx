import { useRouterState } from "@tanstack/react-router";
import { AppBrandMark } from "#/components/layout/app-brand-mark";
import { AppSearch } from "#/components/layout/app-search";
import { AppToolbar } from "#/components/layout/app-toolbar";
import { ColumnNavbar } from "#/components/layout/column-navbar";
import { useToolbarActions } from "#/components/layout/toolbar-actions";

export function TopBar() {
	const { actions } = useToolbarActions();
	const path = useRouterState({ select: (state) => state.location.pathname });
	const hasPageSearch = [
		"/app/archive",
		"/app/articles",
		"/app/favorites",
		"/app/tags",
	].includes(path);

	return (
		<ColumnNavbar
			key={path}
			aria-label="Main content navigation"
			left={[<AppBrandMark key="brand" />]}
			center={hasPageSearch ? [] : [<AppSearch key="search" />]}
			right={
				actions
					? [
							<div
								key="route-actions"
								className="flex min-w-0 items-center gap-2"
							>
								{actions}
							</div>,
						]
					: []
			}
			mobileRight={[<AppToolbar key="account" />]}
			mobileMenuLabel="Main actions"
			// On desktop the brand mark and account live in the sidebar, so an
			// otherwise empty bar is hidden.
			className={hasPageSearch && !actions ? "md:hidden" : undefined}
		/>
	);
}
