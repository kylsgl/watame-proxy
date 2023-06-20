import fastify, { type FastifyInstance } from 'fastify';

export const resources = {
	validUrls: {
		HTML: 'https://httpbin.org',
		JPEG: 'https://httpbin.org/image/jpeg',
	},

	invalidUrls: ['https://invalid', 'invalid.link'],

	failUrls: ['https://httpbin.org/status/404', 'https://localhost.com'],

	requestMethods: {
		valid: {
			GET: 'https://httpbin.org/status/200',
			POST: 'https://httpbin.org/status/200',
		},
		invalid: {
			HEAD: 'https://httpbin.org/status/200',
		},
	},

	requestHeaders: {
		host: 'localhost',
		'accept-language': 'en-US,en;q=0.5',
		cookie: 'enabled=false',
		connection: 'keep-alive',
	},

	replyHeaders: {
		'content-encoding': 'gzip',
		'content-length': '123',
		'content-type': 'text/html; charset=UTF-8',
		connection: 'keep-alive',
	},
};

export function build(): FastifyInstance {
	const server: FastifyInstance = fastify({
		logger: false,
		connectionTimeout: 2e4,
		keepAliveTimeout: 1e4,
		pluginTimeout: 2e4,
		requestTimeout: 1e3,
	});

	beforeAll(async (): Promise<void> => {
		//! https://github.com/fastify/fastify-autoload/issues/230
		//! https://github.com/vitest-dev/vitest/issues/2028

		//! "code": "ERR_UNKNOWN_FILE_EXTENSION"
		//! await server.register(import('../src/app'));

		await server.register(import('../src/routes/index'));
		await server.register(import('../src/routes/v1/proxy'), { prefix: '/v1' });
		await server.register(import('../src/routes/v2/proxy'), { prefix: '/v2' });

		await server.ready();
	});

	afterAll(async (): Promise<void> => {
		await server.close();
	});

	return server;
}
