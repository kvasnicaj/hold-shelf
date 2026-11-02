import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
	stories: ["../src/**/*.stories.@(ts|tsx)"],
	addons: [
		"@storybook/addon-docs",
		"@storybook/addon-themes",
		"@storybook/addon-a11y",
		"@storybook/addon-vitest",
	],
	framework: {
		name: "@storybook/react-vite",
		options: {
			builder: {
				// Keep Cloudflare and TanStack Start out of the component preview.
				viteConfigPath: fileURLToPath(
					new URL("./vite.config.ts", import.meta.url),
				),
			},
		},
	},
	staticDirs: ["../public"],
	core: { disableTelemetry: true },
};

export default config;
