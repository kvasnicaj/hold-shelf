import type { Command } from "commander";
import { createClient, getAuthenticatedClient } from "../auth/helpers.js";
import { resolveServerUrl, saveServerUrl } from "../config/config.js";
import { AuthenticationError } from "../errors.js";
import { maskToken, readAllInput, validateToken } from "../helpers.js";
import { writeJson, writeLine } from "../output/render.js";
import type { RuntimeDependencies } from "../types.js";
import { getGlobalOptions } from "./helpers.js";

type LoginOptions = { tokenStdin?: boolean };

export function registerAuthCommands(
	root: Command,
	dependencies: RuntimeDependencies,
): void {
	const auth = root.command("auth").description("Manage CLI authentication");

	auth
		.command("login")
		.description("Validate and securely save a personal API token")
		.option("--token-stdin", "Read the API token from standard input")
		.addHelpText(
			"after",
			"\nAPI tokens are created in Hold Shelf Settings. Regenerating the single personal token invalidates other integrations.",
		)
		.action(async (localOptions: LoginOptions, command: Command) => {
			const options = getGlobalOptions(command, dependencies);
			const server = await resolveServerUrl({
				commandValue: options.server,
				env: dependencies.env,
			});
			const environmentToken = dependencies.env.HOLD_SHELF_TOKEN?.trim();
			const usesEnvironment =
				!localOptions.tokenStdin && Boolean(environmentToken);
			if (!options.json && !localOptions.tokenStdin && !usesEnvironment) {
				writeLine(
					dependencies.stderr,
					`Create or copy your personal API token at ${new URL("app/settings", `${server}/`).toString()}`,
				);
			}
			const token = validateToken(
				localOptions.tokenStdin
					? await readAllInput(dependencies.stdin)
					: environmentToken || (await dependencies.promptForToken()),
			);
			await createClient(server, token, options, dependencies).me();

			if (usesEnvironment) {
				const result = {
					authenticated: true as const,
					server,
					credentialSource: "environment" as const,
					tokenPrefix: maskToken(token),
					persisted: false,
				};
				if (options.json) {
					writeJson(dependencies.stdout, result);
				} else {
					writeLine(
						dependencies.stdout,
						`Authenticated to ${server} with HOLD_SHELF_TOKEN. The token was not saved.`,
					);
				}
				return;
			}

			try {
				await (await dependencies.createCredentialStore()).set(server, token);
			} catch {
				throw new AuthenticationError(
					"The token is valid, but the operating system credential store is unavailable. Use HOLD_SHELF_TOKEN instead; no plaintext credential was written.",
				);
			}
			await saveServerUrl(server, dependencies.env);
			const result = {
				authenticated: true as const,
				server,
				credentialSource: "keyring" as const,
				tokenPrefix: maskToken(token),
				persisted: true,
			};
			if (options.json) {
				writeJson(dependencies.stdout, result);
			} else {
				writeLine(dependencies.stdout, `Logged in to ${server}.`);
			}
		});

	auth
		.command("logout")
		.description("Remove the locally saved credential")
		.action(async (_localOptions: object, command: Command) => {
			const options = getGlobalOptions(command, dependencies);
			const server = await resolveServerUrl({
				commandValue: options.server,
				env: dependencies.env,
			});
			let removed: boolean;
			try {
				removed = await (await dependencies.createCredentialStore()).delete(
					server,
				);
			} catch {
				throw new AuthenticationError(
					"The operating system credential store is unavailable; no local credential was changed.",
				);
			}
			const environmentActive = Boolean(
				dependencies.env.HOLD_SHELF_TOKEN?.trim(),
			);
			if (options.json) {
				writeJson(dependencies.stdout, {
					removed,
					server,
					environmentCredentialActive: environmentActive,
				});
			} else {
				writeLine(
					dependencies.stdout,
					removed
						? `Removed the saved credential for ${server}.`
						: `No saved credential was found for ${server}.`,
				);
				if (environmentActive) {
					writeLine(
						dependencies.stdout,
						"HOLD_SHELF_TOKEN is still set and is not changed by logout.",
					);
				}
			}
		});

	auth
		.command("status")
		.description("Validate and describe the active credential")
		.action(async (_localOptions: object, command: Command) => {
			const options = getGlobalOptions(command, dependencies);
			const server = await resolveServerUrl({
				commandValue: options.server,
				env: dependencies.env,
			});
			const authenticated = await getAuthenticatedClient({
				server,
				options,
				dependencies,
			});
			await authenticated.client.me();
			const result = {
				authenticated: true as const,
				server,
				credentialSource: authenticated.source,
				tokenPrefix: maskToken(authenticated.token),
			};
			if (options.json) {
				writeJson(dependencies.stdout, result);
			} else {
				writeLine(
					dependencies.stdout,
					`Authenticated to ${server} via ${authenticated.source === "environment" ? "HOLD_SHELF_TOKEN" : "the OS credential store"} (${result.tokenPrefix}).`,
				);
			}
		});
}
