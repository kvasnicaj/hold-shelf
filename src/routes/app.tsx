import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { ArticleReaderPanel } from "#/components/article-reader/article-reader-panel";
import { ArticleReaderProvider } from "#/components/article-reader/article-reader-provider";
import { AppBrandMark } from "#/components/layout/app-brand-mark";
import { AppSearch } from "#/components/layout/app-search";
import { AppSidebar } from "#/components/layout/app-sidebar";
import { AppToolbar } from "#/components/layout/app-toolbar";
import { ColumnNavbar } from "#/components/layout/column-navbar";
import { MobileNavigation } from "#/components/layout/mobile-navigation";
import {
	ToolbarActionsProvider,
	useToolbarActions,
} from "#/components/layout/toolbar-actions";
import { TopAddArticleAction } from "#/components/layout/top-add-article-action";
import { getSession } from "#/server/auth";
import { getUserSettings } from "#/server/user-settings";

export const Route = createFileRoute("/app")({
	beforeLoad: async () => {
		const session = await getSession();
		if (!session) {
			throw redirect({ to: "/login" });
		}
		return { session };
	},
	loader: async () => {
		const settings = await getUserSettings();
		return { settings };
	},
	component: AppLayout,
});

function AppLayout() {
	return (
		<ToolbarActionsProvider>
			<ArticleReaderProvider>
				<div className="flex min-h-screen w-full bg-background">
					<div className="sticky top-0 hidden h-screen shrink-0 md:flex">
						<AppSidebar />
					</div>
					<main className="min-w-0 flex-1 pb-32 md:pb-0">
						<TopBar />
						<div className="p-3">
							<Outlet />
						</div>
					</main>
					<ArticleReaderPanel />
				</div>
				<MobileNavigation />
			</ArticleReaderProvider>
		</ToolbarActionsProvider>
	);
}

function TopBar() {
	const { actions } = useToolbarActions();

	return (
		<ColumnNavbar
			aria-label="Main content navigation"
			left={[<AppBrandMark key="brand" />]}
			center={[<AppSearch key="search" />]}
			right={[
				...(actions
					? [
							<div
								key="route-actions"
								className="flex min-w-0 items-center gap-2"
							>
								{actions}
							</div>,
						]
					: []),
				<TopAddArticleAction key="add-article" />,
				<AppToolbar key="account" />,
			]}
			mobileMenuLabel="Main actions"
		/>
	);
}
