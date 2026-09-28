import type {
	Article,
	ArticleListResponse,
	ArticleReaderResponse,
	DashboardResponse,
	TagsResponse,
} from "@hold-shelf/api-contracts";
import type { Writer } from "../types.js";

export function writeJson(writer: Writer, value: unknown): void {
	writer.write(`${JSON.stringify(value, null, 2)}\n`);
}

export function writeLine(writer: Writer, value = ""): void {
	writer.write(`${value}\n`);
}

export function renderArticleList(
	writer: Writer,
	result: ArticleListResponse,
	page: number,
): void {
	if (result.items.length === 0) {
		writeLine(writer, "No articles found.");
		return;
	}

	renderTable(writer, {
		headers: ["TITLE", "SITE", "STATE", "TAGS", "SAVED", "ID"],
		rows: result.items.map((article) => [
			truncate(article.title ?? article.url, 48),
			truncate(article.hostname ?? "—", 28),
			truncate(articleState(article), 18),
			truncate(article.tags.map((tag) => tag.name).join(", ") || "—", 32),
			article.createdAt.slice(0, 10),
			truncate(article.id, 32),
		]),
	});
	writeLine(
		writer,
		`\nPage ${page} · showing ${result.items.length} of ${result.total}`,
	);
}

export function renderArticle(
	writer: Writer,
	result: ArticleReaderResponse,
	format: "text" | "markdown",
): void {
	writeLine(writer, result.article.title ?? result.article.url);
	writeLine(writer, result.article.url);
	if (result.article.tags.length > 0) {
		writeLine(
			writer,
			`Tags: ${result.article.tags.map((tag) => tag.name).join(", ")}`,
		);
	}
	writeLine(writer);
	if (result.content.status === "unavailable") {
		writeLine(writer, `Article text is unavailable: ${result.content.reason}`);
		return;
	}
	writeLine(
		writer,
		format === "markdown" ? result.content.markdown : result.content.plainText,
	);
}

export function renderTags(writer: Writer, tags: TagsResponse): void {
	if (tags.length === 0) {
		writeLine(writer, "No tags found.");
		return;
	}
	renderTable(writer, {
		headers: ["TAG", "ARTICLES", "ID"],
		rows: tags.map((tag) => [
			truncate(tag.name, 40),
			String(tag.articleCount),
			truncate(tag.id, 32),
		]),
	});
}

export function renderDashboard(
	writer: Writer,
	stats: DashboardResponse,
): void {
	renderTable(writer, {
		headers: ["METRIC", "COUNT"],
		rows: [
			["All articles", String(stats.total)],
			["Unread", String(stats.unread)],
			["Read", String(stats.read)],
			["Saved this week", String(stats.savedThisWeek)],
			["Read this week", String(stats.readThisWeek)],
		],
	});
}

function articleState(article: Article): string {
	const values = [article.isRead ? "read" : "unread"];
	if (article.isFavorite) {
		values.push("favorite");
	}
	return values.join(", ");
}

function renderTable(
	writer: Writer,
	{
		headers,
		rows,
	}: {
		headers: string[];
		rows: string[][];
	},
): void {
	const widths = headers.map((header, index) =>
		Math.max(
			header.length,
			...rows.map((row) => displayWidth(row[index] ?? "")),
		),
	);
	const renderRow = (row: string[]) =>
		row
			.map((value, index) =>
				value.padEnd(
					(widths[index] ?? displayWidth(value)) -
						displayWidth(value) +
						value.length,
				),
			)
			.join("  ")
			.trimEnd();

	writeLine(writer, renderRow(headers));
	writeLine(writer, widths.map((width) => "-".repeat(width)).join("  "));
	for (const row of rows) {
		writeLine(writer, renderRow(row));
	}
}

function displayWidth(value: string): number {
	return [...value].length;
}

function truncate(value: string, maximum: number): string {
	const characters = [...value];
	return characters.length <= maximum
		? value
		: `${characters.slice(0, maximum - 1).join("")}…`;
}
