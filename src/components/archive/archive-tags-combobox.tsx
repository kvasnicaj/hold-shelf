import { ChevronsUpDown, Tags, X } from "lucide-react";
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
import { cn } from "#/lib/utils";

type ArchiveTagsComboboxProps = {
	tags: Tag[];
	selectedTagIds: string[];
	onChange: (tagIds: string[]) => void;
};

export function ArchiveTagsCombobox({
	tags,
	selectedTagIds,
	onChange,
}: ArchiveTagsComboboxProps) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id));
	const filteredTags = tags.filter((tag) =>
		tag.name.toLowerCase().includes(search.trim().toLowerCase()),
	);
	const label =
		selectedTags.length === 0
			? "All tags"
			: selectedTags.length === 1
				? selectedTags[0]?.name
				: `${selectedTags.length} tags`;

	function toggleTag(tagId: string) {
		if (selectedTagIds.includes(tagId)) {
			onChange(selectedTagIds.filter((id) => id !== tagId));
			return;
		}

		onChange([...selectedTagIds, tagId]);
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					className="h-9 w-full justify-between px-3 font-normal md:w-48"
					aria-label="Tag filters"
				>
					<span className="flex min-w-0 items-center gap-2">
						<Tags className="h-4 w-4 shrink-0 text-muted-foreground" />
						<span
							className={cn(
								"truncate",
								selectedTags.length === 0 && "text-muted-foreground",
							)}
						>
							{label}
						</span>
					</span>
					<ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-72 p-2" align="end">
				<Input
					value={search}
					onChange={(event) => setSearch(event.target.value)}
					placeholder="Filter tags..."
					aria-label="Filter archive tags"
					className="mb-2 h-8"
				/>
				{selectedTags.length > 0 && (
					<div className="mb-2 flex flex-wrap gap-1">
						{selectedTags.map((tag) => (
							<Badge key={tag.id} variant="secondary" className="gap-1">
								{tag.name}
								<button
									type="button"
									onClick={() => toggleTag(tag.id)}
									className="rounded-full hover:bg-foreground/10"
								>
									<span className="sr-only">Remove {tag.name}</span>
									<X className="h-3 w-3" />
								</button>
							</Badge>
						))}
					</div>
				)}
				<div className="max-h-56 space-y-1 overflow-y-auto">
					{filteredTags.length > 0 ? (
						filteredTags.map((tag) => {
							const selected = selectedTagIds.includes(tag.id);
							return (
								<button
									key={tag.id}
									type="button"
									onClick={() => toggleTag(tag.id)}
									className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-accent"
								>
									<span
										className={cn(
											"grid size-4 shrink-0 place-items-center rounded-sm border",
											selected
												? "border-primary bg-primary text-primary-foreground"
												: "border-input",
										)}
										aria-hidden="true"
									>
										{selected ? <X className="h-3 w-3 rotate-45" /> : null}
									</span>
									<span className="min-w-0 flex-1 truncate">{tag.name}</span>
									{tag.articleCount !== undefined && (
										<span className="text-xs text-muted-foreground">
											{tag.articleCount}
										</span>
									)}
								</button>
							);
						})
					) : (
						<p className="px-2 py-4 text-center text-sm text-muted-foreground">
							No tags match.
						</p>
					)}
				</div>
				{selectedTagIds.length > 0 && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="mt-2 w-full justify-center"
						onClick={() => onChange([])}
					>
						Clear tags
					</Button>
				)}
			</PopoverContent>
		</Popover>
	);
}
