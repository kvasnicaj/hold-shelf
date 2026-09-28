export type ApiTokenRecord = {
	tokenPrefix: string;
	createdAt: Date;
	lastUsedAt: Date | null;
};

export const PERSONAL_API_TOKEN_PATTERN = /^hs_[A-Za-z0-9_-]{43}$/;

export type GeneratedApiTokenRecord = ApiTokenRecord & {
	token: string;
};

export type ApiTokensRepository = {
	getApiToken: (userId: string) => Promise<ApiTokenRecord | null>;
	findUserIdByTokenHash?: (tokenHash: string) => Promise<string | null>;
	markApiTokenUsed?: (tokenHash: string) => Promise<void>;
	upsertApiToken: (args: {
		userId: string;
		tokenHash: string;
		tokenPrefix: string;
	}) => Promise<ApiTokenRecord>;
	deleteApiToken: (userId: string) => Promise<void>;
};

export async function getApiTokenForUser({
	repo,
	userId,
}: {
	repo: ApiTokensRepository;
	userId: string;
}) {
	return repo.getApiToken(userId);
}

export async function generateApiTokenForUser({
	repo,
	userId,
	generateTokenFn = generateApiToken,
	hashTokenFn = hashApiToken,
}: {
	repo: ApiTokensRepository;
	userId: string;
	generateTokenFn?: () => string;
	hashTokenFn?: (token: string) => Promise<string>;
}): Promise<GeneratedApiTokenRecord> {
	const token = generateTokenFn();
	const tokenHash = await hashTokenFn(token);
	const saved = await repo.upsertApiToken({
		userId,
		tokenHash,
		tokenPrefix: token.slice(0, 12),
	});

	return {
		...saved,
		token,
	};
}

export async function revokeApiTokenForUser({
	repo,
	userId,
}: {
	repo: ApiTokensRepository;
	userId: string;
}) {
	await repo.deleteApiToken(userId);
	return { success: true };
}

function generateApiToken() {
	const bytes = new Uint8Array(32);
	crypto.getRandomValues(bytes);
	return `hs_${base64UrlEncode(bytes)}`;
}

export async function hashApiToken(token: string) {
	const data = new TextEncoder().encode(token);
	const digest = await crypto.subtle.digest("SHA-256", data);
	return Array.from(new Uint8Array(digest))
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
}

function base64UrlEncode(bytes: Uint8Array) {
	let binary = "";
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}

	return btoa(binary)
		.replaceAll("+", "-")
		.replaceAll("/", "_")
		.replaceAll("=", "");
}
