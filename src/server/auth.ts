import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { getAuth } from "#/lib/auth";
import { getSessionFromHeaders } from "#/server/auth-runtime";

export const getSession = createServerFn({ method: "GET" }).handler(
	async () => {
		const request = getRequest();
		const session = await getSessionFromHeaders({
			headers: request.headers,
			getSessionFn: (input) => getAuth().api.getSession(input),
		});
		return session;
	},
);
