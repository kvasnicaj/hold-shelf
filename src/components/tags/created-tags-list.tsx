import { Badge } from "#/components/ui/badge";

type CreatedTagsListProps = {
	created: string[];
};

export function CreatedTagsList({ created }: CreatedTagsListProps) {
	if (created.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-wrap gap-1.5">
			{created.map((tag) => (
				<Badge key={tag} variant="secondary">
					{tag}
				</Badge>
			))}
		</div>
	);
}
