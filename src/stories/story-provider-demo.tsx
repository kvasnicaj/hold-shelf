import { ArticleReaderProvider } from "#/components/article-reader/article-reader-provider";
import { QuickSaveProvider } from "#/components/quick-save/quick-save-provider";
import { SearchProvider } from "#/components/search/search-provider";
import { ShortcutsProvider } from "#/components/shortcuts/shortcuts-provider";
import { StoryProviderControls } from "#/stories/story-provider-controls";

export function StoryProviderDemo({
	action,
}: {
	action: "reader" | "save" | "search" | "shortcuts";
}) {
	return (
		<ArticleReaderProvider>
			<QuickSaveProvider>
				<SearchProvider>
					<ShortcutsProvider>
						<StoryProviderControls action={action} />
					</ShortcutsProvider>
				</SearchProvider>
			</QuickSaveProvider>
		</ArticleReaderProvider>
	);
}
