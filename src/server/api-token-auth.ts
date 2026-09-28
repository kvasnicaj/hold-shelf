import {
	type ApiTokensRepository,
	hashApiToken,
	PERSONAL_API_TOKEN_PATTERN,
} from "#/server/api-tokens-service";

export async function getUserIdFromBearerToken({
	authorization,
	repo,
}: {
	authorization: string | null;
	repo: Pick<ApiTokensRepository, "findUserIdByTokenHash" | "markApiTokenUsed">;
}) {
	const token = parseBearerToken(authorization);
	if (!token || !repo.findUserIdByTokenHash) {
		return null;
	}

	const tokenHash = await hashApiToken(token);
	const userId = await repo.findUserIdByTokenHash(tokenHash);
	if (!userId) {
		return null;
	}

	await repo.markApiTokenUsed?.(tokenHash);
	return userId;
}

function parseBearerToken(authorization: string | null) {
	const [scheme, token, extra] = authorization?.trim().split(/\s+/) ?? [];

	if (
		scheme?.toLowerCase() !== "bearer" ||
		!token ||
		extra ||
		!PERSONAL_API_TOKEN_PATTERN.test(token)
	) {
		return null;
	}

	return token;
}
