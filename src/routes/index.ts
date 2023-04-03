import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

import { HomeController } from '../controllers';

export default function homeRoute(
	server: FastifyInstance,
	options: FastifyPluginOptions,
	done: (err?: Error | undefined) => void
): void {
	server.get(
		`/`,
		{
			config: {
				rateLimit: {
					continueExceeding: true,
					max: 5,
					timeWindow: 6e4,
				},
			},
			schema: {
				response: {
					200: {
						type: 'string',
					},
				},
			},
		},
		HomeController.get
	);

	done();
}
