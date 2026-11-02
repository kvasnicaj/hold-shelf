import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview, ReactRenderer } from "@storybook/react-vite";
import { toast } from "sonner";
import { resetMockApi } from "./mocks/api";
import { resetMockAuth } from "./mocks/auth-client";
import { StoryEnvironment } from "./story-environment";
import "../src/styles.css";

const preview: Preview = {
	tags: ["autodocs"],
	beforeEach: (context) => {
		toast.dismiss();
		resetMockApi(context.parameters.mockScenario);
		resetMockAuth(context.parameters.mockScenario);
		return () => {
			toast.dismiss();
		};
	},
	decorators: [
		(Story, context) => (
			<StoryEnvironment
				key={context.id}
				path={context.parameters.routePath}
				scenario={context.parameters.mockScenario}
				appShell={context.parameters.appShell}
			>
				<Story />
			</StoryEnvironment>
		),
		withThemeByClassName<ReactRenderer>({
			themes: { light: "", dark: "dark" },
			defaultTheme: "light",
		}),
	],
	parameters: {
		a11y: {
			test: "error",
			// Vitest's test widget synchronizes every report. Keep complete failures
			// there; the preview panel retains full diagnostics and review items.
			options:
				import.meta.env.VITEST_STORYBOOK === undefined
					? {}
					: { reporter: "no-passes", resultTypes: ["violations"] },
		},
		layout: "centered",
		// The app's CSS tokens provide the surface in each theme.
		backgrounds: { disable: true },
		viewport: {
			options: {
				phone: {
					name: "Phone",
					styles: { width: "390px", height: "844px" },
					type: "mobile",
				},
				tablet: {
					name: "Tablet",
					styles: { width: "768px", height: "1024px" },
					type: "tablet",
				},
				desktop: {
					name: "Desktop",
					styles: { width: "1280px", height: "900px" },
					type: "desktop",
				},
				wide: {
					name: "Wide desktop",
					styles: { width: "1728px", height: "1000px" },
					type: "desktop",
				},
			},
		},
		controls: {
			matchers: { color: /(background|color)$/i, date: /Date$/i },
		},
		options: {
			storySort: {
				order: [
					"Brand",
					"UI",
					"Layout",
					"Articles",
					"Reader",
					"Library",
					"Tags",
					"Home",
					"Search",
					"Save",
					"Settings",
					"Shortcuts",
					"Theme",
					"Public",
					"Documentation",
					"Pages",
				],
			},
		},
	},
};

export default preview;
