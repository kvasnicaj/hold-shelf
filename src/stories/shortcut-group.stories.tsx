import type { Meta, StoryObj } from "@storybook/react-vite";
import { NAVIGATION_SHORTCUTS } from "#/components/shortcuts/helpers";
import { ShortcutGroup } from "#/components/shortcuts/shortcut-group";

const meta = {
	title: "Shortcuts/Group",
	component: ShortcutGroup,
	args: { title: "Navigation", shortcuts: NAVIGATION_SHORTCUTS },
	decorators: [
		(Story) => (
			<div className="w-[min(24rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ShortcutGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
