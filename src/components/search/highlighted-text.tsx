import { getHighlightedParts } from "#/components/search/helpers";

type HighlightedTextProps = {
	text: string;
	query: string;
};

export function HighlightedText({ text, query }: HighlightedTextProps) {
	return getHighlightedParts(text, query).map((part) =>
		part.match ? (
			<mark
				key={`${part.text}-match`}
				className="rounded-sm bg-select px-0.5 text-foreground"
			>
				{part.text}
			</mark>
		) : (
			<span key={part.text}>{part.text}</span>
		),
	);
}
