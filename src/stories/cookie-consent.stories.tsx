import type { Meta, StoryObj } from "@storybook/react-vite";
import { CookieConsent } from "#/components/privacy/cookie-consent";
import { CookiePreferencesButton } from "#/components/privacy/cookie-preferences-button";

const meta = {
	title: "Public/Cookie consent",
	component: CookieConsent,
	parameters: { layout: "padded" },
	tags: ["!autodocs"],
	render: () => (
		<>
			<CookieConsent />
			<p className="mb-4 text-sm">
				The consent dialog uses the same theme as the app.
			</p>
			<CookiePreferencesButton />
		</>
	),
} satisfies Meta<typeof CookieConsent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
