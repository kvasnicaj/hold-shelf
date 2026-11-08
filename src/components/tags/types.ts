export type Tag = {
	id: string;
	name: string;
	color: string | null;
	articleCount?: number;
};

export type TagShare = {
	tagId: string;
	token: string;
	createdAt: Date;
};

/** The share request in flight, if any. */
export type SharePending = "load" | "create" | "revoke" | null;
