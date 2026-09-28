import type { MeResponse } from "@hold-shelf/api-contracts";
import {
	type ApiV1AuthDependencies,
	authenticateApiV1Request,
} from "#/server/api-v1";

export async function handleV1MeGet(
	{ request }: { request: Request },
	deps: ApiV1AuthDependencies = {},
) {
	const auth = await authenticateApiV1Request(request, deps);
	if (!auth.authenticated) {
		return auth.response;
	}

	const response: MeResponse = { authenticated: true };
	return Response.json(response);
}
