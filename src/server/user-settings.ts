import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { getDb } from "#/db/index";
import { user } from "#/db/schema";
import { requireUserId } from "#/server/helpers";
import {
	updateUserSettingsInputSchema,
	validateInput,
} from "#/server/input-schemas";
import {
	getUserSettingsForUser,
	updateUserSettingsForUser,
} from "#/server/user-settings-service";

function createUserSettingsRepository() {
	const db = getDb();

	return {
		getUserSettings: async (userId: string) => {
			const [settings] = await db
				.select({
					markReadOnOpen: user.markReadOnOpen,
				})
				.from(user)
				.where(eq(user.id, userId))
				.limit(1);

			return settings ?? null;
		},
		updateUserSettings: async ({
			userId,
			settings,
		}: {
			userId: string;
			settings: { markReadOnOpen: boolean };
		}) => {
			await db
				.update(user)
				.set({
					markReadOnOpen: settings.markReadOnOpen,
				})
				.where(eq(user.id, userId));
		},
	};
}

export const getUserSettings = createServerFn({ method: "GET" }).handler(
	async () =>
		getUserSettingsForUser({
			repo: createUserSettingsRepository(),
			userId: await requireUserId(),
		}),
);

export const updateUserSettings = createServerFn({ method: "POST" })
	.inputValidator((input) =>
		validateInput(
			updateUserSettingsInputSchema,
			input,
			"Invalid user settings update.",
		),
	)
	.handler(async ({ data }) =>
		updateUserSettingsForUser({
			repo: createUserSettingsRepository(),
			userId: await requireUserId(),
			settings: data,
		}),
	);
