import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";

const meta = {
	title: "UI/Select",
	component: Select,
	args: { defaultValue: "newest", onValueChange: fn() },
	render: (args) => (
		<Select {...args}>
			<SelectTrigger aria-label="Sort articles" className="w-52">
				<SelectValue placeholder="Choose order" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>Saved date</SelectLabel>
					<SelectItem value="newest">Newest first</SelectItem>
					<SelectItem value="oldest">Oldest first</SelectItem>
				</SelectGroup>
				<SelectSeparator />
				<SelectItem value="title">Title A–Z</SelectItem>
				<SelectItem value="unavailable" disabled>
					Relevance (unavailable)
				</SelectItem>
			</SelectContent>
		</Select>
	),
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Placeholder: Story = { args: { defaultValue: undefined } };
export const Disabled: Story = { args: { disabled: true } };
