import { SaveArticleToolbarAction } from "#/components/articles/save-article-toolbar-action";

type ArchiveToolbarActionsProps = {
	onAdd: (url: string) => Promise<void>;
	searchValue: string;
	onSearch: (query: string) => void;
};

export function ArchiveToolbarActions({
	onAdd,
	searchValue,
	onSearch,
}: ArchiveToolbarActionsProps) {
	return (
		<SaveArticleToolbarAction
			onAdd={onAdd}
			searchPlaceholder="Search archive..."
			searchValue={searchValue}
			onSearch={onSearch}
		/>
	);
}
