import { ApiClient } from "../api/client.js";
import { AuthenticationError } from "../errors.js";
import { validateToken } from "../helpers.js";
import type {
	CredentialSource,
	GlobalOptions,
	RuntimeDependencies,
} from "../types.js";

export type AuthenticatedClient = {
	client: ApiClient;
	token: string;
	source: CredentialSource;
};

export async function getAuthenticatedClient({
	server,
	options,
	dependencies,
}: {
	server: string;
	options: GlobalOptions;
	dependencies: RuntimeDependencies;
}): Promise<AuthenticatedClient> {
	const environmentToken = dependencies.env.HOLD_SHELF_TOKEN;
	if (environmentToken?.trim()) {
		const token = validateToken(environmentToken);
		return {
			client: createClient(server, token, options, dependencies),
			token,
			source: "environment",
		};
	}

	let token: string | null;
	try {
		token = await (await dependencies.createCredentialStore()).get(server);
	} catch {
		throw new AuthenticationError(
			"No secure credential store is available. Set HOLD_SHELF_TOKEN for this invocation.",
		);
	}
	if (!token) {
		throw new AuthenticationError(
			"Not logged in. Run `hold-shelf auth login` or set HOLD_SHELF_TOKEN.",
		);
	}

	try {
		token = validateToken(token);
	} catch {
		throw new AuthenticationError(
			"The saved credential is invalid. Run `hold-shelf auth login` again.",
		);
	}
	return {
		client: createClient(server, token, options, dependencies),
		token,
		source: "keyring",
	};
}

export function createClient(
	server: string,
	token: string,
	options: GlobalOptions,
	dependencies: RuntimeDependencies,
): ApiClient {
	return new ApiClient({
		server,
		token,
		timeout: options.timeout,
		fetchImplementation: dependencies.fetch,
	});
}
