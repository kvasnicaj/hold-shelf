import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef } from "react";
import { fn } from "storybook/test";
import { CreateTagFormFields } from "#/components/tags/create-tag-form-fields";
import { useStoryState } from "#/stories/use-story-state";

const meta = {
	title: "Tags/Create form fields",
	component: CreateTagFormFields,
	args: {
		name: "",
		error: "",
		onNameChange: fn(),
		inputRef: { current: null },
	},
	render: function Render(initialArgs) {
		const inputRef = useRef<HTMLInputElement>(null);
		const [args, updateArgs] = useStoryState(initialArgs);
		return (
			<CreateTagFormFields
				{...args}
				inputRef={inputRef}
				onNameChange={(name) => {
					args.onNameChange(name);
					updateArgs({ name });
				}}
			/>
		);
	},
	decorators: [
		(Story) => (
			<div className="w-[min(24rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof CreateTagFormFields>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const Filled: Story = { args: { name: "Design" } };
export const Failure: Story = {
	args: { name: "Design", error: "A tag with this name already exists." },
};
