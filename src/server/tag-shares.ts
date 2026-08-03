import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { requireUserId } from "#/server/helpers";
import { createTagSharesRepository } from "#/server/tag-shares-repository";
import {
	handleCreateTagShare,
	handleGetSharedTag,
	handleGetTagShare,
	handleRevokeTagShare,
	validateSharedTagInput,
	validateTagShareInput,
} from "#/server/tag-shares-runtime";

export const getTagShare = createServerFn({ method: "GET" })
	.validator(validateTagShareInput)
	.handler(async ({ data }) =>
		handleGetTagShare(data, {
			createRepository: createTagSharesRepository,
			requireUserIdFn: requireUserId,
		}),
	);

export const createTagShare = createServerFn({ method: "POST" })
	.validator(validateTagShareInput)
	.handler(async ({ data }) =>
		handleCreateTagShare(data, {
			createRepository: createTagSharesRepository,
			requireUserIdFn: requireUserId,
		}),
	);

export const revokeTagShare = createServerFn({ method: "POST" })
	.validator(validateTagShareInput)
	.handler(async ({ data }) =>
		handleRevokeTagShare(data, {
			createRepository: createTagSharesRepository,
			requireUserIdFn: requireUserId,
		}),
	);

export const getSharedTag = createServerFn({ method: "GET" })
	.validator(validateSharedTagInput)
	.handler(async ({ data }) => {
		setResponseHeader("Cache-Control", "no-store");
		setResponseHeader("Referrer-Policy", "no-referrer");
		setResponseHeader("X-Robots-Tag", "noindex, nofollow");
		return handleGetSharedTag(data, {
			createRepository: createTagSharesRepository,
		});
	});
