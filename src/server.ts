import cluster, { type Worker } from 'node:cluster';
import { cpus } from 'node:os';
import fastify from 'fastify';

/* eslint-disable no-console */
async function build(): Promise<void> {
	try {
		const port = Number(process.env.PORT ?? 8080);
		const host: string = process.env.HOST ?? '::';

		const server = fastify({
			logger: false,
			connectionTimeout: 15e3,
			keepAliveTimeout: 15e3,
			pluginTimeout: 3e4,
			requestTimeout: 15e3,
			trustProxy: true,
		});

		await server.register(import('./app'));

		await server.listen({ port, host });
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
}

async function init(): Promise<void> {
	const instance = Number(process.env.INSTANCE ?? 1);
	if (instance !== 1 && instance >= 0 && cluster.isPrimary) {
		const numInstance: number = instance === 0 ? cpus().length : instance;

		console.info(`Primary ${process.pid} is running`);
		console.info(`Launching ${numInstance} workers`);

		for (let i = 0; i < numInstance; i += 1) {
			cluster.fork();
		}

		cluster.on('exit', (worker: Worker, code: number): void => {
			console.info(
				`Worker ${worker.process.pid ?? '(pid not found)'} died. Code: ${code}`
			);
			cluster.fork();
		});

		return;
	}

	await build();
	console.info(`Worker ${process.pid} started`);
}

await init();
