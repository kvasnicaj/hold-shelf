/** Human output must never execute terminal commands from remote article text. */
export function safeTerminalText(value: string): string {
	// Keep intentional newlines/tabs, but remove C0/C1/DEL (including ESC/BEL,
	// carriage returns and backspaces). Also drop bidi formatting controls.
	return [...value]
		.filter((character) => {
			const point = character.codePointAt(0) ?? 0;
			return (
				(point === 9 || point === 10 || point >= 32) &&
				!isFormattingControl(point)
			);
		})
		.join("");
}

export function terminalSafeJson(value: unknown): string {
	return [...JSON.stringify(value, null, 2)]
		.map((character) => {
			const point = character.codePointAt(0) ?? 0;
			return isFormattingControl(point)
				? `\\u${point.toString(16).padStart(4, "0")}`
				: character;
		})
		.join("");
}

function isFormattingControl(point: number): boolean {
	return (
		(point >= 0x7f && point <= 0x9f) ||
		(point >= 0x202a && point <= 0x202e) ||
		(point >= 0x2066 && point <= 0x2069)
	);
}
