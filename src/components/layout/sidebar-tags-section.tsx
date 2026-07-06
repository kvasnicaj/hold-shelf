import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageSearchField } from "#/components/layout/page-search-field";
import { SidebarTagItem } from "#/components/layout/sidebar-tag-item";
import { CreateTagDialog } from "#/components/tags/create-tag-dialog";
import type { Tag } from "#/components/tags/types";
import { createTag, deleteTag, updateTag } from "#/server/tags";

type SidebarTagsSectionProps = {
	tags: Array<Tag & { articleCount: number }>;
	currentPath: string;
	activeTagId?: string;
};

export function SidebarTagsSection({
	tags,
	currentPath,
	activeTagId,
}: SidebarTagsSectionProps) {
	const [filter, setFilter] = useState("");
	const queryClient = useQueryClient();
	const router = useRouter();
	const sortedTags = useMemo(
		() =>
			[...tags].sort((left, right) => {
				if (right.articleCount !== left.articleCount) {
					return right.articleCount - left.articleCount;
				}

				return left.name.localeCompare(right.name);
			}),
		[tags],
	);
	const filteredTags = filter
		? sortedTags.filter((tag) =>
				tag.name.toLowerCase().includes(filter.toLowerCase()),
			)
		: sortedTags;

	function invalidateTags() {
		void queryClient.invalidateQueries({ queryKey: ["articles"] });
		void queryClient.invalidateQueries({ queryKey: ["tags"] });
		void router.invalidate();
	}

	async function handleCreateTag(name: string) {
		await createTag({ data: { name } });
		invalidateTags();
	}

	async function handleRenameTag(id: string, name: string) {
		await updateTag({ data: { id, name } });
		invalidateTags();
	}

	async function handleDeleteTag(id: string) {
		await deleteTag({ data: { id } });
		if (currentPath === "/app/tags" && activeTagId === id) {
			void router.navigate({ to: "/app/tags", search: {}, replace: true });
		}
		invalidateTags();
	}

	return (
		<section className="mt-4">
			<div className="mb-2 flex items-center justify-between gap-2 px-2">
				<p className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
					Tags
				</p>
				<CreateTagDialog
					onCreate={handleCreateTag}
					triggerVariant="ghost"
					triggerSize="icon-xs"
					triggerClassName="text-sidebar-foreground/70 hover:bg-sidebar-accent [&_span]:sr-only"
					triggerAriaLabel="Create tag"
					collapseLabelOnMobile
				/>
			</div>
			<PageSearchField
				value={filter}
				placeholder="Filter tags..."
				ariaLabel="Filter tags"
				onSearch={setFilter}
				className="mb-2"
			/>
			<nav className="space-y-0.5">
				{filteredTags.length > 0 ? (
					filteredTags.map((tag) => (
						<SidebarTagItem
							key={tag.id}
							tag={tag}
							isActive={currentPath === "/app/tags" && activeTagId === tag.id}
							onRename={(name) => handleRenameTag(tag.id, name)}
							onDelete={() => handleDeleteTag(tag.id)}
						/>
					))
				) : (
					<p className="px-2 py-3 text-sm text-sidebar-foreground/60">
						{filter ? "No tags match." : "No tags yet."}
					</p>
				)}
			</nav>
		</section>
	);
}
