import { ToolBox } from "#/components/layout/tool-box";
import { ToolbarSlot } from "#/components/layout/toolbar-actions";
import { CreateTagDialog } from "#/components/tags/create-tag-dialog";

type TagsToolbarActionsProps = {
	onCreate: (name: string) => Promise<void>;
};

export function TagsToolbarActions({ onCreate }: TagsToolbarActionsProps) {
	return (
		<ToolbarSlot>
			<ToolBox>
				<CreateTagDialog
					onCreate={onCreate}
					triggerVariant="ghost"
					triggerSize="sm"
					triggerClassName="h-9 border-0 px-2.5 shadow-none sm:px-3.5"
					triggerAriaLabel="Create tag"
					collapseLabelOnMobile
				/>
			</ToolBox>
		</ToolbarSlot>
	);
}
