import { Trash } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeading } from "#/components/layout/page-heading";
import { TrashDeleteDialog } from "#/components/library/trash-delete-dialog";
import { Button } from "#/components/ui/button";
import {
	getTrash,
	permanentlyDeleteTrash,
	restoreArticles,
} from "#/server/library";
import type { DeleteTrashInput } from "#/server/library-schemas";
export function TrashPage() {
	const [deletion, setDeletion] = useState<{
		input: DeleteTrashInput;
		title?: string;
	} | null>(null);
	const client = useQueryClient();
	const router = useRouter();
	const {
		data = [],
		isPending,
		isError,
		refetch,
	} = useQuery({ queryKey: ["trash"], queryFn: () => getTrash() });
	const restore = useMutation({
		mutationFn: (id: string) => restoreArticles({ data: { ids: [id] } }),
		onSuccess: async () => {
			toast.success("Article restored");
			await client.invalidateQueries();
			await router.invalidate();
		},
		onError: () =>
			toast.error("Could not restore this article. Please try again."),
	});
	const remove = useMutation({
		mutationFn: (input: DeleteTrashInput) =>
			permanentlyDeleteTrash({ data: input }),
		onSuccess: async (_result, input) => {
			setDeletion(null);
			toast.success(
				input.mode === "all" ? "Trash emptied" : "Article permanently deleted",
			);
			await client.invalidateQueries();
			await router.invalidate();
		},
	});
	const busy = restore.isPending || remove.isPending;
	function requestDelete(input: DeleteTrashInput, title?: string) {
		remove.reset();
		setDeletion({ input, title });
	}

	return (
		<div className="w-full space-y-5">
			<PageHeading
				title="Trash"
				description="Restore articles to keep reading them. Tags, saved text and reading position stay with an article until you delete it forever."
				actions={
					<Button
						variant="destructive-outline"
						disabled={busy || !data.length}
						onClick={() => requestDelete({ mode: "all" })}
					>
						<Trash className="size-4" />
						Empty Trash
					</Button>
				}
			/>
			{isPending ? (
				<p role="status">Loading Trash…</p>
			) : isError ? (
				<p role="alert">
					Could not load Trash.{" "}
					<Button onClick={() => void refetch()}>Try again</Button>
				</p>
			) : data.length === 0 ? (
				<p className="rounded-lg border p-12 text-center text-muted-foreground">
					Trash is empty.
				</p>
			) : (
				<ul className="divide-y rounded-lg border">
					{data.map((article) => (
						<li
							key={article.id}
							className="flex flex-wrap items-center gap-3 p-4"
						>
							<div className="min-w-0 basis-full sm:basis-0 sm:flex-1">
								<p className="font-medium">{article.title ?? article.url}</p>
								<p className="truncate text-meta text-muted-foreground">
									{article.url}
								</p>
							</div>
							<Button
								variant="outline"
								disabled={busy}
								onClick={() => restore.mutate(article.id)}
							>
								Restore
							</Button>
							<Button
								variant="ghost"
								className="text-destructive hover:bg-destructive/10 hover:text-destructive"
								disabled={busy}
								aria-label={`Delete forever: ${article.title ?? article.url}`}
								onClick={() =>
									requestDelete(
										{ mode: "selected", ids: [article.id] },
										article.title ?? article.url,
									)
								}
							>
								<Trash className="size-4" />
								Delete forever
							</Button>
						</li>
					))}
				</ul>
			)}
			<TrashDeleteDialog
				open={deletion !== null}
				all={deletion?.input.mode === "all"}
				articleTitle={deletion?.title}
				pending={remove.isPending}
				error={
					remove.isError
						? "Could not delete these articles. Please try again."
						: null
				}
				onClose={() => setDeletion(null)}
				onConfirm={() => {
					if (deletion) remove.mutate(deletion.input);
				}}
			/>
		</div>
	);
}
