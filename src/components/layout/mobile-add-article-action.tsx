import { AddArticleDialog } from "#/components/articles/add-article-dialog";
import { useSaveArticle } from "#/components/articles/use-save-article";

export function MobileAddArticleAction() {
	const { handleAdd } = useSaveArticle();

	return (
		<AddArticleDialog
			onAdd={handleAdd}
			triggerVariant="default"
			triggerSize="sm"
			triggerClassName="h-10 rounded-full px-3.5 shadow-lg"
			triggerAriaLabel="Add article"
		/>
	);
}
