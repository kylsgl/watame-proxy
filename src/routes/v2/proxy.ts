import { basename } from 'node:path';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

import schema from '../../schemas/proxy';

import { UndiciController } from '../../controllers';
import { getDirname } from '../../lib/utils';

export const autoPrefix: string = basename(getDirname(import.meta.url));

export default function proxyRoute(
	server: FastifyInstance,
	options: FastifyPluginOptions,
	done: (err?: Error | undefined) => void
): void {
	server.all(
		`/*`,
		{
			config: {
				rateLimit: {
					max: 3e2,
					timeWindow: 3e5,
				},
			},
			schema,
		},
		UndiciController.all
	);

	done();
}
