import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="display-title text-3xl font-bold">Trash</h1>
				<Button
					variant="outline"
					disabled={busy || !data.length}
					onClick={() => requestDelete({ mode: "all" })}
				>
					<Trash2 className="size-4" />
					Empty Trash
				</Button>
			</div>
			<p className="text-muted-foreground">
				Restore articles to keep reading, or permanently delete them to free up
				your library. Tags, saved content, and reading progress are kept until
				permanent deletion.
			</p>
			{isPending ? (
				<p role="status">Loading Trash…</p>
			) : isError ? (
				<p role="alert">
					Could not load Trash.{" "}
					<Button onClick={() => void refetch()}>Try again</Button>
				</p>
			) : data.length === 0 ? (
				<p className="rounded-xl border p-12 text-center text-muted-foreground">
					Trash is empty.
				</p>
			) : (
				<ul className="divide-y rounded-xl border">
					{data.map((article) => (
						<li
							key={article.id}
							className="flex flex-wrap items-center gap-3 p-4"
						>
							<div className="min-w-0 basis-full sm:basis-0 sm:flex-1">
								<p className="font-medium">{article.title ?? article.url}</p>
								<p className="truncate text-xs text-muted-foreground">
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
								disabled={busy}
								aria-label={`Permanently delete ${article.title ?? article.url}`}
								onClick={() =>
									requestDelete(
										{ mode: "selected", ids: [article.id] },
										article.title ?? article.url,
									)
								}
							>
								<Trash2 className="size-4" />
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
