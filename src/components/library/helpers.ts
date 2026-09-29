import { exportLibraryPage, importLibraryBatch } from "#/server/library";
import {
	type BackupArticle,
	libraryBackupSchema,
} from "#/server/library-schemas";
export async function downloadLibraryBackup() {
	const articles: BackupArticle[] = [];
	for (let offset = 0; offset <= 10000; offset += 25) {
		const page = await exportLibraryPage({ data: { offset } });
		articles.push(...page);
		if (articles.length > 10000)
			throw new Error(
				"This library exceeds the backup limit of 10,000 articles.",
			);
		if (page.length < 25) break;
	}
	const blob = new Blob(
		[
			JSON.stringify(
				{
					format: "hold-shelf",
					version: 1,
					exportedAt: new Date().toISOString(),
					articles,
				},
				null,
				2,
			),
		],
		{ type: "application/json" },
	);
	const href = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = href;
	link.download = `hold-shelf-${new Date().toISOString().slice(0, 10)}.json`;
	document.body.appendChild(link);
	link.click();
	link.remove();
	setTimeout(() => URL.revokeObjectURL(href), 1000);
	return articles.length;
}
export async function importLibraryFile(
	file: File,
	onProgress: (count: number, total: number) => void,
) {
	if (file.size > 50 * 1024 * 1024)
		throw new Error("Choose a backup smaller than 50 MB.");
	let value: unknown;
	try {
		value = JSON.parse(await file.text());
	} catch {
		throw new Error("This file is not a valid JSON backup.");
	}
	const parsed = libraryBackupSchema.safeParse(value);
	if (!parsed.success)
		throw new Error(
			"Choose a Hold Shelf version 1 backup. No articles have been imported.",
		);
	let imported = 0;
	let skipped = 0;
	for (let offset = 0; offset < parsed.data.articles.length; offset += 1) {
		try {
			const result = await importLibraryBatch({
				data: parsed.data.articles.slice(offset, offset + 1),
			});
			imported += result.imported;
			skipped += result.skipped;
			onProgress(offset + 1, parsed.data.articles.length);
		} catch {
			throw new Error(
				`Import stopped after ${imported} new articles (${skipped} already saved). Retry the same file to continue safely.`,
			);
		}
	}
	return { imported, skipped };
}
