export interface ErrorWithStatusCode extends Error {
	/** HTTP response status code */
	statusCode?: number;
}

export interface GetProxyRequest {
	Params: {
		'*': string;
	};
	Body: string | undefined;
	Querystring: {
		cache: number;
		cookie: string | undefined;
		method: string | undefined;
		redirect: boolean;
		referrer: string | undefined;
	};
}
