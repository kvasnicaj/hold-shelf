import { Outlet } from "@tanstack/react-router";
import { ArticleReaderPanel } from "#/components/article-reader/article-reader-panel";
import { ArticleReaderProvider } from "#/components/article-reader/article-reader-provider";
import { AppSidebar } from "#/components/layout/app-sidebar";
import { MobileNavigation } from "#/components/layout/mobile-navigation";
import { ToolbarActionsProvider } from "#/components/layout/toolbar-actions";
import { TopBar } from "#/components/layout/top-bar";
import { QuickSaveProvider } from "#/components/quick-save/quick-save-provider";
import { SearchProvider } from "#/components/search/search-provider";
import { ShortcutsProvider } from "#/components/shortcuts/shortcuts-provider";

export function AppLayout() {
	return (
		<ToolbarActionsProvider>
			<ArticleReaderProvider>
				<QuickSaveProvider>
					<SearchProvider>
						<ShortcutsProvider>
							<div className="flex min-h-screen w-full bg-background">
								<div className="sticky top-0 hidden h-screen shrink-0 md:flex">
									<AppSidebar />
								</div>
								<main className="min-w-0 flex-1 pb-24 md:my-2 md:mr-2 md:min-h-[calc(100vh-1rem)] md:rounded-xl md:border md:bg-card md:pb-0">
									<TopBar />
									<div className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-6 md:py-8">
										<Outlet />
									</div>
								</main>
								<ArticleReaderPanel />
							</div>
							<MobileNavigation />
						</ShortcutsProvider>
					</SearchProvider>
				</QuickSaveProvider>
			</ArticleReaderProvider>
		</ToolbarActionsProvider>
	);
}
