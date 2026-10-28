import type { ReactElement } from "react";
import { AddArticleDialog } from "#/components/articles/add-article-dialog";
import { useSaveArticle } from "#/components/articles/use-save-article";

type SaveLinkActionProps = {
	children: ReactElement;
};

export function SaveLinkAction({ children }: SaveLinkActionProps) {
	const { handleAdd } = useSaveArticle();

	return <AddArticleDialog onAdd={handleAdd}>{children}</AddArticleDialog>;
}
