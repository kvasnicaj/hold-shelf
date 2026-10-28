export type QuickSaveMode = "save" | "read";

export type QuickSaveContextValue = {
	/** Opens Quick save, optionally prefilled with a link. */
	open: (url?: string) => void;
};
