import { basename } from 'node:path';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

import schema from '../../schemas/proxy';

import { HttpController } from '../../controllers';
import { getDirname } from '../../lib/utils';

export const autoPrefix: string = basename(getDirname(import.meta.url));

export default function proxyRoute(
	server: FastifyInstance,
	options: FastifyPluginOptions,
	done: (err?: Error | undefined) => void
): void {
	server.get(
		`/*`,
		{
			config: {
				rateLimit: {
					continueExceeding: true,
					max: 1,
					timeWindow: 36e5,
				},
			},
			schema,
		},
		HttpController.get
	);

	done();
}
