import { ShortcutKeys } from "#/components/shortcuts/shortcut-keys";
import type { ShortcutDescription } from "#/components/shortcuts/types";

type ShortcutGroupProps = {
	title: string;
	shortcuts: ShortcutDescription[];
};

export function ShortcutGroup({ title, shortcuts }: ShortcutGroupProps) {
	return (
		<section className="space-y-1">
			<h3 className="text-xs font-semibold text-muted-foreground">{title}</h3>
			<ul className="divide-y">
				{shortcuts.map((shortcut) => (
					<li
						key={shortcut.label}
						className="flex items-center justify-between gap-4 py-2 text-sm"
					>
						<span>{shortcut.label}</span>
						<ShortcutKeys keys={shortcut.keys} />
					</li>
				))}
			</ul>
		</section>
	);
}
