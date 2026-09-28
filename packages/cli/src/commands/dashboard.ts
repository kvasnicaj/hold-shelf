import type { Command } from "commander";
import { renderDashboard, writeJson } from "../output/render.js";
import type { RuntimeDependencies } from "../types.js";
import { createAuthenticatedContext } from "./helpers.js";

export function registerDashboardCommand(
	root: Command,
	dependencies: RuntimeDependencies,
): void {
	root
		.command("dashboard")
		.description("Show library and weekly reading statistics")
		.action(async (_localOptions: object, command: Command) => {
			const context = await createAuthenticatedContext(command, dependencies);
			const stats = await context.client.dashboard();
			if (context.options.json) {
				writeJson(dependencies.stdout, stats);
			} else {
				renderDashboard(dependencies.stdout, stats);
			}
		});
}
