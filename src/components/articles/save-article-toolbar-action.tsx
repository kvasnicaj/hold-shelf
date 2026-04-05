import { AddArticleDialog } from "#/components/articles/add-article-dialog";
import { ToolBox } from "#/components/layout/tool-box";
import { ToolbarSlot } from "#/components/layout/toolbar-actions";

type SaveArticleToolbarActionProps = {
	onAdd: (url: string) => Promise<void>;
};

export function SaveArticleToolbarAction({
	onAdd,
}: SaveArticleToolbarActionProps) {
	return (
		<ToolbarSlot>
			<ToolBox>
				<AddArticleDialog
					onAdd={onAdd}
					triggerVariant="ghost"
					triggerSize="sm"
					triggerClassName="h-8 rounded-lg border-0 shadow-none"
				/>
			</ToolBox>
		</ToolbarSlot>
	);
}
