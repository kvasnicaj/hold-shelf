import { AddArticleDialog } from "#/components/articles/add-article-dialog";
import { ToolBox } from "#/components/layout/tool-box";
import {
	ToolbarSearch,
	ToolbarSlot,
} from "#/components/layout/toolbar-actions";

type SaveArticleToolbarActionProps = {
	onAdd: (url: string) => Promise<void>;
	searchPlaceholder?: string;
	searchValue?: string;
	onSearch?: (query: string) => void;
};

export function SaveArticleToolbarAction({
	onAdd,
	searchPlaceholder,
	searchValue,
	onSearch,
}: SaveArticleToolbarActionProps) {
	return (
		<>
			<ToolbarSlot>
				<ToolBox>
					<AddArticleDialog
						onAdd={onAdd}
						triggerVariant="ghost"
						triggerSize="sm"
						triggerClassName="h-9 rounded-lg border-0 px-2.5 shadow-none sm:px-3.5"
						triggerAriaLabel="Add article"
						collapseLabelOnMobile
					/>
				</ToolBox>
			</ToolbarSlot>
			{searchPlaceholder && onSearch ? (
				<ToolbarSearch
					placeholder={searchPlaceholder}
					value={searchValue ?? ""}
					onSearch={onSearch}
				/>
			) : null}
		</>
	);
}
