import type { Tag } from "#/components/tags/types";

export type ArticleWithTags = {
	id: string;
	url: string;
	title: string | null;
	description: string | null;
	hostname: string | null;
	faviconUrl: string | null;
	isRead: boolean;
	isFavorite: boolean;
	createdAt: Date | null;
	tags: Tag[];
};

export type ArticleCollectionLoaderData = {
	articles: {
		items: ArticleWithTags[];
		total: number;
	};
	tags: Tag[];
};

export type ArticleCollectionSearch = {
	q?: string;
	sort?: "newest" | "oldest" | "title";
	page?: number;
	tag?: string;
};

export type ArticleCollectionFilters = {
	isRead?: boolean;
	isFavorite?: boolean;
	tagId?: string;
};

export type ArticleCollectionQueryKey = string;

export type ArticleCollectionNavigate = (options: {
	search: (
		prev: ArticleCollectionSearch,
	) => Partial<ArticleCollectionSearch> | ArticleCollectionSearch;
	replace: boolean;
}) => void | Promise<void>;

export type ArticleCardProps = {
	article: ArticleWithTags;
	selected: boolean;
	onSelect: (id: string, selected: boolean) => void;
	onOpenArticle: (id: string, isRead: boolean) => void | Promise<void>;
	onToggleRead: (id: string, isRead: boolean) => void;
	onToggleFavorite: (id: string, isFavorite: boolean) => void;
	onDelete: (id: string) => void;
	availableTags?: Tag[];
	onAddTag?: (tagId: string, articleIds: string[]) => void;
	onRemoveTag?: (tagId: string, articleIds: string[]) => void;
	onCreateTag?: (name: string) => Promise<Tag>;
};
