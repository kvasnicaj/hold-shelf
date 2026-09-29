import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
	downloadLibraryBackup,
	importLibraryFile,
} from "#/components/library/helpers";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
export function LibraryBackupCard() {
	const [pending, setPending] = useState(false);
	const [status, setStatus] = useState("");
	const input = useRef<HTMLInputElement>(null);
	const client = useQueryClient();
	const router = useRouter();
	async function run(action: () => Promise<void>) {
		setPending(true);
		setStatus("");
		try {
			await action();
		} catch (error) {
			setStatus("Backup stopped. See the error message for details.");
			toast.error(
				error instanceof Error
					? error.message
					: "Backup could not be completed.",
			);
		} finally {
			setPending(false);
			await client.invalidateQueries();
			await router.invalidate();
		}
	}
	return (
		<Card>
			<CardHeader>
				<CardTitle>Back up your library</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<p className="text-sm text-muted-foreground">
					Download your articles, saved content, tags, reading progress, and
					Trash. Import a Hold Shelf backup to add articles; existing URLs are
					kept unchanged. Supports up to 10,000 articles and 50 MB per import.
				</p>
				<div className="flex flex-wrap gap-2">
					<Button
						variant="outline"
						disabled={pending}
						onClick={() =>
							void run(async () => {
								const count = await downloadLibraryBackup();
								setStatus(`Exported ${count} articles.`);
							})
						}
					>
						Export library
					</Button>
					<Button
						variant="outline"
						disabled={pending}
						onClick={() => input.current?.click()}
					>
						Import backup
					</Button>
				</div>
				<input
					ref={input}
					type="file"
					accept="application/json,.json"
					className="hidden"
					aria-label="Library backup file"
					onChange={(event) => {
						const file = event.target.files?.[0];
						event.target.value = "";
						if (file)
							void run(async () => {
								const result = await importLibraryFile(file, (count, total) =>
									setStatus(`Importing ${count} of ${total}…`),
								);
								setStatus(
									`Imported ${result.imported} articles. Kept ${result.skipped} existing articles.`,
								);
							});
					}}
				/>
				<p role="status" className="text-sm">
					{pending ? status || "Preparing your backup…" : status}
				</p>
			</CardContent>
		</Card>
	);
}
