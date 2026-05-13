import { createServerFn } from "@tanstack/react-start";
import { createApiTokensRepository } from "#/server/api-tokens-repository";
import {
	generateApiTokenForUser,
	getApiTokenForUser,
	revokeApiTokenForUser,
} from "#/server/api-tokens-service";
import { requireUserId } from "#/server/helpers";

export const getApiToken = createServerFn({ method: "GET" }).handler(async () =>
	getApiTokenForUser({
		repo: createApiTokensRepository(),
		userId: await requireUserId(),
	}),
);

export const generateApiToken = createServerFn({ method: "POST" }).handler(
	async () =>
		generateApiTokenForUser({
			repo: createApiTokensRepository(),
			userId: await requireUserId(),
		}),
);

export const revokeApiToken = createServerFn({ method: "POST" }).handler(
	async () =>
		revokeApiTokenForUser({
			repo: createApiTokensRepository(),
			userId: await requireUserId(),
		}),
);
