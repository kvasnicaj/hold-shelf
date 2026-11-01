import { MagnifyingGlass } from "@phosphor-icons/react";
import { AppBrandMark } from "#/components/layout/app-brand-mark";
import { AppToolbar } from "#/components/layout/app-toolbar";
import { ColumnNavbar } from "#/components/layout/column-navbar";
import { useSearch } from "#/components/search/use-search";
import { Button } from "#/components/ui/button";

/** Phone-only bar: brand, search and account. Desktop uses the sidebar. */
export function TopBar() {
	const search = useSearch();

	return (
		<ColumnNavbar
			aria-label="Main content navigation"
			className="md:hidden"
			left={[<AppBrandMark key="brand" />]}
			right={[
				<Button
					key="search"
					variant="ghost"
					size="icon-touch"
					aria-label="Search"
					onClick={search.open}
				>
					<MagnifyingGlass className="size-5" />
				</Button>,
				<AppToolbar key="account" />,
			]}
		/>
	);
}
