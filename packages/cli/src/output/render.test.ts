import { describe, expect, it } from "vitest";
import { safeTerminalText } from "./helpers.js";
import { renderTags, writeJson, writeLine } from "./render.js";

describe("terminal-safe output", () => {
	const controls = "\u001b]52;c;Y2xpcGJvYXJk\u0007\u009b2J\r\b\u007f\u202e";

	it("removes terminal commands and display controls but preserves readable text", () => {
		const chunks: string[] = [];
		writeLine(
			{ write: (text) => chunks.push(text) },
			`Title${controls}\nČeský text\tindent`,
		);
		expect(chunks.join("")).toBe(
			"Title]52;c;Y2xpcGJvYXJk2J\nČeský text\tindent\n",
		);
		expect(safeTerminalText("\u001b[31mred\u001b[0m")).toBe("[31mred[0m");
	});

	it("keeps table fields on one line and removes unsafe controls before sizing", () => {
		const chunks: string[] = [];
		renderTags({ write: (text) => chunks.push(text) }, [
			{
				id: "tag-1",
				name: `Title\n${controls}`,
				color: null,
				createdAt: "2026-10-23T12:00:00.000Z",
				articleCount: 1,
			},
		]);
		expect(chunks).toHaveLength(3);
		expect(chunks[2]).not.toContain("\u001b");
		expect(chunks[2]).not.toContain("\u009b");
		expect(chunks[2]?.trim().split("\n")).toHaveLength(1);
	});

	it("escapes JSON including C1 controls without corrupting exported data", () => {
		const chunks: string[] = [];
		const value = { title: controls };
		writeJson({ write: (text) => chunks.push(text) }, value);
		const output = chunks.join("");
		expect(output).not.toContain("\u001b");
		expect(output).not.toContain("\u009b");
		expect(output).not.toContain("\u202e");
		expect(JSON.parse(output)).toEqual(value);
	});
});
