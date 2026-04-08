import { describe, expect, it, vi } from "vitest";
import {
	getUserSettingsForUser,
	updateUserSettingsForUser,
} from "#/server/user-settings-service";

describe("user-settings-service", () => {
	it("returns the persisted settings for the authenticated user", async () => {
		const repo = {
			getUserSettings: vi.fn().mockResolvedValue({ markReadOnOpen: true }),
			updateUserSettings: vi.fn(),
		};

		const result = await getUserSettingsForUser({
			repo,
			userId: "user-1",
		});

		expect(repo.getUserSettings).toHaveBeenCalledWith("user-1");
		expect(result).toEqual({ markReadOnOpen: true });
	});

	it("updates only the authenticated user's settings", async () => {
		const repo = {
			getUserSettings: vi.fn(),
			updateUserSettings: vi.fn().mockResolvedValue(undefined),
		};

		const result = await updateUserSettingsForUser({
			repo,
			userId: "user-1",
			settings: { markReadOnOpen: false },
		});

		expect(repo.updateUserSettings).toHaveBeenCalledWith({
			userId: "user-1",
			settings: { markReadOnOpen: false },
		});
		expect(result).toEqual({ success: true });
	});
});
