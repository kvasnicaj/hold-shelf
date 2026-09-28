import type { Command } from "commander";
import { renderTags, writeJson } from "../output/render.js";
import type { RuntimeDependencies } from "../types.js";
import { createAuthenticatedContext } from "./helpers.js";

export function registerTagCommands(
	root: Command,
	dependencies: RuntimeDependencies,
): void {
	root
		.command("tags")
		.description("View article tags")
		.command("list")
		.description("List tags and article counts")
		.action(async (_localOptions: object, command: Command) => {
			const context = await createAuthenticatedContext(command, dependencies);
			const tags = await context.client.listTags();
			if (context.options.json) {
				writeJson(dependencies.stdout, tags);
			} else {
				renderTags(dependencies.stdout, tags);
			}
		});
}
