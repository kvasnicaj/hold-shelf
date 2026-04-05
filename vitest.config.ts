import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

const plugins = [
	tsconfigPaths({ projects: ["./tsconfig.json"] }),
	viteReact({
		babel: {
			plugins: ["babel-plugin-react-compiler"],
		},
	}),
];

export default defineConfig({
	test: {
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
