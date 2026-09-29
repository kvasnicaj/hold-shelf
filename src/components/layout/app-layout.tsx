import { Outlet } from "@tanstack/react-router";
import { ArticleReaderPanel } from "#/components/article-reader/article-reader-panel";
import { ArticleReaderProvider } from "#/components/article-reader/article-reader-provider";
import { AppSidebar } from "#/components/layout/app-sidebar";
import { MobileNavigation } from "#/components/layout/mobile-navigation";
import { ToolbarActionsProvider } from "#/components/layout/toolbar-actions";
import { TopBar } from "#/components/layout/top-bar";
export function AppLayout() {
	return (
		<ToolbarActionsProvider>
			<ArticleReaderProvider>
				<div className="flex min-h-screen w-full bg-background">
					<div className="sticky top-0 hidden h-screen shrink-0 md:flex">
						<AppSidebar />
					</div>
					<main className="min-w-0 flex-1 pb-32 md:pb-0">
						<TopBar />
						<div className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-6">
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
