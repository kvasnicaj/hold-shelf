import { Check, CircleNotch, Plus } from "@phosphor-icons/react";
import type { TagPickerState } from "#/components/tags/use-tag-picker";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { PopoverContent } from "#/components/ui/popover";
import { cn } from "#/lib/utils";

type TagPickerPanelProps = {
	picker: TagPickerState;
	title: string;
	align?: "start" | "center" | "end";
};

export function TagPickerPanel({
	picker,
	title,
	align = "start",
}: TagPickerPanelProps) {
	return (
		<PopoverContent
			className="w-72 max-w-[calc(100vw-1.5rem)] p-2"
			align={align}
			aria-label={title}
			onClick={(event) => event.stopPropagation()}
			onKeyDown={(event) => event.stopPropagation()}
		>
			<div className="mb-2 flex items-center justify-between px-2 py-1 text-sm">
				<span className="font-semibold">{title}</span>
				<span className="text-xs text-muted-foreground" aria-live="polite">
					{picker.selectedIds.length} selected
				</span>
			</div>
			<Input
				maxLength={64}
				placeholder={
					picker.canCreateTags ? "Search or create tag..." : "Search tags..."
				}
				aria-label={
					picker.canCreateTags ? "Search or create tag" : "Search tags"
				}
				value={picker.search}
				onChange={(event) => picker.setSearch(event.target.value)}
				className="mb-2 h-9"
			/>
			<div
				className="max-h-56 space-y-px overflow-x-hidden overflow-y-auto"
				aria-busy={picker.busy}
			>
				{picker.filteredTags.map((tag) => {
					const selected = picker.selectedIds.includes(tag.id);
					return (
						<label
							key={tag.id}
							className={cn(
								"flex min-h-9 w-full min-w-0 items-center gap-2 overflow-hidden rounded-sm px-2 py-2 text-left text-sm hover:bg-accent focus-within:outline-2 focus-within:outline-ring",
								selected && "bg-select font-medium",
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
							: picker.canCreateTags
								? "No tags yet. Search to create one."
								: "No tags yet."}
					</p>
				)}
				{picker.canCreate && (
					<button
						type="button"
						disabled={picker.busy}
						onClick={() => void picker.createAndAssignTag()}
						className="flex min-h-9 w-full min-w-0 items-center gap-2 overflow-hidden rounded-sm px-2 py-2 text-left text-sm hover:bg-accent disabled:opacity-50"
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
	);
}
