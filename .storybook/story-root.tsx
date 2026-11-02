import { useContext } from "react";
import { ArticleReaderProvider } from "#/components/article-reader/article-reader-provider";
import { QuickSaveProvider } from "#/components/quick-save/quick-save-provider";
import { SearchProvider } from "#/components/search/search-provider";
import { ShortcutsProvider } from "#/components/shortcuts/shortcuts-provider";
import { TooltipProvider } from "#/components/ui/tooltip";
import { StoryCanvasContext } from "./story-context";

export function StoryRoot() {
	const { children, appShell } = useContext(StoryCanvasContext);
	if (appShell) return children;
	return (
		<TooltipProvider>
			<ArticleReaderProvider>
				<QuickSaveProvider>
					<SearchProvider>
						<ShortcutsProvider>{children}</ShortcutsProvider>
					</SearchProvider>
				</QuickSaveProvider>
			</ArticleReaderProvider>
		</TooltipProvider>
	);
}
