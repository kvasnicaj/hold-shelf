import {
	type CredentialStore,
	SecureStoreUnavailableError,
} from "./credential-store.js";

const SERVICE_NAME = "hold-shelf-cli";

type KeyringEntry = {
	getPassword: () => string;
	setPassword: (token: string) => void;
	deletePassword: () => boolean;
};

type KeyringModule = {
	Entry: new (service: string, account: string) => KeyringEntry;
};

export async function createSystemCredentialStore(): Promise<CredentialStore> {
	let module: KeyringModule;
	try {
		module = (await import("@napi-rs/keyring")) as KeyringModule;
		if (typeof module.Entry !== "function") {
			throw new Error("Entry export is missing");
		}
	} catch {
		throw new SecureStoreUnavailableError();
	}

	const entry = (server: string) => new module.Entry(SERVICE_NAME, server);
	return {
		async get(server) {
			try {
				return entry(server).getPassword();
			} catch (error) {
				return isMissingCredential(error) ? null : Promise.reject(error);
			}
		},
		async set(server, token) {
			entry(server).setPassword(token);
		},
		async delete(server) {
			try {
				return entry(server).deletePassword();
			} catch (error) {
				if (isMissingCredential(error)) {
					return false;
				}
				throw error;
			}
		},
	};
}

function isMissingCredential(error: unknown): boolean {
	const message = error instanceof Error ? error.message : String(error);
	return /no entry|not found|no matching|platform failure.*-25300/i.test(
		message,
	);
}
