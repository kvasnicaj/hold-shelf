type ShortcutKeysProps = {
	keys: string[];
};

export function ShortcutKeys({ keys }: ShortcutKeysProps) {
	return (
		<span className="inline-flex items-center gap-1">
			{keys.map((key, index) => (
				<span key={key} className="inline-flex items-center gap-1">
					{index > 0 && (
						<span className="text-[11px] text-muted-foreground">then</span>
					)}
					<kbd>{key}</kbd>
				</span>
			))}
		</span>
	);
}
