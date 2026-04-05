import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";

type CreateTagFormFieldsProps = {
	name: string;
	error: string;
	onNameChange: (value: string) => void;
	inputRef: React.RefObject<HTMLInputElement | null>;
};

export function CreateTagFormFields({
	name,
	error,
	onNameChange,
	inputRef,
}: CreateTagFormFieldsProps) {
	return (
		<div className="space-y-2">
			<Label htmlFor="tag-name">Name</Label>
			<Input
				ref={inputRef}
				id="tag-name"
				value={name}
				onChange={(e) => onNameChange(e.target.value)}
				placeholder="e.g. Design, Engineering..."
				autoFocus
				aria-invalid={!!error}
			/>
		</div>
	);
}
