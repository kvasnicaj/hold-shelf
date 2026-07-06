import { AddArticleDialog } from "#/components/articles/add-article-dialog";
import { useSaveArticle } from "#/components/articles/use-save-article";

export function TopAddArticleAction() {
	const { handleAdd } = useSaveArticle();

	return (
		<AddArticleDialog
			onAdd={handleAdd}
			triggerVariant="default"
			triggerSize="sm"
			triggerClassName="h-9 px-2.5 shadow-none sm:px-3.5"
			triggerLabelClassName="hidden lg:inline"
			triggerAriaLabel="Add article"
		/>
	);
}
