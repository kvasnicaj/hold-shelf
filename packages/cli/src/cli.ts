import { confirm, password } from "@inquirer/prompts";
import { Command, CommanderError } from "commander";
import { createSystemCredentialStore } from "./auth/keyring-credential-store.js";
import { registerArticleCommands } from "./commands/articles.js";
import { registerAuthCommands } from "./commands/auth.js";
import { registerDashboardCommand } from "./commands/dashboard.js";
import { registerTagCommands } from "./commands/tags.js";
import { CliError } from "./errors.js";
import { positiveInteger, redactSecrets } from "./helpers.js";
import type { RuntimeDependencies } from "./types.js";

export function createDefaultDependencies(): RuntimeDependencies {
	return {
		env: process.env,
		stdin: process.stdin,
		stdout: process.stdout,
		stderr: process.stderr,
		fetch,
		createCredentialStore: createSystemCredentialStore,
		promptForToken: () =>
			password({ message: "Personal API token:", mask: "*" }),
		confirm: (message) => confirm({ message, default: false }),
	};
}

export function createCli(dependencies: RuntimeDependencies): Command {
	const program = new Command()
		.name("hold-shelf")
		.description("Hold Shelf command-line client")
		.version("0.1.0")
		.option("--json", "Write stable JSON to stdout")
		.option("--server <url>", "Hold Shelf service URL")
		.option(
			"--timeout <milliseconds>",
			"Request timeout in milliseconds",
			(value: string) => positiveInteger(value, "--timeout", 300_000),
			15_000,
		)
		.option("--no-color", "Disable colored output")
		.showHelpAfterError()
		.configureOutput({
			writeOut: (value) => dependencies.stdout.write(value),
			writeErr: (value) => dependencies.stderr.write(value),
			outputError: (value, write) => write(redactSecrets(value)),
		})
		.exitOverride();

	registerAuthCommands(program, dependencies);
	registerArticleCommands(program, dependencies);
	registerTagCommands(program, dependencies);
	registerDashboardCommand(program, dependencies);
	program.action(() => program.help());
	return program;
}

export async function runCli(
	argv: string[],
	dependencies: RuntimeDependencies = createDefaultDependencies(),
): Promise<number> {
	try {
		await createCli(dependencies).parseAsync(argv, { from: "node" });
		return 0;
	} catch (error) {
		if (error instanceof CommanderError) {
			return ["commander.helpDisplayed", "commander.version"].includes(
				error.code,
			)
				? 0
				: 2;
		}
		if (error instanceof CliError) {
			dependencies.stderr.write(`Error: ${redactSecrets(error.message)}\n`);
			return error.exitCode;
		}
		dependencies.stderr.write(
			`Error: ${redactSecrets(error instanceof Error ? error.message : error)}\n`,
		);
		return 1;
	}
}
