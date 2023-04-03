import type { FastifyInstance } from 'fastify';

import { build } from '../helper';

describe('GET /', (): void => {
	const path = '/';

	const server: FastifyInstance = build();

	it('should return 200', async (): Promise<void> => {
		const { statusCode, headers } = await server.inject({
			method: 'GET',
			url: `${path}`,
		});

		expect(statusCode).toEqual(200);
		expect(headers['content-type']).toContain('text/plain; charset=utf-8');
	});
});
