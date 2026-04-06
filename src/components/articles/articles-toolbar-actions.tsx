import { SaveArticleToolbarAction } from "#/components/articles/save-article-toolbar-action";

type ArticlesToolbarActionsProps = {
	onAdd: (url: string) => Promise<void>;
	searchValue: string;
	onSearch: (query: string) => void;
	searchPlaceholder?: string;
};

export function ArticlesToolbarActions({
	onAdd,
	searchValue,
	onSearch,
	searchPlaceholder = "Search articles...",
}: ArticlesToolbarActionsProps) {
	return (
		<SaveArticleToolbarAction
			onAdd={onAdd}
			searchPlaceholder={searchPlaceholder}
			searchValue={searchValue}
			onSearch={onSearch}
		/>
	);
}
