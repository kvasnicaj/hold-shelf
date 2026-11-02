import babel from "@rolldown/plugin-babel";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const plugins = [viteReact(), babel({ presets: [reactCompilerPreset()] })];

// The @storybook/addon-vitest UI collects coverage in a browser-only project.
const storybookCoverage = process.env.VITEST_STORYBOOK === "true";

export default defineConfig({
	resolve: {
		tsconfigPaths: true,
	},
	test: {
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
			include: storybookCoverage
				? ["src/components/**/*.{ts,tsx}", "src/hooks/**/*.{ts,tsx}"]
				: ["src/**/*.{ts,tsx}"],
			exclude: [
				"src/**/*.stories.{ts,tsx}",
				"src/stories/**",
				"src/**/*.test.{ts,tsx}",
				"src/test/**",
				"src/routeTree.gen.ts",
				"src/env.d.ts",
			],
		},
		projects: [
			"./.storybook/vitest.config.ts",
			{
				plugins,
				test: {
					name: "server",
					environment: "node",
					include: ["src/**/*.test.ts"],
					setupFiles: ["src/test/setup-node.ts"],
					clearMocks: true,
					mockReset: true,
					restoreMocks: true,
				},
			},
			{
				plugins,
				test: {
					name: "ui",
					environment: "jsdom",
					environmentOptions: {
						jsdom: {
							url: "http://localhost",
						},
					},
					include: ["src/**/*.test.tsx"],
					setupFiles: ["src/test/setup-ui.ts"],
					clearMocks: true,
					mockReset: true,
					restoreMocks: true,
				},
			},
		],
	},
});
