import { Plus, Tags, X } from "lucide-react";
import { useState } from "react";
import type { Tag } from "#/components/tags/types";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/ui/popover";

type TagPickerProps = {
	availableTags: Tag[];
	selectedTagIds: string[];
	onAddTag: (tagId: string, articleIds: string[]) => void;
	onRemoveTag: (tagId: string, articleIds: string[]) => void;
	onCreateTag: (name: string) => Promise<Tag>;
	articleIds: string[];
	triggerClassName?: string;
};

export function TagPicker({
	availableTags,
	selectedTagIds,
	onAddTag,
	onRemoveTag,
	onCreateTag,
	articleIds,
	triggerClassName,
}: TagPickerProps) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [creating, setCreating] = useState(false);

	const filtered = availableTags.filter((tag) =>
		tag.name.toLowerCase().includes(search.toLowerCase()),
	);

	const canCreate =
		search.trim() &&
		!availableTags.some(
			(t) => t.name.toLowerCase() === search.trim().toLowerCase(),
		);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="icon-xs"
					title="Manage tags"
					className={triggerClassName}
					onClick={(event) => event.stopPropagation()}
				>
					<Tags className="h-[1.125rem] w-[1.125rem]" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-56 p-2" align="start">
				<Input
					placeholder="Search or create tag..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="mb-2 h-8"
				/>

				<div className="max-h-40 space-y-1 overflow-y-auto">
					{filtered.map((tag) => {
						const isSelected = selectedTagIds.includes(tag.id);
						return (
							<button
								type="button"
								key={tag.id}
								onClick={() => {
									if (isSelected) {
										onRemoveTag(tag.id, articleIds);
									} else {
										onAddTag(tag.id, articleIds);
									}
								}}
								className="flex w-full items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-accent"
							>
								<Badge variant="secondary">{tag.name}</Badge>
								{isSelected && (
									<X className="h-3.5 w-3.5 text-muted-foreground" />
								)}
							</button>
						);
					})}

					{canCreate && (
						<button
							type="button"
							disabled={creating}
							onClick={async () => {
								setCreating(true);
								const tag = await onCreateTag(search.trim());
								onAddTag(tag.id, articleIds);
								setSearch("");
								setCreating(false);
							}}
							className="flex w-full items-center gap-1 rounded px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent"
						>
							<Plus className="h-3.5 w-3.5" />
							Create "{search.trim()}"
						</button>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
