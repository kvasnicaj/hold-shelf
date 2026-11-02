import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
	server: { watch: { ignored: ["**/coverage/**", "**/test-results/**"] } },
	resolve: {
		tsconfigPaths: true,
		alias: [
			{
				find: /^#\/server\/(articles|library|tags|tag-shares|api-tokens|dashboard)$/,
				replacement: fileURLToPath(new URL("./mocks/api.ts", import.meta.url)),
			},
			{
				find: "#/lib/auth-client",
				replacement: fileURLToPath(
					new URL("./mocks/auth-client.ts", import.meta.url),
				),
			},
		],
	},
	plugins: [tailwindcss()],
});
