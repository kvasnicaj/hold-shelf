import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { UsageError } from "../errors.js";
import type { CliEnvironment } from "../types.js";

export const DEFAULT_SERVER_URL = "https://hold-shelf.com";

type SavedConfig = {
	server?: string;
};

export function getConfigPath(env: CliEnvironment): string {
	if (env.HOLD_SHELF_CONFIG_HOME?.trim()) {
		return join(env.HOLD_SHELF_CONFIG_HOME.trim(), "config.json");
	}
	const base = env.XDG_CONFIG_HOME?.trim() || join(homedir(), ".config");
	return join(base, "hold-shelf", "config.json");
}

export async function resolveServerUrl({
	commandValue,
	env,
}: {
	commandValue?: string;
	env: CliEnvironment;
}): Promise<string> {
	const explicitValue = commandValue ?? env.HOLD_SHELF_URL;
	if (explicitValue !== undefined) {
		return normalizeServerUrl(explicitValue);
	}

	const saved = await readSavedConfig(env);
	return normalizeServerUrl(saved.server ?? DEFAULT_SERVER_URL);
}

export function normalizeServerUrl(value: string): string {
	let url: URL;
	try {
		url = new URL(value.trim());
	} catch {
		throw new UsageError("Server must be a valid URL.");
	}

	const localhost = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
	if (url.protocol !== "https:" && !(url.protocol === "http:" && localhost)) {
		throw new UsageError(
			"Server must use HTTPS (HTTP is allowed only for localhost development).",
		);
	}
	if (url.username || url.password || url.search || url.hash) {
		throw new UsageError(
			"Server URL cannot contain credentials, a query, or a fragment.",
		);
	}

	url.pathname = url.pathname.replace(/\/+$/, "");
	return url.toString().replace(/\/$/, "");
}

export async function saveServerUrl(
	server: string,
	env: CliEnvironment,
): Promise<void> {
	const configPath = getConfigPath(env);
	const temporaryPath = `${configPath}.${process.pid}.tmp`;
	await mkdir(dirname(configPath), { recursive: true, mode: 0o700 });
	await writeFile(temporaryPath, `${JSON.stringify({ server }, null, 2)}\n`, {
		mode: 0o600,
	});
	await rename(temporaryPath, configPath);
}

async function readSavedConfig(env: CliEnvironment): Promise<SavedConfig> {
	try {
		const parsed: unknown = JSON.parse(
			await readFile(getConfigPath(env), "utf8"),
		);
		if (
			typeof parsed !== "object" ||
			parsed === null ||
			Array.isArray(parsed)
		) {
			return {};
		}
		const server = Reflect.get(parsed, "server");
		return typeof server === "string" ? { server } : {};
	} catch (error) {
		if (isMissingFileError(error)) {
			return {};
		}
		throw new UsageError("Could not read the Hold Shelf configuration file.");
	}
}

function isMissingFileError(error: unknown): boolean {
	return (
		typeof error === "object" &&
		error !== null &&
		Reflect.get(error, "code") === "ENOENT"
	);
}
