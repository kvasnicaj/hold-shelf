import { SaveArticleToolbarAction } from "#/components/articles/save-article-toolbar-action";

type ArticlesToolbarActionsProps = {
	onAdd: (url: string) => Promise<void>;
	searchValue: string;
	onSearch: (query: string) => void;
};

export function ArticlesToolbarActions({
	onAdd,
	searchValue,
	onSearch,
}: ArticlesToolbarActionsProps) {
	return (
		<SaveArticleToolbarAction
			onAdd={onAdd}
			searchPlaceholder="Search unread articles..."
			searchValue={searchValue}
			onSearch={onSearch}
		/>
	);
}
