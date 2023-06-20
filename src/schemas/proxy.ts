const proxySchema = {
	params: {
		type: 'object',
		properties: {
			'*': { type: 'string' },
		},
	},
	querystring: {
		type: 'object',
		properties: {
			cache: {
				type: 'number',
				default: 2678400,
				minimum: 0,
			},
			cookie: {
				type: 'string',
			},
			host: {
				type: 'string',
			},
			method: {
				type: 'string',
			},
			redirect: {
				type: 'boolean',
				default: false,
			},
			referrer: {
				type: 'string',
			},
		},
	},
};

export default proxySchema;
