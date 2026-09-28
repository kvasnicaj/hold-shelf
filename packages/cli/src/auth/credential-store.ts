export type CredentialStore = {
	get: (server: string) => Promise<string | null>;
	set: (server: string, token: string) => Promise<void>;
	delete: (server: string) => Promise<boolean>;
};

export class SecureStoreUnavailableError extends Error {
	constructor() {
		super(
			"The operating system credential store is unavailable. Use HOLD_SHELF_TOKEN for this invocation.",
		);
		this.name = "SecureStoreUnavailableError";
	}
}
