import type { FastifyInstance } from 'fastify';

import { getReferrer } from '../../../src/lib/utils';
import { build, resources } from '../../helper';

describe('GET /v1/{url}', (): void => {
	const path = '/v1/';

	const server: FastifyInstance = build();

	const { validUrls, invalidUrls, failUrls } = resources;

	it.each(Object.entries(validUrls))(
		'should return proxied %s response with no cache',
		async (type: string, url: string): Promise<void> => {
			const { statusCode, headers } = await server.inject({
				method: 'GET',
				url: `${path}${url}?cache=0`,
			});

			expect(statusCode).toEqual(200);
			expect(headers['content-type']).toContain(type.toLowerCase());
			expect(headers['cache-control']).toContain('no-cache');
		}
	);

	it.each(Object.entries(validUrls))(
		'should return proxied %s response with custom cache value of 123',
		async (type: string, url: string): Promise<void> => {
			const customCache = 123;

			const { statusCode, headers } = await server.inject({
				method: 'GET',
				url: `${path}${url}?cache=${customCache}`,
			});

			expect(statusCode).toEqual(200);
			expect(headers['content-type']).toContain(type.toLowerCase());
			expect(headers['cache-control']).toContain(`max-age=${customCache}`);
		}
	);

	it.each(Object.entries(validUrls))(
		'should return proxied %s response with custom referrer',
		async (type: string, url: string): Promise<void> => {
			const { statusCode, headers } = await server.inject({
				method: 'GET',
				url: `${path}${url}?referrer=${getReferrer(url)}`,
			});

			expect(statusCode).toEqual(200);
			expect(headers['content-type']).toContain(type.toLowerCase());
		}
	);

	it.each(invalidUrls)(
		'should return code 400 if url is invalid (%s)',
		async (type: string, url: string): Promise<void> => {
			const { statusCode } = await server.inject({
				method: 'GET',
				url: `${path}${url}`,
			});

			expect(statusCode).toBe(400);
			expect(statusCode).not.toBe(200);
		}
	);

	it.each(invalidUrls)(
		'should return code 400 if referrer url is invalid (%s)',
		async (url: string): Promise<void> => {
			const { statusCode } = await server.inject({
				method: 'GET',
				url: `${path}${validUrls.HTML}?referrer=${url}`,
			});

			expect(statusCode).toBe(400);
			expect(statusCode).not.toBe(200);
		}
	);

	it.each(failUrls)(
		'should return error if request fails (%s)',
		async (url: string): Promise<void> => {
			const { statusCode } = await server.inject({
				method: 'GET',
				url: `${path}${url}`,
			});

			expect(statusCode).not.toBe(200);
		}
	);
});
