import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";

const meta = {
	title: "UI/Card",
	component: Card,
	render: (args) => (
		<Card {...args}>
			<CardHeader>
				<CardTitle>A shelf for your ideas</CardTitle>
				<CardDescription>Save something worth returning to.</CardDescription>
				<CardAction>
					<Button size="sm" variant="ghost">
						Edit
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent>
				<p className="text-sm">
					Your saved articles stay together with their tags and reading
					position.
				</p>
			</CardContent>
			<CardFooter>
				<Button>Save a link</Button>
			</CardFooter>
		</Card>
	),
	decorators: [
		(Story) => (
			<div className="w-[min(24rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
