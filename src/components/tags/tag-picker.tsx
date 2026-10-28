import {
	Check,
	CircleNotch,
	Plus,
	Tag as TagIcon,
} from "@phosphor-icons/react";
import type { Tag } from "#/components/tags/types";
import { useTagPicker } from "#/components/tags/use-tag-picker";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/ui/popover";
import { cn } from "#/lib/utils";

type TagPickerProps = {
	availableTags: Tag[];
	selectedTagIds: string[];
	onAddTag: (tagId: string, articleIds: string[]) => void | Promise<void>;
	onRemoveTag: (tagId: string, articleIds: string[]) => void | Promise<void>;
	onCreateTag: (name: string) => Promise<Tag>;
	articleIds: string[];
	triggerClassName?: string;
};

export function TagPicker({ triggerClassName, ...props }: TagPickerProps) {
	const picker = useTagPicker(props);
	return (
		<Popover open={picker.open} onOpenChange={picker.changeOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon-xs"
					title="Manage tags"
					aria-label="Manage tags"
					className={triggerClassName}
					onClick={(event) => event.stopPropagation()}
				>
					<TagIcon className="h-[1.125rem] w-[1.125rem]" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-72 p-2"
				align="start"
				aria-label="Article tags"
				onClick={(event) => event.stopPropagation()}
				onKeyDown={(event) => event.stopPropagation()}
			>
				<div className="mb-2 flex items-center justify-between px-2 py-1 text-sm">
					<span className="font-medium">Article tags</span>
					<span className="text-xs text-muted-foreground" aria-live="polite">
						{picker.selectedIds.length} selected
					</span>
				</div>
				<Input
					maxLength={64}
					placeholder="Search or create tag..."
					aria-label="Search or create tag"
					value={picker.search}
					onChange={(event) => picker.setSearch(event.target.value)}
					className="mb-2 h-8"
				/>
				<div
					className="max-h-56 space-y-1 overflow-x-hidden overflow-y-auto"
					aria-busy={picker.busy}
				>
					{picker.filteredTags.map((tag) => {
						const selected = picker.selectedIds.includes(tag.id);
						return (
							<label
								key={tag.id}
								className={cn(
									"flex w-full min-w-0 items-center gap-2 overflow-hidden rounded px-2 py-2 text-left text-sm hover:bg-accent focus-within:outline-2 focus-within:outline-ring",
									selected && "bg-accent font-medium",
								)}
							>
								<input
									type="checkbox"
									className="sr-only"
									aria-label={tag.name}
									checked={selected}
									disabled={picker.busy}
									onChange={() => void picker.toggleTag(tag.id)}
								/>
								<span
									aria-hidden="true"
									className={cn(
										"grid size-4 shrink-0 place-items-center rounded-sm border",
										selected
											? "border-primary bg-primary text-primary-foreground"
											: "border-input",
									)}
								>
									{picker.pending === tag.id ? (
										<CircleNotch className="size-3 animate-spin" />
									) : (
										selected && <Check className="size-3" />
									)}
								</span>
								<span className="min-w-0 shrink truncate" title={tag.name}>
									{tag.name}
								</span>
							</label>
						);
					})}
					{picker.filteredTags.length === 0 && (
						<p className="px-2 py-3 text-sm text-muted-foreground">
							{picker.search.trim()
								? "No tags match."
								: "No tags yet. Search to create one."}
						</p>
					)}
					{picker.canCreate && (
						<button
							type="button"
							disabled={picker.busy}
							onClick={() => void picker.createAndAssignTag()}
							className="flex w-full min-w-0 items-center gap-2 overflow-hidden rounded px-2 py-2 text-left text-sm hover:bg-accent disabled:opacity-50"
						>
							{picker.creating ? (
								<CircleNotch className="size-4 shrink-0 animate-spin" />
							) : (
								<Plus className="size-4 shrink-0" />
							)}
							<span className="truncate">Create "{picker.search.trim()}"</span>
						</button>
					)}
				</div>
				{picker.error && (
					<p role="alert" className="px-2 py-2 text-sm text-destructive">
						{picker.error}
					</p>
				)}
				<div className="mt-2 border-t pt-2">
					<Button
						type="button"
						variant="secondary"
						size="sm"
						className="w-full"
						onClick={() => picker.changeOpen(false)}
					>
						Done
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
