import { SaveArticleToolbarAction } from "#/components/articles/save-article-toolbar-action";

type ArticlesToolbarActionsProps = {
	onAdd: (url: string) => Promise<void>;
};

export function ArticlesToolbarActions({ onAdd }: ArticlesToolbarActionsProps) {
	return <SaveArticleToolbarAction onAdd={onAdd} />;
}
