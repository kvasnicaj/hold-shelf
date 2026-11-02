import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig, mergeConfig } from "vitest/config";
import storybookViteConfig from "./vite.config.ts";

const theme = process.env.STORYBOOK_THEME === "dark" ? "dark" : "light";

export default mergeConfig(
	storybookViteConfig,
	defineConfig({
		plugins: [
			storybookTest({
				configDir: fileURLToPath(new URL("./", import.meta.url)),
				storybookScript: "pnpm storybook",
				initialGlobals: { theme },
			}),
		],
		test: {
			name: "storybook",
			// Storybook defaults to read-only. Permit failure screenshots on loopback.
			api: { host: "127.0.0.1", allowWrite: true },
			attachmentsDir: `test-results/storybook-${theme}-attachments`,
			clearMocks: true,
			testTimeout: 15_000,
			maxWorkers: 4,
			browser: {
				enabled: true,
				headless: true,
				provider: playwright(),
				instances: [{ browser: "chromium" }],
				screenshotFailures: true,
				screenshotDirectory: fileURLToPath(
					new URL(
						`../test-results/storybook-${theme}-screenshots`,
						import.meta.url,
					),
				),
			},
			reporters: [
				"default",
				["junit", { outputFile: `test-results/storybook-${theme}.xml` }],
			],
			coverage: {
				provider: "v8",
				reportsDirectory: `coverage/storybook/${theme}`,
				reporter: ["text", "html", "lcov"],
				include: ["src/components/**/*.{ts,tsx}", "src/hooks/**/*.{ts,tsx}"],
				exclude: ["**/*.test.{ts,tsx}", "**/*.stories.{ts,tsx}"],
			},
		},
	}),
);
