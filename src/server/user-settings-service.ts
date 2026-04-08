export type UserSettings = {
	markReadOnOpen: boolean;
};

export type UserSettingsRepository = {
	getUserSettings: (userId: string) => Promise<UserSettings | null>;
	updateUserSettings: (args: {
		userId: string;
		settings: UserSettings;
	}) => Promise<void>;
};

export async function getUserSettingsForUser({
	repo,
	userId,
}: {
	repo: UserSettingsRepository;
	userId: string;
}) {
	const settings = await repo.getUserSettings(userId);

	if (!settings) {
		throw new Error("Unauthorized");
	}

	return settings;
}

export async function updateUserSettingsForUser({
	repo,
	userId,
	settings,
}: {
	repo: UserSettingsRepository;
	userId: string;
	settings: UserSettings;
}) {
	await repo.updateUserSettings({ userId, settings });
	return { success: true as const };
}
