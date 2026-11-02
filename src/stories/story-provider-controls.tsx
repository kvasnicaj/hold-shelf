import { useContext } from "react";
import { ArticleReaderPanel } from "#/components/article-reader/article-reader-panel";
import { useArticleReader } from "#/components/article-reader/use-article-reader";
import { useQuickSave } from "#/components/quick-save/use-quick-save";
import { useSearch } from "#/components/search/use-search";
import { ShortcutsContext } from "#/components/shortcuts/shortcuts-context";
import { Button } from "#/components/ui/button";
import { sampleArticle } from "#/stories/fixtures";

export function StoryProviderControls({
	action,
}: {
	action: "reader" | "save" | "search" | "shortcuts";
}) {
	const reader = useArticleReader();
	const save = useQuickSave();
	const search = useSearch();
	const shortcuts = useContext(ShortcutsContext);
	return (
		<div className="space-y-4 p-6">
			<p className="text-sm text-muted-foreground">
				Open the provider’s UI, then close it and open it again.
			</p>
			{action === "reader" && (
				<Button onClick={() => reader.openArticle(sampleArticle.id)}>
					Open article reader
				</Button>
			)}
			{action === "save" && (
				<Button onClick={() => save.open("https://example.com/new-article")}>
					Save a link
				</Button>
			)}
			{action === "search" && (
				<Button onClick={search.open}>Search articles</Button>
			)}
			{action === "shortcuts" && (
				<Button onClick={() => shortcuts?.openHelp()}>
					Show keyboard shortcuts
				</Button>
			)}
			<ArticleReaderPanel />
		</div>
	);
}
