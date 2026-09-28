export type ApiParameter = {
	name: string;
	type: string;
	required?: boolean;
	description: string;
};

export type ApiResponse = {
	status: string;
	description: string;
	body: string;
};

export type ApiEndpoint = {
	method: string;
	path: string;
	summary: string;
	auth: string;
	contentType?: string;
	pathParameters?: ApiParameter[];
	parameters?: ApiParameter[];
	bodyFields?: ApiParameter[];
	responses: ApiResponse[];
	exampleRequest: string;
	exampleResponse: string;
	notes?: string[];
};

export type ApiDocSection = {
	title: string;
	description: string;
	endpoints: ApiEndpoint[];
};
