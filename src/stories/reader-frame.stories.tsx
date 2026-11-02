import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { ReaderBody } from "#/components/article-reader/reader-body";
import { ReaderCloseButton } from "#/components/article-reader/reader-close-button";
import { ReaderFrame } from "#/components/article-reader/reader-frame";
import { Button } from "#/components/ui/button";
import { sampleReader, sampleSettings } from "#/stories/fixtures";
import { useStoryState } from "#/stories/use-story-state";

const meta = {
	title: "Reader/Frame",
	component: ReaderFrame,
	args: {
		open: true,
		onClose: fn(),
		children: (
			<div className="flex h-full flex-col p-4">
				<ReaderCloseButton onClick={fn()} />
				<ReaderBody data={sampleReader} settings={sampleSettings} />
			</div>
		),
	},
	parameters: {
		layout: "fullscreen",
		docs: { story: { inline: false, height: "600px" } },
	},
	render: function Render(initialArgs) {
		const [args, updateArgs] = useStoryState(initialArgs);
		const close = () => {
			args.onClose();
			updateArgs({ open: false });
		};
		return (
			<>
				<Button onClick={() => updateArgs({ open: true })}>Open reader</Button>
				<ReaderFrame {...args} onClose={close}>
					<div className="flex h-full flex-col">
						<ReaderCloseButton onClick={close} />
						<ReaderBody data={sampleReader} settings={sampleSettings} />
					</div>
				</ReaderFrame>
			</>
		);
	},
} satisfies Meta<typeof ReaderFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};
export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
export const Wide: Story = {
	globals: { viewport: { value: "wide", isRotated: false } },
};
export const KeyboardDismissal: Story = {
	args: { open: false },
	globals: { viewport: { value: "tablet", isRotated: false } },
	play: async ({ canvas, canvasElement, args }) => {
		const trigger = canvas.getByRole("button", { name: "Open reader" });
		const body = within(canvasElement.ownerDocument.body);
		await userEvent.click(trigger);
		await expect(
			await body.findByRole("dialog", { name: "Article reader" }),
		).toBeVisible();
		await userEvent.keyboard("{Escape}");
		await waitFor(() =>
			expect(
				body.queryByRole("dialog", { name: "Article reader" }),
			).not.toBeInTheDocument(),
		);
		await expect(args.onClose).toHaveBeenCalledOnce();
		await waitFor(() => expect(trigger).toHaveFocus());
	},
};
