import type { BetterAuthOptions } from "better-auth";
import { getAuthBaseUrlConfig } from "#/lib/auth-base-url";

function removeProviderTokens<T extends object>(account: T) {
	// GitHub is an identity provider, not an API integration. Its tokens are
	// needed during the OAuth exchange only, never in the durable account row.
	return Promise.resolve({
		data: {
			...account,
			accessToken: null,
			refreshToken: null,
			idToken: null,
			accessTokenExpiresAt: null,
			refreshTokenExpiresAt: null,
		},
	});
}

export function getAuthSecurityOptions(
	fallbackBaseUrl: string,
	isDevelopment = false,
) {
	return {
		baseURL: getAuthBaseUrlConfig(fallbackBaseUrl, isDevelopment),
		advanced: {
			useSecureCookies: !isDevelopment,
			disableOriginCheck: false,
			disableCSRFCheck: false,
			ipAddress: {
				ipAddressHeaders: isDevelopment ? [] : ["cf-connecting-ip"],
			},
		},
		account: { storeAccountCookie: false },
		databaseHooks: {
			account: {
				create: { before: removeProviderTokens },
				update: { before: removeProviderTokens },
			},
		},
	} satisfies BetterAuthOptions;
}

export function expireLegacyAuthCookies(
	request: Request,
	response: Response,
	isDevelopment = false,
) {
	if (isDevelopment) return response;
	const legacyNames = new Set(
		(request.headers.get("cookie") ?? "")
			.split(";")
			.map((part) => part.split("=", 1)[0].trim())
			.filter((name) =>
				/^better-auth\.(?:session_token|session_data|account_data|dont_remember|oauth_state|state)(?:\.\d+)?$/.test(
					name,
				),
			),
	);
	if (!legacyNames.size) return response;
	const updated = new Response(response.body, response);
	for (const name of legacyNames) {
		updated.headers.append(
			"Set-Cookie",
			`${name}=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Lax`,
		);
	}
	return updated;
}
