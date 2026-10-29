import { MagnifyingGlass } from "@phosphor-icons/react";
import { useRouterState } from "@tanstack/react-router";
import { AppBrandMark } from "#/components/layout/app-brand-mark";
import { AppToolbar } from "#/components/layout/app-toolbar";
import { ColumnNavbar } from "#/components/layout/column-navbar";
import { useToolbarActions } from "#/components/layout/toolbar-actions";
import { useSearch } from "#/components/search/use-search";
import { Button } from "#/components/ui/button";

/** Phone-only bar: brand, search and account. Desktop uses the sidebar. */
export function TopBar() {
	const { actions } = useToolbarActions();
	const search = useSearch();
	const path = useRouterState({ select: (state) => state.location.pathname });

	return (
		<ColumnNavbar
			key={path}
			aria-label="Main content navigation"
			className="md:hidden"
			left={[<AppBrandMark key="brand" />]}
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
			mobileRight={[
				<Button
					key="search"
					variant="ghost"
					size="icon-sm"
					aria-label="Search"
					onClick={search.open}
				>
					<MagnifyingGlass className="size-5" />
				</Button>,
				<AppToolbar key="account" />,
			]}
			mobileMenuLabel="Main actions"
		/>
	);
}
