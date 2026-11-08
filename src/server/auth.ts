import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { getAuth } from "#/lib/auth";
import { getSessionFromHeaders } from "#/server/auth-runtime";

/**
 * Route guard check. Returns only a boolean so the session and user record
 * never enter route context or SSR hydration data; components that show the
 * user read it from `authClient.useSession()`.
 */
export const isSignedIn = createServerFn({ method: "GET" }).handler(
	async () => {
		const request = getRequest();
		const session = await getSessionFromHeaders({
			headers: request.headers,
			getSessionFn: (input) => getAuth().api.getSession(input),
		});
		return session !== null;
	},
);
