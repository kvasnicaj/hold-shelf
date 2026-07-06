import { ArrowLeft, Trash2 } from "lucide-react";
import { RenameTagDialog } from "#/components/tags/rename-tag-dialog";
import { Button } from "#/components/ui/button";

type TagHeadingActionsProps = {
	tagName: string;
	showBack?: boolean;
	onBack?: () => void;
	onRename: (name: string) => Promise<void>;
	onDelete: () => Promise<void>;
};

export function TagHeadingActions({
	tagName,
	showBack = false,
	onBack,
	onRename,
	onDelete,
}: TagHeadingActionsProps) {
	return (
		<>
			{showBack && onBack ? (
				<Button
					type="button"
					variant="outline"
					size="icon-sm"
					onClick={onBack}
					aria-label="Back to tags"
					title="Back to tags"
				>
					<ArrowLeft className="h-[1.125rem] w-[1.125rem]" />
				</Button>
			) : null}
			<RenameTagDialog
				tagName={tagName}
				onRename={onRename}
				triggerVariant="outline"
				triggerSize="icon-sm"
				triggerAriaLabel={`Rename ${tagName}`}
				triggerTitle="Rename tag"
			/>
			<Button
				type="button"
				variant="outline"
				size="icon-sm"
				onClick={() => void onDelete()}
				aria-label={`Delete ${tagName}`}
				title="Delete tag"
			>
				<Trash2 className="h-[1.125rem] w-[1.125rem]" />
			</Button>
		</>
	);
}
