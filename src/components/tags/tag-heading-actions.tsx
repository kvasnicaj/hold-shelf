import { ArrowLeft, Trash2 } from "lucide-react";
import { useState } from "react";
import { RenameTagDialog } from "#/components/tags/rename-tag-dialog";
import { ShareTagDialog } from "#/components/tags/share-tag-dialog";
import type { TagShare } from "#/components/tags/types";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";

type TagHeadingActionsProps = {
	tagId: string;
	tagName: string;
	initialShare: TagShare | null;
	showBack?: boolean;
	onBack?: () => void;
	onRename: (name: string) => Promise<void>;
	onDelete: () => Promise<void>;
};

export function TagHeadingActions({
	tagId,
	tagName,
	initialShare,
	showBack = false,
	onBack,
	onRename,
	onDelete,
}: TagHeadingActionsProps) {
	const [share, setShare] = useState(initialShare);

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
			{share ? (
				<Badge
					variant="secondary"
					className="h-9 gap-1.5 px-2.5 text-xs text-primary"
					aria-label={`${tagName} is shared`}
				>
					<span className="size-1.5 rounded-full bg-primary" />
					Shared
				</Badge>
			) : null}
			<ShareTagDialog
				tagId={tagId}
				tagName={tagName}
				initialShare={share}
				onShareChange={setShare}
			/>
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
