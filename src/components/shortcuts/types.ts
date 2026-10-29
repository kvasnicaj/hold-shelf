export type ShortcutAction =
	| { type: "save" }
	| { type: "search" }
	| { type: "help" }
	| { type: "prefix" }
	| { type: "navigate"; href: string };

export type ShortcutDescription = {
	keys: string[];
	label: string;
};

export type ShortcutsContextValue = {
	/** Opens the list of keyboard shortcuts. */
	openHelp: () => void;
};
