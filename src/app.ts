import { join } from 'node:path';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

import { getDirname } from './lib/utils';

export default async function app(
	server: FastifyInstance,
	options: FastifyPluginOptions,
	done: (err?: Error | undefined) => void
): Promise<void> {
	await server.register(import('@fastify/helmet'), {
		global: true,
		crossOriginResourcePolicy: { policy: 'cross-origin' },
		dnsPrefetchControl: false,
		hsts: false,
		ieNoOpen: false,
		xssFilter: false,
	});

	await server.register(import('@fastify/rate-limit'), {
		global: true,
		ban: undefined,
		cache: 25e2,
		max: 2,
		timeWindow: 3e5,
	});

	await server.register(import('@fastify/autoload'), {
		dir: join(getDirname(import.meta.url), 'routes'),
		dirNameRoutePrefix: false,
		ignorePattern: /.*(test|spec|disable).js/,
	});

	done();
}
