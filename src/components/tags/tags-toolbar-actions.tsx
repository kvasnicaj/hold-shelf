import { ToolBox } from "#/components/layout/tool-box";
import {
	ToolbarSearch,
	ToolbarSlot,
} from "#/components/layout/toolbar-actions";
import { CreateTagDialog } from "#/components/tags/create-tag-dialog";

type TagsToolbarActionsProps = {
	showSearch: boolean;
	onCreate: (name: string) => Promise<void>;
	onSearch: (query: string) => void;
};

export function TagsToolbarActions({
	showSearch,
	onCreate,
	onSearch,
}: TagsToolbarActionsProps) {
	return (
		<>
			<ToolbarSlot>
				<ToolBox>
					<CreateTagDialog
						onCreate={onCreate}
						triggerVariant="ghost"
						triggerSize="sm"
						triggerClassName="h-8 rounded-lg border-0 shadow-none"
					/>
				</ToolBox>
			</ToolbarSlot>
			{showSearch && (
				<ToolbarSearch placeholder="Filter tags..." onSearch={onSearch} />
			)}
		</>
	);
}
