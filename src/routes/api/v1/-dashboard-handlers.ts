import type { DashboardResponse } from "@hold-shelf/api-contracts";
import {
	type ApiV1AuthDependencies,
	authenticateApiV1Request,
	createApiInternalErrorResponse,
} from "#/server/api-v1";
import {
	type DashboardRepository,
	handleGetDashboardStats,
} from "#/server/dashboard-runtime";

type V1DashboardDependencies = ApiV1AuthDependencies & {
	createDashboardRepositoryFn?: () => DashboardRepository;
	getDashboardStatsFn?: typeof handleGetDashboardStats;
};

export async function handleV1DashboardGet(
	{ request }: { request: Request },
	deps: V1DashboardDependencies = {},
) {
	const auth = await authenticateApiV1Request(request, deps);
	if (!auth.authenticated) {
		return auth.response;
	}

	try {
		const stats: DashboardResponse = await (
			deps.getDashboardStatsFn ?? handleGetDashboardStats
		)({
			repo: await getDashboardRepository(deps),
			requireUserIdFn: async () => auth.userId,
		});
		return Response.json(stats);
	} catch (error) {
		return createApiInternalErrorResponse(
			"DASHBOARD_FAILED",
			"Failed to load dashboard stats.",
			error,
		);
	}
}

async function getDashboardRepository(deps: V1DashboardDependencies) {
	return deps.createDashboardRepositoryFn
		? deps.createDashboardRepositoryFn()
		: (
				await import("#/server/dashboard-repository")
			).createDashboardRepository();
}
