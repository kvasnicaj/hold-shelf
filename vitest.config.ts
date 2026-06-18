import babel from "@rolldown/plugin-babel";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const plugins = [
	viteReact(),
	babel({ presets: [reactCompilerPreset()] }),
];

export default defineConfig({
	resolve: {
		tsconfigPaths: true,
	},
	test: {
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
			include: ["src/**/*.{ts,tsx}"],
			exclude: [
				"src/**/*.test.{ts,tsx}",
				"src/test/**",
				"src/routeTree.gen.ts",
				"src/env.d.ts",
			],
		},
		projects: [
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
