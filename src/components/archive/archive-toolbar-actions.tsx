import { SaveArticleToolbarAction } from "#/components/articles/save-article-toolbar-action";

type ArchiveToolbarActionsProps = {
	onAdd: (url: string) => Promise<void>;
};

export function ArchiveToolbarActions({ onAdd }: ArchiveToolbarActionsProps) {
	return <SaveArticleToolbarAction onAdd={onAdd} />;
}
