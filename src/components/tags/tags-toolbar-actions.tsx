import { ToolBox } from "#/components/layout/tool-box";
import {
	ToolbarSearch,
	ToolbarSlot,
} from "#/components/layout/toolbar-actions";
import { CreateTagDialog } from "#/components/tags/create-tag-dialog";

type TagsToolbarActionsProps = {
	showSearch: boolean;
	searchValue: string;
	onCreate: (name: string) => Promise<void>;
	onSearch: (query: string) => void;
};

export function TagsToolbarActions({
	showSearch,
	searchValue,
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
						triggerClassName="h-8 rounded-lg border-0 px-2 shadow-none sm:px-3"
						triggerAriaLabel="Create tag"
						collapseLabelOnMobile
					/>
				</ToolBox>
			</ToolbarSlot>
			{showSearch && (
				<ToolbarSearch
					placeholder="Search tags..."
					value={searchValue}
					onSearch={onSearch}
				/>
			)}
		</>
	);
}
