import type { Breadcrumb, BrowserOptions, ErrorEvent } from "@sentry/react";
import { isProductionSentryHostname } from "#/lib/sentry-environment";

type StreamedSpanJSON = Parameters<
	NonNullable<BrowserOptions["beforeSendSpan"]>
>[0];
type Integrations = Exclude<
	NonNullable<BrowserOptions["integrations"]>,
	(...args: never[]) => unknown
>;

const REDACTED = "[redacted]";
const METHODS = new Set([
	"GET",
	"HEAD",
	"POST",
	"PUT",
	"PATCH",
	"DELETE",
	"OPTIONS",
]);
const OPERATIONS = new Set([
	"http.server",
	"http.client",
	"pageload",
	"navigation",
	"resource.script",
	"resource.css",
	"resource.img",
	"db",
	"db.query",
	"function",
	"ui.action",
]);
const ERROR_TYPES = new Set([
	"Error",
	"TypeError",
	"RangeError",
	"SyntaxError",
	"ReferenceError",
	"URIError",
	"EvalError",
	"AggregateError",
	"AbortError",
	"TimeoutError",
]);
const BREADCRUMB_CATEGORIES = new Set(["fetch", "xhr", "navigation"]);
const PUBLIC_PATHS = new Set([
	"/",
	"/login",
	"/about",
	"/privacy",
	"/save",
	"/extension/save",
	"/cli-docs",
	"/api-docs",
	"/api-docs/agents",
	"/app",
	"/app/home",
	"/app/articles",
	"/app/archive",
	"/app/favorites",
	"/app/tags",
	"/app/trash",
	"/app/settings",
	"/api/v1/articles",
	"/api/v1/tags",
	"/api/v1/me",
	"/api/v1/dashboard",
	"/api/extension/articles",
]);

/** URLs are private reading data, not diagnostic labels. Unknown paths fail closed. */
export function sanitizeTelemetryUrl(value: string): string {
	try {
		const url = new URL(value, "https://hold-shelf.com");
		if (!isProductionSentryHostname(url.hostname)) return "[external-url]";
		if (PUBLIC_PATHS.has(url.pathname)) return url.pathname;
		if (url.pathname.startsWith("/share/")) return "/share/[redacted]";
		if (url.pathname.startsWith("/api/auth/")) return "/api/auth/[redacted]";
		if (url.pathname.startsWith("/api/v1/articles/"))
			return "/api/v1/articles/[redacted]";
		if (url.pathname.startsWith("/_serverFn/")) return "/_serverFn/[redacted]";
		return REDACTED;
	} catch {
		return REDACTED;
	}
}

function safeMethod(value: unknown): string | undefined {
	return typeof value === "string" && METHODS.has(value) ? value : undefined;
}

function safeOperation(value: unknown): string {
	return typeof value === "string" && OPERATIONS.has(value)
		? value
		: "application";
}

function safeTraceId(value: unknown, length: number): string | undefined {
	return typeof value === "string" &&
		value.length === length &&
		/^[a-f0-9]+$/i.test(value)
		? value
		: undefined;
}

function safeErrorType(value: unknown): string {
	return typeof value === "string" && ERROR_TYPES.has(value) ? value : "Error";
}

function safeFrameFilename(filename: string | undefined): string | undefined {
	if (!filename) return undefined;
	const clean = filename.replace(/[?#].*$/, "");
	if (/^https?:\/\//i.test(clean)) {
		try {
			const url = new URL(clean);
			return isProductionSentryHostname(url.hostname) &&
				/^\/assets\/[a-zA-Z0-9_.-]+\.js$/.test(url.pathname)
				? `${url.origin}${url.pathname}`
				: REDACTED;
		} catch {
			return REDACTED;
		}
	}
	// Preserve bundled/source module names, not arbitrary filesystem/user paths.
	return /^(?:[\w@.-]+\/)*[\w.-]+\.[cm]?[jt]sx?$/.test(clean)
		? clean
		: REDACTED;
}

/** Never stringify unknown errors: fetch/DB errors can include URLs, SQL values or bodies. */
export function safeErrorDetails(error: unknown): { errorType: string } {
	return {
		errorType: safeErrorType(error instanceof Error ? error.name : undefined),
	};
}

export function sanitizeTelemetryBreadcrumb(
	breadcrumb: Breadcrumb,
): Breadcrumb | null {
	// Console arguments, DOM selectors/text and arbitrary application messages are private.
	if (!BREADCRUMB_CATEGORIES.has(breadcrumb.category ?? "")) return null;
	const data: Record<string, unknown> = {};
	for (const key of ["url", "from", "to"]) {
		const value = breadcrumb.data?.[key];
		if (typeof value === "string") data[key] = sanitizeTelemetryUrl(value);
	}
	const method = safeMethod(breadcrumb.data?.method);
	if (method) data.method = method;
	if (typeof breadcrumb.data?.status_code === "number")
		data.status_code = breadcrumb.data.status_code;
	return {
		category: breadcrumb.category,
		timestamp: breadcrumb.timestamp,
		data,
	};
}

export function sanitizeTelemetryEvent(event: ErrorEvent): ErrorEvent {
	const traceId = safeTraceId(event.contexts?.trace?.trace_id, 32);
	const spanId = safeTraceId(event.contexts?.trace?.span_id, 16);
	return {
		type: undefined,
		event_id: event.event_id,
		timestamp: event.timestamp,
		level: event.level,
		platform: event.platform,
		release: event.release,
		dist: event.dist,
		environment: event.environment,
		sdk: event.sdk,
		contexts:
			traceId && spanId
				? {
						trace: {
							trace_id: traceId,
							span_id: spanId,
							op: safeOperation(event.contexts?.trace?.op),
						},
					}
				: undefined,
		// Keep stack locations for source maps/grouping, never raw messages or local variables.
		exception: event.exception && {
			values: event.exception.values?.map((exception) => ({
				type: safeErrorType(exception.type),
				value: "Application error (details omitted for privacy)",
				mechanism: exception.mechanism && {
					type: "generic",
					handled: exception.mechanism.handled,
				},
				stacktrace: exception.stacktrace && {
					frames: exception.stacktrace.frames?.map((frame) => ({
						filename: safeFrameFilename(frame.filename),
						function:
							frame.function && /^[\w.$<>[\]-]{1,120}$/.test(frame.function)
								? frame.function
								: undefined,
						lineno: frame.lineno,
						colno: frame.colno,
						in_app: frame.in_app,
					})),
				},
			})),
		},
		request: event.request && {
			url: event.request.url
				? sanitizeTelemetryUrl(event.request.url)
				: undefined,
			method: safeMethod(event.request.method),
		},
		breadcrumbs: event.breadcrumbs?.flatMap((breadcrumb) => {
			const safe = sanitizeTelemetryBreadcrumb(breadcrumb);
			return safe ? [safe] : [];
		}),
	};
}

/** Sentry 11 streams spans; beforeSendTransaction does not protect this pipeline. */
export function sanitizeTelemetrySpan(
	span: StreamedSpanJSON,
): StreamedSpanJSON {
	const operation = safeOperation(span.attributes["sentry.op"]);
	const attributes: Record<string, string | number> = {
		"sentry.op": operation,
	};
	for (const key of [
		"http.response.status_code",
		"http.status_code",
		"sentry.sample_rate",
	]) {
		const value = span.attributes[key];
		if (typeof value === "number" && Number.isFinite(value))
			attributes[key] = value;
	}
	const method = safeMethod(span.attributes["http.request.method"]);
	if (method) attributes["http.request.method"] = method;
	for (const key of [
		"url.full",
		"http.url",
		"url.path",
		"http.target",
		"http.route",
	]) {
		const value = span.attributes[key];
		if (typeof value === "string")
			attributes[key] = sanitizeTelemetryUrl(value);
	}
	return {
		trace_id: span.trace_id,
		span_id: span.span_id,
		parent_span_id: span.parent_span_id,
		name: operation,
		start_timestamp: span.start_timestamp,
		end_timestamp: span.end_timestamp,
		status: span.status,
		is_segment: span.is_segment,
		attributes,
	};
}

export function sentryPrivacyIntegration(): Integrations[number] {
	return {
		name: "HoldShelfPrivacy",
		setup(client) {
			client.on("beforeEnvelope", (envelope) => {
				// SDK 11 copies the unsanitized segment name to envelope trace.transaction,
				// outside beforeSendSpan. Span payloads retain their trace/span IDs.
				delete envelope[0].trace;
			});
		},
	};
}

export function getSentryPrivacyOptions() {
	return {
		// Saved articles are fetched from third parties; never attach trace/baggage headers.
		tracePropagationTargets: [],
		integrations: (defaults: Integrations) => [
			...defaults,
			sentryPrivacyIntegration(),
		],
		dataCollection: {
			userInfo: false,
			cookies: false,
			httpHeaders: false,
			httpBodies: [],
			urlQueryParams: false,
			databaseQueryData: false,
			stackFrameVariables: false,
			frameContextLines: 0,
			queues: false,
			graphQL: { document: false, variables: false },
			genAI: { inputs: false, outputs: false },
			mcp: { inputs: false, outputs: false },
		} satisfies NonNullable<BrowserOptions["dataCollection"]>,
		beforeSend: sanitizeTelemetryEvent,
		beforeBreadcrumb: sanitizeTelemetryBreadcrumb,
		beforeSendSpan: sanitizeTelemetrySpan,
		// Defense in depth if logging is enabled by a future SDK integration.
		beforeSendLog: () => null,
	};
}
