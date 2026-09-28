export class CliError extends Error {
	readonly exitCode: number;
	readonly code: string;

	constructor(message: string, exitCode = 1, code = "CLI_ERROR") {
		super(message);
		this.name = "CliError";
		this.exitCode = exitCode;
		this.code = code;
	}
}

export class UsageError extends CliError {
	constructor(message: string) {
		super(message, 2, "INVALID_USAGE");
		this.name = "UsageError";
	}
}

export class AuthenticationError extends CliError {
	constructor(message: string) {
		super(message, 3, "AUTHENTICATION_FAILED");
		this.name = "AuthenticationError";
	}
}

export class NotFoundError extends CliError {
	constructor(message: string) {
		super(message, 4, "NOT_FOUND");
		this.name = "NotFoundError";
	}
}

export class TemporaryError extends CliError {
	constructor(message: string, code = "TEMPORARY_FAILURE") {
		super(message, 5, code);
		this.name = "TemporaryError";
	}
}
