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
	onAddTag: (tagId: string, articleIds: string[]) => void | Promise<void>;
	onRemoveTag: (tagId: string, articleIds: string[]) => void | Promise<void>;
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
	const [error, setError] = useState<string | null>(null);

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
			<PopoverContent
				className="w-56 p-2"
				align="start"
				onClick={(event) => event.stopPropagation()}
				onKeyDown={(event) => event.stopPropagation()}
			>
				<Input
					maxLength={64}
					placeholder="Search or create tag..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="mb-2 h-8"
				/>

				<div className="max-h-40 space-y-1 overflow-x-hidden overflow-y-auto">
					{filtered.map((tag) => {
						const isSelected = selectedTagIds.includes(tag.id);
						return (
							<button
								type="button"
								key={tag.id}
								onClick={async () => {
									try {
										if (isSelected) {
											await onRemoveTag(tag.id, articleIds);
										} else {
											await onAddTag(tag.id, articleIds);
										}
									} catch (error) {
										setError(
											error instanceof Error
												? error.message
												: "Could not update tag.",
										);
									}
								}}
								className="flex w-full min-w-0 items-center justify-between gap-2 overflow-hidden rounded px-2 py-1.5 text-sm hover:bg-accent"
							>
								<Badge
									variant="secondary"
									className="min-w-0 shrink truncate"
									title={tag.name}
								>
									{tag.name}
								</Badge>
								{isSelected && (
									<X className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
								)}
							</button>
						);
					})}

					{error && (
						<p role="alert" className="px-2 text-sm text-destructive">
							{error}
						</p>
					)}
					{canCreate && (
						<button
							type="button"
							disabled={creating}
							onClick={async () => {
								setCreating(true);
								setError(null);
								try {
									const tag = await onCreateTag(search.trim());
									await onAddTag(tag.id, articleIds);
									setSearch("");
								} catch (error) {
									setError(
										error instanceof Error
											? error.message
											: "Could not create tag. Please try again.",
									);
								} finally {
									setCreating(false);
								}
							}}
							className="flex w-full min-w-0 items-center gap-1 overflow-hidden rounded px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent"
						>
							<Plus className="h-3.5 w-3.5 shrink-0" />
							<span className="truncate">Create "{search.trim()}"</span>
						</button>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
