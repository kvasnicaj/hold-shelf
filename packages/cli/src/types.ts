import type { CredentialStore } from "./auth/credential-store.js";

export type Writer = {
	write: (value: string) => unknown;
};

export type CliInput = AsyncIterable<string | Uint8Array> & {
	isTTY?: boolean;
};

export type CliEnvironment = Record<string, string | undefined>;

export type RuntimeDependencies = {
	env: CliEnvironment;
	stdin: CliInput;
	stdout: Writer & { isTTY?: boolean };
	stderr: Writer & { isTTY?: boolean };
	fetch: typeof fetch;
	createCredentialStore: () => Promise<CredentialStore>;
	promptForToken: () => Promise<string>;
	confirm: (message: string) => Promise<boolean>;
};

export type GlobalOptions = {
	json: boolean;
	server?: string;
	timeout: number;
	color: boolean;
};

export type CredentialSource = "environment" | "keyring";
